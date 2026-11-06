import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from ..database import get_db
from ..auth import get_current_student

router = APIRouter(prefix="/api", tags=["Subjects & Topics"])

class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = ""
    color: Optional[str] = "#2563eb"
    description: Optional[str] = ""

class TopicCreate(BaseModel):
    subject_id: int
    title: str
    difficulty: Optional[str] = "Medium"
    notes: Optional[str] = ""
    attachments: Optional[Any] = []

class TopicAttachmentsUpdate(BaseModel):
    attachments: Any

@router.get("/subjects")
def list_subjects(current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.*, COUNT(t.id) as topic_count
    FROM subjects s
    LEFT JOIN topics t ON s.id = t.subject_id
    WHERE s.student_id = ?
    GROUP BY s.id
    ORDER BY s.name ASC
    """, (current_student["id"],))
    rows = cursor.fetchall()
    conn.close()
    return {"status": "success", "subjects": [dict(r) for r in rows]}

@router.post("/subjects")
def create_subject(req: SubjectCreate, current_student: dict = Depends(get_current_student)):
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Subject name cannot be empty.")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO subjects (student_id, name, code, color, description)
    VALUES (?, ?, ?, ?, ?)
    """, (current_student["id"], req.name.strip(), req.code.strip(), req.color, req.description.strip()))
    subject_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Subject created successfully.", "id": subject_id}

@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subjects WHERE id = ? AND student_id = ?", (subject_id, current_student["id"]))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Subject deleted successfully."}

@router.get("/topics")
def list_topics(subject_id: Optional[int] = None, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    if subject_id:
        cursor.execute("""
        SELECT t.*, s.name as subject_name, s.color as subject_color
        FROM topics t
        JOIN subjects s ON t.subject_id = s.id
        WHERE t.student_id = ? AND t.subject_id = ?
        ORDER BY t.title ASC
        """, (current_student["id"], subject_id))
    else:
        cursor.execute("""
        SELECT t.*, s.name as subject_name, s.color as subject_color
        FROM topics t
        JOIN subjects s ON t.subject_id = s.id
        WHERE t.student_id = ?
        ORDER BY s.name ASC, t.title ASC
        """, (current_student["id"],))
    rows = cursor.fetchall()
    conn.close()
    parsed_topics = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("attachments"), str):
            try:
                d["attachments"] = json.loads(d["attachments"])
            except Exception:
                d["attachments"] = []
        elif not d.get("attachments"):
            d["attachments"] = []
        parsed_topics.append(d)
    return {"status": "success", "topics": parsed_topics}

@router.post("/topics")
def create_topic(req: TopicCreate, current_student: dict = Depends(get_current_student)):
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Topic title cannot be empty.")

    conn = get_db()
    cursor = conn.cursor()
    # Verify subject belongs to student
    cursor.execute("SELECT id FROM subjects WHERE id = ? AND student_id = ?", (req.subject_id, current_student["id"]))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Subject not found.")

    diff = req.difficulty if req.difficulty in ["Easy", "Medium", "Hard"] else "Medium"
    att_str = json.dumps(req.attachments) if isinstance(req.attachments, list) else (req.attachments or "[]")
    cursor.execute("""
    INSERT INTO topics (student_id, subject_id, title, difficulty, notes, attachments)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (current_student["id"], req.subject_id, req.title.strip(), diff, req.notes.strip(), att_str))
    topic_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Topic created successfully.", "id": topic_id}

@router.put("/topics/{topic_id}/attachments")
def update_topic_attachments(topic_id: int, req: TopicAttachmentsUpdate, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM topics WHERE id = ? AND student_id = ?", (topic_id, current_student["id"]))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Topic not found.")

    att_str = json.dumps(req.attachments) if isinstance(req.attachments, list) else (req.attachments or "[]")
    cursor.execute("UPDATE topics SET attachments = ? WHERE id = ?", (att_str, topic_id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Attachments updated successfully."}

@router.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM topics WHERE id = ? AND student_id = ?", (topic_id, current_student["id"]))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Topic deleted successfully."}
