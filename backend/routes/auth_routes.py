from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from ..database import get_db, hash_password, verify_password
from ..auth import create_session, revoke_session, get_current_student

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    subjects_interest: Optional[str] = ""
    study_goals: Optional[str] = "Master core concepts and improve exam retention"
    daily_target_minutes: Optional[int] = 60

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    name: str
    study_goals: Optional[str] = ""
    daily_target_minutes: Optional[int] = 60
    subjects_interest: Optional[str] = ""

@router.post("/register")
def register(req: RegisterRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM students WHERE email = ?", (req.email.lower(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this email address already exists."
        )

    hashed, salt = hash_password(req.password)
    cursor.execute("""
    INSERT INTO students (name, email, password_hash, salt, subjects_interest, study_goals, daily_target_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        req.name.strip(),
        req.email.lower(),
        hashed,
        salt,
        req.subjects_interest,
        req.study_goals,
        req.daily_target_minutes
    ))
    student_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = create_session(student_id)
    return {
        "status": "success",
        "message": "Student account registered successfully.",
        "token": token,
        "student": {
            "id": student_id,
            "name": req.name.strip(),
            "email": req.email.lower(),
            "study_goals": req.study_goals,
            "daily_target_minutes": req.daily_target_minutes
        }
    }

@router.post("/login")
def login(req: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE email = ?", (req.email.lower(),))
    student = cursor.fetchone()

    if not student or not verify_password(req.password, student["password_hash"], student["salt"]):
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    student_id = student["id"]
    token = create_session(student_id)
    student_data = {
        "id": student["id"],
        "name": student["name"],
        "email": student["email"],
        "subjects_interest": student["subjects_interest"],
        "study_goals": student["study_goals"],
        "daily_target_minutes": student["daily_target_minutes"]
    }
    conn.close()

    return {
        "status": "success",
        "message": "Logged in successfully.",
        "token": token,
        "student": student_data
    }

@router.post("/demo-login")
def demo_login():
    """Convenient 1-click login into demo student Alex Chen"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE email = 'alex.student@example.com'")
    student = cursor.fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Demo student not found. Please restart server.")

    token = create_session(student["id"])
    student_data = {
        "id": student["id"],
        "name": student["name"],
        "email": student["email"],
        "subjects_interest": student["subjects_interest"],
        "study_goals": student["study_goals"],
        "daily_target_minutes": student["daily_target_minutes"]
    }
    conn.close()

    return {
        "status": "success",
        "message": "Logged in as Demo Student (Alex Chen).",
        "token": token,
        "student": student_data
    }

@router.post("/logout")
def logout(current_student: dict = Depends(get_current_student)):
    # Handled on client by clearing token; endpoint clears database session
    return {"status": "success", "message": "Logged out successfully."}

@router.get("/me")
def get_profile(current_student: dict = Depends(get_current_student)):
    return {"status": "success", "student": current_student}

@router.put("/profile")
def update_profile(req: ProfileUpdateRequest, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE students 
    SET name = ?, study_goals = ?, daily_target_minutes = ?, subjects_interest = ?
    WHERE id = ?
    """, (req.name.strip(), req.study_goals, req.daily_target_minutes, req.subjects_interest, current_student["id"]))
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Profile updated successfully."}
