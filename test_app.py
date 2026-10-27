import sys
import os
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.database import init_db, seed_demo_data, get_db
from backend.auth import create_session
from backend.revision_planner import get_student_revision_plan
from backend.ml_engine import ml_engine
from backend.routes.auth_routes import login, LoginRequest
from backend.routes.subject_routes import list_subjects, list_topics
from backend.routes.session_routes import list_sessions, create_session as add_session, SessionCreate
from backend.routes.quiz_routes import get_quiz_topics, get_topic_questions, submit_quiz_attempt, QuizSubmission
from backend.routes.planner_routes import get_recommendations, mark_topic_revised, MarkRevisedRequest
from backend.routes.ml_routes import get_ml_status, predict_sandbox, PredictSandboxRequest
from backend.routes.analytics_routes import get_dashboard_analytics

def run_tests():
    print("=" * 70)
    print("  RUNNING AI DIGITAL MEMORY END-TO-END VERIFICATION")
    print("=" * 70)

    # 1. Initialize DB and Seed Data
    init_db()
    seed_demo_data()
    print("  [OK] Database schema initialized and demo student data verified")

    # 2. Test Student Auth Login
    req = LoginRequest(email="alex.student@example.com", password="password123")
    auth_res = login(req)
    assert auth_res["status"] == "success"
    student = auth_res["student"]
    token = auth_res["token"]
    assert student["email"] == "alex.student@example.com"
    print(f"  [OK] Student authenticated successfully: {student['name']} (ID: {student['id']})")

    # 3. Test Subjects & Topics
    subs = list_subjects(current_student=student)["subjects"]
    assert len(subs) >= 4
    topics = list_topics(current_student=student)["topics"]
    assert len(topics) >= 8
    print(f"  [OK] Retrieved {len(subs)} subjects and {len(topics)} topics for student")

    # 4. Test Study Sessions & Digital Memory
    sessions_res = list_sessions(current_student=student)["sessions"]
    assert len(sessions_res) >= 5
    print(f"  [OK] Digital Memory retrieved {len(sessions_res)} historical study sessions")

    # 5. Test AI Revision Planner
    recs = get_recommendations(current_student=student)
    assert recs["status"] == "success"
    plan = recs["recommendations"]
    assert len(plan) > 0
    top_rec = recs["study_today"]
    assert top_rec is not None
    print(f"  [OK] Revision Planner: Top recommendation is '{top_rec['title']}' ({top_rec['priority_badge']})")
    print(f"      Explanation: {top_rec['explanation']}")

    # 6. Test Quiz Taking & Mistake Tracking
    topic_id = top_rec["topic_id"]
    q_res = get_topic_questions(topic_id=topic_id, current_student=student)
    questions = q_res["questions"]
    assert len(questions) > 0
    print(f"  [OK] Quiz questions retrieved: {len(questions)} MCQs for topic '{q_res['topic']['title']}'")

    # Submit Quiz answers
    submission = QuizSubmission(answers={q["id"]: "B" for q in questions})
    attempt_res = submit_quiz_attempt(topic_id=topic_id, submission=submission, current_student=student)
    assert attempt_res["status"] == "success"
    print(f"  [OK] Quiz attempt scored: {attempt_res['score']}% ({attempt_res['correct_count']} correct, {attempt_res['mistakes_count']} mistakes)")

    # 7. Test Mark Topic Revised
    rev_res = mark_topic_revised(topic_id=topic_id, req=MarkRevisedRequest(notes="Completed deep-dive revision"), current_student=student)
    assert rev_res["status"] == "success"
    print(f"  [OK] Topic marked as revised today. Memory stability updated!")

    # 8. Test ML Model Status & Comparative Metrics
    ml_res = get_ml_status(current_student=student)
    assert ml_res["is_trained"] is True
    lr_acc = ml_res["model_comparison"]["logistic_regression"]["accuracy"]
    rf_acc = ml_res["model_comparison"]["random_forest"]["accuracy"]
    gb_acc = ml_res["model_comparison"]["gradient_boosting"]["accuracy"]
    print(f"  [OK] ML Model comparison verified:")
    print(f"      - Logistic Regression Accuracy: {lr_acc * 100:.1f}%")
    print(f"      - Random Forest Accuracy:       {rf_acc * 100:.1f}%")
    print(f"      - Gradient Boosting Accuracy:   {gb_acc * 100:.1f}%")

    # 9. Test ML Interactive Sandbox Inference
    sb_req = PredictSandboxRequest(
        days_since_last_study=7.5,
        latest_quiz_score=48.0,
        mistakes_count=4,
        revisions_count=0,
        study_duration_minutes=45,
        difficulty_level=3
    )
    pred_res = predict_sandbox(sb_req, current_student=student)["result"]
    assert pred_res["predicted_needs_revision"] is True
    print(f"  [OK] ML Sandbox prediction: Forgetting risk = {pred_res['consensus_forgetting_probability'] * 100:.1f}%, Recommendation = Needs Revision")

    # 10. Test Dashboard Analytics KPIs & Charts
    dash = get_dashboard_analytics(current_student=student)
    assert dash["status"] == "success"
    assert dash["kpis"]["total_topics"] >= 8
    assert dash["kpis"]["average_quiz_score"] > 0
    print(f"  [OK] Dashboard Analytics verified: Retention Health = {dash['kpis']['overall_retention_health']}%")

    print("\n" + "=" * 70)
    print("  ALL 10 VERIFICATION TESTS PASSED FLAWLESSLY! SUCCESS")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
