from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..auth import get_current_student

router = APIRouter(prefix="/api/sessions", tags=["Study Sessions & Digital Memory"])

class SessionCreate(BaseModel):
    topic_id: int
    study_date: str # YYYY-MM-DD
    duration_minutes: int
    difficulty: Optional[str] = "Medium"
    quiz_score: Optional[float] = None
    mistakes_count: Optional[int] = 0
    revisions_count: Optional[int] = 0
    notes: Optional[str] = ""
    outcome: Optional[str] = "pending"

class SessionUpdate(BaseModel):
    study_date: Optional[str] = None
    duration_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    quiz_score: Optional[float] = None
    mistakes_count: Optional[int] = None
    revisions_count: Optional[int] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None

@router.get("")
def list_sessions(
    search: Optional[str] = None,
    subject_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    outcome: Optional[str] = None,
    current_student: dict = Depends(get_current_student)
):
    conn = get_db()
    cursor = conn.cursor()

    query = """
    SELECT ss.*, t.title as topic_title, s.id as subject_id, s.name as subject_name, s.color as subject_color
    FROM study_sessions ss
    JOIN topics t ON ss.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE ss.student_id = ?
    """
    params = [current_student["id"]]

    if search:
        query += " AND (t.title LIKE ? OR ss.notes LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard])

    if subject_id:
        query += " AND s.id = ?"
        params.append(subject_id)

    if difficulty:
        query += " AND ss.difficulty = ?"
        params.append(difficulty)

    if outcome:
        query += " AND ss.outcome = ?"
        params.append(outcome)

    query += " ORDER BY ss.study_date DESC, ss.id DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return {"status": "success", "sessions": [dict(r) for r in rows]}

@router.post("")
def create_session(req: SessionCreate, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()

    # Verify topic exists and belongs to student
    cursor.execute("SELECT id FROM topics WHERE id = ? AND student_id = ?", (req.topic_id, current_student["id"]))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Topic not found.")

    diff = req.difficulty if req.difficulty in ["Easy", "Medium", "Hard"] else "Medium"
    outcome = req.outcome if req.outcome in ["retained", "needs_revision", "pending"] else "pending"

    cursor.execute("""
    INSERT INTO study_sessions 
    (student_id, topic_id, study_date, duration_minutes, difficulty, quiz_score, mistakes_count, revisions_count, notes, outcome)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        current_student["id"],
        req.topic_id,
        req.study_date,
        req.duration_minutes,
        diff,
        req.quiz_score,
        req.mistakes_count or 0,
        req.revisions_count or 0,
        req.notes or "",
        outcome
    ))
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Study session logged into Digital Memory.", "id": session_id}

@router.put("/{session_id}")
def update_session(session_id: int, req: SessionUpdate, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM study_sessions WHERE id = ? AND student_id = ?", (session_id, current_student["id"]))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Study session not found.")

    updated_date = req.study_date if req.study_date is not None else existing["study_date"]
    updated_dur = req.duration_minutes if req.duration_minutes is not None else existing["duration_minutes"]
    updated_diff = req.difficulty if req.difficulty is not None else existing["difficulty"]
    updated_score = req.quiz_score if req.quiz_score is not None else existing["quiz_score"]
    updated_mistakes = req.mistakes_count if req.mistakes_count is not None else existing["mistakes_count"]
    updated_revisions = req.revisions_count if req.revisions_count is not None else existing["revisions_count"]
    updated_notes = req.notes if req.notes is not None else existing["notes"]
    updated_outcome = req.outcome if req.outcome is not None else existing["outcome"]

    cursor.execute("""
    UPDATE study_sessions
    SET study_date = ?, duration_minutes = ?, difficulty = ?, quiz_score = ?,
        mistakes_count = ?, revisions_count = ?, notes = ?, outcome = ?
    WHERE id = ? AND student_id = ?
    """, (
        updated_date, updated_dur, updated_diff, updated_score,
        updated_mistakes, updated_revisions, updated_notes, updated_outcome,
        session_id, current_student["id"]
    ))
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Study session updated."}

@router.delete("/{session_id}")
def delete_session(session_id: int, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM study_sessions WHERE id = ? AND student_id = ?", (session_id, current_student["id"]))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Study session deleted."}
