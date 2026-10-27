from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from ..database import get_db
from ..auth import get_current_student
from ..revision_planner import get_student_revision_plan

router = APIRouter(prefix="/api/analytics", tags=["Learning Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(current_student: dict = Depends(get_current_student)):
    student_id = current_student["id"]
    conn = get_db()
    cursor = conn.cursor()

    # 1. Total Topics
    cursor.execute("SELECT COUNT(*) as cnt FROM topics WHERE student_id = ?", (student_id,))
    total_topics = cursor.fetchone()["cnt"]

    # 2. Total Sessions & Study Minutes
    cursor.execute("""
    SELECT COUNT(*) as session_count, COALESCE(SUM(duration_minutes), 0) as total_minutes, AVG(quiz_score) as avg_score
    FROM study_sessions 
    WHERE student_id = ?
    """, (student_id,))
    sess_stats = cursor.fetchone()
    total_sessions = sess_stats["session_count"]
    total_minutes = sess_stats["total_minutes"]
    avg_score = round(sess_stats["avg_score"], 1) if sess_stats["avg_score"] is not None else 0.0

    # 3. Revision Plan and Priority Breakdown
    plan = get_student_revision_plan(student_id)
    high_priority = [t for t in plan if t["priority"] == "HIGH"]
    med_priority = [t for t in plan if t["priority"] == "MEDIUM"]
    low_priority = [t for t in plan if t["priority"] == "LOW"]

    avg_retention = round(sum(t["retention_health_pct"] for t in plan) / max(1, len(plan)), 1)

    # 4. Quiz Score Trends (chronological)
    cursor.execute("""
    SELECT qa.taken_at, qa.score, t.title as topic_title
    FROM quiz_attempts qa
    JOIN topics t ON qa.topic_id = t.id
    WHERE qa.student_id = ?
    ORDER BY qa.taken_at ASC
    LIMIT 15
    """, (student_id,))
    score_trends = [
        {
            "date": r["taken_at"][:10],
            "score": round(r["score"], 1),
            "topic": r["topic_title"]
        }
        for r in cursor.fetchall()
    ]

    # 5. Study Time by Subject
    cursor.execute("""
    SELECT s.name as subject_name, s.color as subject_color, COALESCE(SUM(ss.duration_minutes), 0) as minutes
    FROM subjects s
    LEFT JOIN topics t ON s.id = t.subject_id
    LEFT JOIN study_sessions ss ON t.id = ss.topic_id AND ss.student_id = ?
    WHERE s.student_id = ?
    GROUP BY s.id
    ORDER BY minutes DESC
    """, (student_id, student_id))
    time_by_subject = [dict(r) for r in cursor.fetchall()]

    # 6. Weekly Study Time (Past 7 days)
    today = datetime.now().date()
    days_map = {}
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        days_map[d.strftime("%Y-%m-%d")] = {"day_label": d.strftime("%a"), "minutes": 0}

    cursor.execute("""
    SELECT study_date, SUM(duration_minutes) as mins
    FROM study_sessions
    WHERE student_id = ? AND study_date >= ?
    GROUP BY study_date
    """, (student_id, (today - timedelta(days=6)).strftime("%Y-%m-%d")))
    for r in cursor.fetchall():
        s_date = r["study_date"]
        if s_date in days_map:
            days_map[s_date]["minutes"] = r["mins"]

    weekly_study = list(days_map.values())

    # 7. Recent Study Activity Feed
    cursor.execute("""
    SELECT ss.id, ss.study_date, ss.duration_minutes, ss.difficulty, ss.quiz_score, ss.outcome,
           t.title as topic_title, s.name as subject_name, s.color as subject_color
    FROM study_sessions ss
    JOIN topics t ON ss.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE ss.student_id = ?
    ORDER BY ss.study_date DESC, ss.id DESC
    LIMIT 6
    """, (student_id,))
    recent_activity = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "status": "success",
        "kpis": {
            "total_topics": total_topics,
            "total_sessions": total_sessions,
            "total_study_minutes": total_minutes,
            "average_quiz_score": avg_score,
            "topics_needing_revision": len(high_priority) + len(med_priority),
            "high_priority_count": len(high_priority),
            "medium_priority_count": len(med_priority),
            "low_priority_count": len(low_priority),
            "overall_retention_health": avg_retention
        },
        "study_today": plan[0] if plan else None,
        "charts": {
            "score_trends": score_trends,
            "time_by_subject": time_by_subject,
            "weekly_study": weekly_study,
            "priority_distribution": {
                "High": len(high_priority),
                "Medium": len(med_priority),
                "Low": len(low_priority)
            }
        },
        "recent_activity": recent_activity
    }
