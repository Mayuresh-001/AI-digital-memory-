from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..auth import get_current_student
from ..revision_planner import get_student_revision_plan

router = APIRouter(prefix="/api/planner", tags=["AI Revision Planner"])

class MarkRevisedRequest(BaseModel):
    notes: Optional[str] = "Completed revision session"
    duration_minutes: Optional[int] = 30

@router.get("/recommendations")
def get_recommendations(current_student: dict = Depends(get_current_student)):
    plan = get_student_revision_plan(current_student["id"])

    high_count = sum(1 for item in plan if item["priority"] == "HIGH")
    med_count = sum(1 for item in plan if item["priority"] == "MEDIUM")
    low_count = sum(1 for item in plan if item["priority"] == "LOW")

    # Select primary topic for "What should I study today?"
    study_today_topic = plan[0] if plan else None

    return {
        "status": "success",
        "summary": {
            "total_topics": len(plan),
            "high_priority_count": high_count,
            "medium_priority_count": med_count,
            "low_priority_count": low_count,
            "needs_urgent_revision": high_count > 0
        },
        "study_today": study_today_topic,
        "recommendations": plan
    }

@router.post("/revise/{topic_id}")
def mark_topic_revised(
    topic_id: int,
    req: MarkRevisedRequest,
    current_student: dict = Depends(get_current_student)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, title, difficulty FROM topics WHERE id = ? AND student_id = ?", (topic_id, current_student["id"]))
    topic = cursor.fetchone()
    if not topic:
        conn.close()
        raise HTTPException(status_code=404, detail="Topic not found.")

    today = datetime.now().strftime("%Y-%m-%d")

    # Check latest study session
    cursor.execute("""
    SELECT id, revisions_count, quiz_score, mistakes_count 
    FROM study_sessions 
    WHERE student_id = ? AND topic_id = ? 
    ORDER BY id DESC LIMIT 1
    """, (current_student["id"], topic_id))
    last_session = cursor.fetchone()

    prior_revisions = last_session["revisions_count"] if last_session else 0
    new_revisions = prior_revisions + 1

    # Record into revisions table
    cursor.execute("""
    INSERT INTO revisions (student_id, topic_id, revision_date, notes, outcome)
    VALUES (?, ?, ?, ?, 'completed')
    """, (current_student["id"], topic_id, today, req.notes))

    # Update or insert study session with fresh date and incremented revision count
    if last_session:
        cursor.execute("""
        UPDATE study_sessions
        SET study_date = ?, revisions_count = ?, notes = notes || ' | Revised: ' || ?, outcome = 'retained'
        WHERE id = ?
        """, (today, new_revisions, req.notes, last_session["id"]))
    else:
        cursor.execute("""
        INSERT INTO study_sessions 
        (student_id, topic_id, study_date, duration_minutes, difficulty, quiz_score, mistakes_count, revisions_count, notes, outcome)
        VALUES (?, ?, ?, ?, ?, 80.0, 0, 1, ?, 'retained')
        """, (current_student["id"], topic_id, today, req.duration_minutes or 30, topic["difficulty"], req.notes))

    conn.commit()
    conn.close()

    # Get updated plan
    updated_plan = get_student_revision_plan(current_student["id"])
    updated_topic = next((item for item in updated_plan if item["topic_id"] == topic_id), None)

    return {
        "status": "success",
        "message": f"Topic '{topic['title']}' marked as revised today. Memory stability updated!",
        "topic": updated_topic
    }
