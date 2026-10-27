import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from ..database import get_db
from ..auth import get_current_student

router = APIRouter(prefix="/api/quizzes", tags=["Quiz Center"])

class QuizSubmission(BaseModel):
    answers: Dict[int, str] # { question_id: "A" | "B" | "C" | "D" }

class CustomQuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str # "A" | "B" | "C" | "D"
    explanation: Optional[str] = ""

@router.get("/topics")
def get_quiz_topics(current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT t.id, t.title, t.difficulty, s.name as subject_name, s.color as subject_color,
           COUNT(qq.id) as question_count,
           MAX(qa.score) as highest_score,
           (SELECT score FROM quiz_attempts WHERE topic_id = t.id AND student_id = ? ORDER BY id DESC LIMIT 1) as latest_score
    FROM topics t
    JOIN subjects s ON t.subject_id = s.id
    LEFT JOIN quiz_questions qq ON t.id = qq.topic_id
    LEFT JOIN quiz_attempts qa ON t.id = qa.topic_id AND qa.student_id = ?
    WHERE t.student_id = ?
    GROUP BY t.id
    ORDER BY s.name ASC, t.title ASC
    """, (current_student["id"], current_student["id"], current_student["id"]))
    rows = cursor.fetchall()
    conn.close()
    return {"status": "success", "topics": [dict(r) for r in rows]}

@router.get("/{topic_id}/questions")
def get_topic_questions(topic_id: int, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()

    # Verify topic exists
    cursor.execute("SELECT id, title FROM topics WHERE id = ? AND student_id = ?", (topic_id, current_student["id"]))
    topic = cursor.fetchone()
    if not topic:
        conn.close()
        raise HTTPException(status_code=404, detail="Topic not found.")

    cursor.execute("""
    SELECT id, question_text, option_a, option_b, option_c, option_d
    FROM quiz_questions
    WHERE topic_id = ?
    ORDER BY id ASC
    """, (topic_id,))
    questions = cursor.fetchall()
    conn.close()

    return {
        "status": "success",
        "topic": dict(topic),
        "questions": [dict(q) for q in questions]
    }

@router.post("/{topic_id}/attempt")
def submit_quiz_attempt(
    topic_id: int,
    submission: QuizSubmission,
    current_student: dict = Depends(get_current_student)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, title, difficulty FROM topics WHERE id = ? AND student_id = ?", (topic_id, current_student["id"]))
    topic = cursor.fetchone()
    if not topic:
        conn.close()
        raise HTTPException(status_code=404, detail="Topic not found.")

    cursor.execute("SELECT * FROM quiz_questions WHERE topic_id = ?", (topic_id,))
    questions = cursor.fetchall()
    if not questions:
        conn.close()
        raise HTTPException(status_code=400, detail="No quiz questions available for this topic.")

    total = len(questions)
    correct_count = 0
    mistakes_count = 0
    detailed_results = []

    for q in questions:
        q_id = q["id"]
        student_ans = submission.answers.get(q_id, "").upper().strip()
        correct_ans = q["correct_option"].upper().strip()
        is_correct = (student_ans == correct_ans)

        if is_correct:
            correct_count += 1
        else:
            mistakes_count += 1

        detailed_results.append({
            "question_id": q_id,
            "question_text": q["question_text"],
            "options": {
                "A": q["option_a"],
                "B": q["option_b"],
                "C": q["option_c"],
                "D": q["option_d"]
            },
            "student_answer": student_ans,
            "correct_answer": correct_ans,
            "is_correct": is_correct,
            "explanation": q["explanation"]
        })

    score_pct = round((correct_count / total) * 100.0, 1) if total > 0 else 0.0

    # Save to quiz_attempts table
    cursor.execute("""
    INSERT INTO quiz_attempts (student_id, topic_id, score, total_questions, correct_count, mistakes_count, answers_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        current_student["id"],
        topic_id,
        score_pct,
        total,
        correct_count,
        mistakes_count,
        json.dumps(submission.answers)
    ))
    attempt_id = cursor.lastrowid

    # Automatically synchronize with study_sessions digital memory
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("""
    SELECT id, revisions_count FROM study_sessions 
    WHERE student_id = ? AND topic_id = ?
    ORDER BY id DESC LIMIT 1
    """, (current_student["id"], topic_id))
    last_session = cursor.fetchone()

    outcome = "retained" if score_pct >= 75.0 else "needs_revision"

    if last_session:
        # Update latest session or increment revision
        cursor.execute("""
        UPDATE study_sessions
        SET quiz_score = ?, mistakes_count = ?, outcome = ?, study_date = ?
        WHERE id = ?
        """, (score_pct, mistakes_count, outcome, today, last_session["id"]))
    else:
        # Create fresh session entry
        cursor.execute("""
        INSERT INTO study_sessions 
        (student_id, topic_id, study_date, duration_minutes, difficulty, quiz_score, mistakes_count, revisions_count, notes, outcome)
        VALUES (?, ?, ?, 30, ?, ?, ?, 0, 'Quiz completed', ?)
        """, (current_student["id"], topic_id, today, topic["difficulty"], score_pct, mistakes_count, outcome))

    conn.commit()
    conn.close()

    return {
        "status": "success",
        "attempt_id": attempt_id,
        "topic_id": topic_id,
        "topic_title": topic["title"],
        "score": score_pct,
        "total_questions": total,
        "correct_count": correct_count,
        "mistakes_count": mistakes_count,
        "detailed_results": detailed_results
    }

@router.get("/history")
def get_quiz_history(current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT qa.*, t.title as topic_title, s.name as subject_name, s.color as subject_color
    FROM quiz_attempts qa
    JOIN topics t ON qa.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE qa.student_id = ?
    ORDER BY qa.taken_at DESC
    """, (current_student["id"],))
    rows = cursor.fetchall()
    conn.close()

    return {"status": "success", "attempts": [dict(r) for r in rows]}

@router.post("/{topic_id}/questions")
def add_custom_question(
    topic_id: int,
    req: CustomQuestionCreate,
    current_student: dict = Depends(get_current_student)
):
    if req.correct_option.upper() not in ["A", "B", "C", "D"]:
        raise HTTPException(status_code=400, detail="Correct option must be A, B, C, or D.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM topics WHERE id = ? AND student_id = ?", (topic_id, current_student["id"]))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Topic not found.")

    cursor.execute("""
    INSERT INTO quiz_questions 
    (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student')
    """, (
        topic_id,
        req.question_text.strip(),
        req.option_a.strip(),
        req.option_b.strip(),
        req.option_c.strip(),
        req.option_d.strip(),
        req.correct_option.upper(),
        req.explanation.strip()
    ))
    q_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Question added to quiz bank.", "id": q_id}
