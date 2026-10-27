import math
from datetime import datetime
from .database import get_db
from .ml_engine import ml_engine

def get_difficulty_multiplier(diff: str) -> float:
    diff_lower = (diff or "Medium").lower()
    if diff_lower == "easy":
        return 1.35
    elif diff_lower == "hard":
        return 0.75
    return 1.0

def get_difficulty_level(diff: str) -> int:
    diff_lower = (diff or "Medium").lower()
    if diff_lower == "easy":
        return 1
    elif diff_lower == "hard":
        return 3
    return 2

def calculate_topic_revision_status(topic_data: dict) -> dict:
    now = datetime.now()
    
    # 1. Parse elapsed days
    last_studied_str = topic_data.get("study_date")
    if last_studied_str:
        try:
            last_dt = datetime.strptime(last_studied_str, "%Y-%m-%d")
        except ValueError:
            last_dt = datetime.fromisoformat(last_studied_str)
        days_elapsed = max(0.1, round((now - last_dt).total_seconds() / 86400.0, 1))
    else:
        # Never studied
        days_elapsed = 14.0

    quiz_score = topic_data.get("quiz_score")
    if quiz_score is None:
        quiz_score = 65.0  # neutral assumption if not yet tested
        has_quiz = False
    else:
        quiz_score = float(quiz_score)
        has_quiz = True

    mistakes = int(topic_data.get("mistakes_count") or 0)
    revisions = int(topic_data.get("revisions_count") or 0)
    duration = int(topic_data.get("duration_minutes") or 45)
    diff = topic_data.get("difficulty") or "Medium"
    diff_level = get_difficulty_level(diff)
    diff_mult = get_difficulty_multiplier(diff)

    # 2. Transparent Rule-Based Spaced Repetition (Ebbinghaus decay curve)
    # Stability S grows with repetitions and mastery, drops with difficulty and mistakes
    score_factor = max(0.3, quiz_score / 100.0)
    mistake_penalty = max(0.5, 1.0 - (mistakes * 0.12))
    stability_days = (2.5 * (1.0 + 0.7 * revisions) * score_factor * diff_mult * mistake_penalty)
    
    # Retention probability R = e^(-t / S)
    rule_retention = math.exp(-days_elapsed / max(0.5, stability_days))
    rule_retention_pct = round(max(5.0, min(99.0, rule_retention * 100.0)), 1)

    # 3. ML Inference
    ml_res = ml_engine.predict(
        days=days_elapsed,
        score=quiz_score,
        mistakes=mistakes,
        revisions=revisions,
        duration=duration,
        difficulty_level=diff_level
    )
    ml_forgetting_proba = ml_res["consensus_forgetting_probability"]
    ml_retention_pct = round((1.0 - ml_forgetting_proba) * 100.0, 1)

    # 4. Integrated Hybrid Score (50% Rule-based Ebbinghaus + 50% Scikit-Learn ML)
    combined_retention = round(0.5 * rule_retention_pct + 0.5 * ml_retention_pct, 1)
    priority_score = round(100.0 - combined_retention, 1)

    # 5. Priority Classification
    if priority_score >= 60.0 or days_elapsed >= 7 or (has_quiz and quiz_score < 60):
        priority = "HIGH"
        priority_badge = "High Priority"
    elif priority_score >= 35.0 or days_elapsed >= 4:
        priority = "MEDIUM"
        priority_badge = "Medium Priority"
    else:
        priority = "LOW"
        priority_badge = "Low Priority"

    # 6. Generate Contextual Diagnostic Explanation
    reasons = []
    if days_elapsed >= 6:
        reasons.append(f"{days_elapsed:.0f} days have elapsed since your last study session")
    elif days_elapsed >= 3:
        reasons.append(f"{days_elapsed:.0f} days have passed since your last review")
    else:
        reasons.append(f"recently studied {days_elapsed:.1f} days ago")

    if has_quiz:
        if quiz_score < 60:
            reasons.append(f"latest quiz score was low ({quiz_score:.0f}%)")
        elif quiz_score < 80:
            reasons.append(f"quiz score was moderate ({quiz_score:.0f}%)")
        else:
            reasons.append(f"strong quiz performance ({quiz_score:.0f}%)")

    if mistakes > 0:
        reasons.append(f"{mistakes} mistake{'s' if mistakes > 1 else ''} recorded")

    if revisions == 0:
        reasons.append("no follow-up revisions completed yet")
    else:
        reasons.append(f"{revisions} revision{'s' if revisions > 1 else ''} completed")

    if priority == "HIGH":
        explanation = f"HIGH PRIORITY - Revise {topic_data['title']} today because {reasons[0]}, {reasons[1] if len(reasons) > 1 else ''}, and {reasons[2] if len(reasons) > 2 else ''}."
    elif priority == "MEDIUM":
        explanation = f"MEDIUM PRIORITY - Schedule revision for {topic_data['title']} soon. {reasons[0].capitalize()} and {reasons[1] if len(reasons) > 1 else 'retention is decaying'}."
    else:
        explanation = f"LOW PRIORITY - {topic_data['title']} is well-retained. {reasons[0].capitalize()} with {reasons[1] if len(reasons) > 1 else 'solid retention'}."

    explanation = explanation.replace(" ,", ",").replace("..", ".").strip()

    return {
        "topic_id": topic_data["id"],
        "title": topic_data["title"],
        "subject_name": topic_data.get("subject_name", "General"),
        "subject_color": topic_data.get("subject_color", "#2563eb"),
        "difficulty": diff,
        "days_elapsed": days_elapsed,
        "last_studied": last_studied_str or "Never",
        "quiz_score": quiz_score if has_quiz else None,
        "mistakes_count": mistakes,
        "revisions_count": revisions,
        "study_duration_minutes": duration,
        "notes": topic_data.get("notes", ""),
        "retention_health_pct": combined_retention,
        "rule_retention_pct": rule_retention_pct,
        "ml_retention_pct": ml_retention_pct,
        "ml_forgetting_probability": ml_forgetting_proba,
        "priority_score": priority_score,
        "priority": priority,
        "priority_badge": priority_badge,
        "explanation": explanation,
        "ml_details": ml_res
    }

def get_student_revision_plan(student_id: int) -> list[dict]:
    conn = get_db()
    cursor = conn.cursor()

    # Query all topics for this student with their most recent study session
    cursor.execute("""
    SELECT 
        t.id, t.title, t.difficulty, t.notes,
        s.name AS subject_name, s.color AS subject_color,
        ss.study_date, ss.duration_minutes, ss.quiz_score, 
        ss.mistakes_count, ss.revisions_count
    FROM topics t
    JOIN subjects s ON t.subject_id = s.id
    LEFT JOIN (
        SELECT topic_id, study_date, duration_minutes, quiz_score, mistakes_count, revisions_count
        FROM study_sessions
        WHERE id IN (
            SELECT MAX(id) FROM study_sessions WHERE student_id = ? GROUP BY topic_id
        )
    ) ss ON t.id = ss.topic_id
    WHERE t.student_id = ?
    ORDER BY t.id ASC
    """, (student_id, student_id))
    
    rows = cursor.fetchall()
    conn.close()

    plan = []
    for r in rows:
        topic_info = dict(r)
        analysis = calculate_topic_revision_status(topic_info)
        plan.append(analysis)

    # Sort: HIGH priority first, then MEDIUM, then LOW; within priority sort by priority_score descending
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    plan.sort(key=lambda x: (priority_order[x["priority"]], -x["priority_score"]))

    return plan
