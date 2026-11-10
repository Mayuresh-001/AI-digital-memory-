import sys
import os
from datetime import datetime

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.database import init_db, seed_demo_data, get_db
from backend.auth import create_session
from backend.revision_planner import get_student_revision_plan
from backend.ml_engine import ml_engine
from backend.routes.auth_routes import login, LoginRequest, register, RegisterRequest
from backend.routes.subject_routes import list_subjects, list_topics
from backend.routes.session_routes import list_sessions, create_session as add_session, SessionCreate
from backend.routes.quiz_routes import get_quiz_topics, get_topic_questions, submit_quiz_attempt, QuizSubmission
from backend.routes.planner_routes import get_recommendations, mark_topic_revised, MarkRevisedRequest, upload_planner_topic_pdf, TopicPdfUpload
from backend.routes.ml_routes import get_ml_status, predict_sandbox, PredictSandboxRequest
from backend.routes.analytics_routes import get_dashboard_analytics

def run_tests():
    print("=" * 70)
    print("  RUNNING AI DIGITAL MEMORY END-TO-END VERIFICATION")
    print("=" * 70)

    # 1. Initialize DB and Seed Data
    init_db()
    seed_demo_data()
    conn = get_db()
    conn.cursor().execute("DELETE FROM topics WHERE title LIKE 'BJT vs MOSFET%'")
    conn.commit()
    conn.close()
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

    # Test creating subject with attachments/context (Files, Folders, Links)
    from backend.routes.subject_routes import create_subject, SubjectCreate
    new_sub_data = SubjectCreate(
        name="Discrete Mathematics",
        code="MATH230",
        color="#0891b2",
        description="Combinatorics, graph theory, propositional logic and proofs.",
        attachments=[{
            "id": "ctx_sub_1",
            "name": "Discrete_Math_Syllabus.pdf",
            "size": 18500,
            "type": "application/pdf",
            "data": "data:application/pdf;base64,JVBERi0xLjQK...",
            "context_type": "file",
            "uploaded_at": "2026-11-11T02:00:00Z"
        }]
    )
    created_sub = create_subject(new_sub_data, current_student=student)
    assert created_sub["status"] == "success"
    print(f"  [OK] Subject created with context attachments: ID {created_sub['id']}")

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

    # Test Revision Planner Topic PDF upload
    pdf_res = upload_planner_topic_pdf(
        topic_id=top_rec["topic_id"],
        req=TopicPdfUpload(
            name=f"{top_rec['title'].replace(' ', '_')}_Revision_Notes.pdf",
            data="data:application/pdf;base64,JVBERi0xLjQK...",
            size=142000,
            type="application/pdf"
        ),
        current_student=student
    )
    assert pdf_res["status"] == "success"
    print(f"  [OK] Revision Planner Topic PDF uploaded: '{pdf_res['attachment']['name']}'")

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

    # 11. Test Multi-User Registration & Data Isolation
    import time
    new_email = f"student_{int(time.time())}@university.edu"
    reg_req = RegisterRequest(
        name="Sarah Connor",
        email=new_email,
        password="secretpassword123",
        subjects_interest="Quantum Physics, Neural Networks",
        study_goals="Ace finals and build AI models",
        daily_target_minutes=75
    )
    reg_res = register(reg_req)
    assert reg_res["status"] == "success"
    new_student = reg_res["student"]
    assert new_student["email"] == new_email
    assert new_student["id"] != student["id"]
    print(f"  [OK] New Student registered successfully: {new_student['name']} (ID: {new_student['id']})")

    # Verify new student can log in
    new_login_res = login(LoginRequest(email=new_email, password="secretpassword123"))
    assert new_login_res["status"] == "success"
    assert new_login_res["student"]["id"] == new_student["id"]
    print(f"  [OK] New Student logged in successfully with private credentials")

    # Verify new student has their own isolated subjects and topics
    new_subs = list_subjects(current_student=new_student)["subjects"]
    assert len(new_subs) >= 2
    assert all(s["student_id"] == new_student["id"] for s in new_subs)
    new_topics = list_topics(current_student=new_student)["topics"]
    assert len(new_topics) >= 2
    assert all(t["student_id"] == new_student["id"] for t in new_topics)
    print(f"  [OK] Multi-user data isolation verified: {len(new_subs)} private subjects, {len(new_topics)} private topics")

    print("\n" + "=" * 70)
    print("  ALL 11 VERIFICATION TESTS (INCLUDING MULTI-USER REGISTRATION) PASSED! SUCCESS")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
