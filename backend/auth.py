import os
import secrets
from datetime import datetime, timedelta
from fastapi import HTTPException, Security, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .database import get_db

security = HTTPBearer(auto_error=False)

def create_session(student_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=7)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO sessions (token, student_id, expires_at)
    VALUES (?, ?, ?)
    """, (token, student_id, expires_at.strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()
    return token

def revoke_session(token: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

def get_current_student(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Check custom header or query param
        token = request.headers.get("X-Session-Token") or request.query_params.get("token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in."
        )

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.id, s.name, s.email, s.subjects_interest, s.study_goals, s.daily_target_minutes, sess.expires_at
    FROM sessions sess
    JOIN students s ON sess.student_id = s.id
    WHERE sess.token = ?
    """, (token,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalid or expired. Please log in again."
        )

    # Check expiration
    expires_at = datetime.strptime(row["expires_at"], "%Y-%m-%d %H:%M:%S")
    if datetime.now() > expires_at:
        cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please log in again."
        )

    student = dict(row)
    conn.close()
    return student
