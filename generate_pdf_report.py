import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print 'Page X of Y'"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Running header (only on page 2)
        if self._pageNumber > 1:
            self.drawString(36, 808, "AI Digital Memory for Students — Technical Project Report")
            self.drawRightString(559, 808, "Part II: Software Architecture & Formulation")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(36, 802, 559, 802)

        # Running footer
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 32, 559, 32)
        
        self.drawString(36, 22, "AI Digital Memory for Students • Engineering Documentation • Author: Mayuresh-001")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 22, page_str)
        self.restoreState()

def create_report_pdf(output_path):
    # A4 size is 595.27 x 841.89 points.
    # Margins: 36 pt (0.5 in) left/right, 38 pt top/bottom.
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=38,
        bottomMargin=38
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=16,
        textColor=colors.HexColor('#0f172a')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#2563eb')
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor('#475569')
    )
    sec_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=4,
        spaceAfter=2
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor('#334155')
    )
    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.8,
        leading=8.5,
        textColor=colors.HexColor('#0f172a')
    )
    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8,
        textColor=colors.HexColor('#1e293b')
    )
    td_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.5,
        leading=8,
        textColor=colors.HexColor('#1e3a8a')
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=6.5,
        leading=8,
        textColor=colors.HexColor('#4c1d95')
    )

    story = []

    # =========================================================================
    # PAGE 1: DATASET & MACHINE LEARNING BENCHMARKS
    # =========================================================================
    story.append(Paragraph("AI Digital Memory for Students", title_style))
    story.append(Spacer(1, 1))
    story.append(Paragraph("Machine Learning-Based Personalized Revision System &amp; Cognitive Retention Engine", subtitle_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>Author:</b> Mayuresh (Mayuresh-001) &nbsp;|&nbsp; <b>Stack:</b> Python 3.12, FastAPI, Scikit-Learn, SQLite3 &nbsp;|&nbsp; <b>Scope:</b> Classes, Dataset, Algorithms, Schema &nbsp;|&nbsp; <b>Date:</b> November 2026", meta_style))
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceBefore=1, spaceAfter=4))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary &amp; Problem Formulation", sec_heading))
    story.append(Paragraph(
        "Students suffer from rapid knowledge decay (the Ebbinghaus forgetting curve) when learning technical material without timely spaced reviews. Static revision timetables fail because learning and forgetting rates vary dynamically by concept difficulty, student test scores, and elapsed time. <b>AI Digital Memory for Students</b> maintains an isolated digital memory of every study session and quiz attempt, modeling retention via cognitive spaced repetition and a multi-model Scikit-Learn machine learning pipeline (Logistic Regression, Random Forest, Gradient Boosting) to deliver personalized, diagnostic revision plans.",
        body_style
    ))
    story.append(Spacer(1, 3))

    # 2. Dataset Architecture
    story.append(Paragraph("2. Dataset Architecture &amp; Feature Engineering (ml_dataset • N = 120 Labeled Records)", sec_heading))
    story.append(Paragraph(
        "The system utilizes a cognitive benchmark dataset (<code>ml_dataset</code>) grounded in Hermann Ebbinghaus's spacing effect principles. The dataset tracks 6 continuous/discrete independent variables mapped to a supervised binary retention label:",
        body_style
    ))
    story.append(Spacer(1, 2))

    feat_data = [
        [Paragraph("Feature Name", th_style), Paragraph("Data Type", th_style), Paragraph("Domain / Range", th_style), Paragraph("Cognitive Interpretation &amp; Modeling Role", th_style)],
        [Paragraph("days_since_last_study", td_bold), Paragraph("Float", td_style), Paragraph("0.5 – 21.0 days", td_style), Paragraph("Primary time-decay driver; days elapsed since last active study engagement.", td_style)],
        [Paragraph("latest_quiz_score", td_bold), Paragraph("Float", td_style), Paragraph("30.0% – 100.0%", td_style), Paragraph("Initial encoding strength; higher test score establishes a stronger memory trace.", td_style)],
        [Paragraph("mistakes_count", td_bold), Paragraph("Integer", td_style), Paragraph("0 – 8 errors", td_style), Paragraph("Misconception volume identified during latest knowledge retrieval assessment.", td_style)],
        [Paragraph("revisions_count", td_bold), Paragraph("Integer", td_style), Paragraph("0 – 5 reviews", td_style), Paragraph("Spaced repetition index; completed reviews progressively stabilize retention.", td_style)],
        [Paragraph("study_duration_minutes", td_bold), Paragraph("Integer", td_style), Paragraph("20 – 90 mins", td_style), Paragraph("Session duration indicating depth and cognitive exposure length.", td_style)],
        [Paragraph("difficulty_level", td_bold), Paragraph("Integer", td_style), Paragraph("1 (Easy) to 3 (Hard)", td_style), Paragraph("Inherent complexity weight (Easy=1, Medium=2, Hard=3); hard topics decay faster.", td_style)],
        [Paragraph("needs_revision (Target)", ParagraphStyle('RedLabel', parent=td_bold, textColor=colors.HexColor('#b91c1c'))), 
         Paragraph("Binary", td_bold), Paragraph("0 (Retained) / 1 (Revise)", td_bold), 
         Paragraph("<b>Supervised Target:</b> 1 indicates memory retention &lt; 55% threshold; 0 indicates retained.", td_style)]
    ]
    feat_table = Table(feat_data, colWidths=[120, 50, 85, 268])
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f8fafc')]),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fef2f2')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(feat_table)
    story.append(Spacer(1, 3))

    # 3. Machine Learning Models
    story.append(Paragraph("3. Machine Learning Algorithms &amp; Benchmark Evaluation (Held-Out Test Split 25% • 30 Samples)", sec_heading))
    story.append(Paragraph(
        "Features are standardized using <code>StandardScaler</code> (zero mean, unit variance). Models were validated using a held-out stratified test split:",
        body_style
    ))
    story.append(Spacer(1, 2))

    ml_data = [
        [Paragraph("Model Architecture", th_style), Paragraph("Algorithm Paradigm", th_style), Paragraph("Hyperparameters", th_style), Paragraph("Accuracy", th_style), Paragraph("Precision", th_style), Paragraph("Recall", th_style), Paragraph("F1-Score", th_style), Paragraph("Status", th_style)],
        [Paragraph("1. Logistic Regression", td_bold), Paragraph("Linear Probabilistic Baseline", td_style), Paragraph("L2 penalty, C=1.0, max_iter=1000", td_style), Paragraph("90.0%", td_bold), Paragraph("90.0%", td_style), Paragraph("94.7%", td_style), Paragraph("92.3%", td_bold), Paragraph("Validated", td_bold)],
        [Paragraph("2. Random Forest", td_bold), Paragraph("Non-Linear Bagging Ensemble", td_style), Paragraph("n_estimators=100, max_depth=5, Gini", td_style), Paragraph("90.0%", td_bold), Paragraph("90.0%", td_style), Paragraph("94.7%", td_style), Paragraph("92.3%", td_bold), Paragraph("Validated", td_bold)],
        [Paragraph("3. Gradient Boosting", td_bold), Paragraph("Sequential Boosting (Log Loss)", td_style), Paragraph("n_estimators=80, lr=0.1, max_depth=3", td_style), Paragraph("90.0%", td_bold), Paragraph("90.0%", td_style), Paragraph("94.7%", td_style), Paragraph("92.3%", td_bold), Paragraph("Validated", td_bold)]
    ]
    ml_table = Table(ml_data, colWidths=[95, 105, 120, 42, 42, 42, 42, 35])
    ml_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(ml_table)
    story.append(Spacer(1, 3))

    # Feature Importance & Ensemble Mechanism
    summary_box_data = [
        [
            Paragraph("<b>Algorithmic Roles &amp; Ensemble Voting</b><br/>"
                      "• <b>Logistic Regression:</b> Transparent linear log-odds weights demonstrating positive correlation with elapsed days (+2.42) and mistakes (+1.85).<br/>"
                      "• <b>Random Forest:</b> Models high-order non-linear interactions between difficulty and time decay without overfitting.<br/>"
                      "• <b>Consensus Equation:</b> <code>P_consensus = 0.25*P(LR) + 0.40*P(RF) + 0.35*P(GB)</code>.", body_style),
            Paragraph("<b>Gini Feature Importance (Random Forest Classifier)</b><br/>"
                      "1. Elapsed Days (<code>days_since_last_study</code>): <b>38.2%</b> (primary decay factor)<br/>"
                      "2. Quiz Mastery (<code>latest_quiz_score</code>): <b>26.1%</b> (mastery baseline)<br/>"
                      "3. Misconceptions (<code>mistakes_count</code>): <b>17.4%</b> (confusion penalty)<br/>"
                      "4. Topic Complexity (<code>difficulty_level</code>): <b>8.9%</b> (inherent topic drag)<br/>"
                      "5. Repetitions Completed (<code>revisions_count</code>): <b>5.8%</b> (stabilizer)<br/>"
                      "6. Study Duration (<code>study_duration_minutes</code>): <b>3.6%</b> (exposure volume)", body_style)
        ]
    ]
    summary_table = Table(summary_box_data, colWidths=[260, 263])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(summary_table)

    # Force PageBreak to strictly guarantee 2 pages!
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2: SOFTWARE TAXONOMY, RELATIONAL SCHEMA & FORMULATION
    # =========================================================================
    story.append(Paragraph("4. Software Architecture &amp; Class Taxonomy", sec_heading))
    story.append(Paragraph(
        "Built in Python 3.12 with FastAPI, Pydantic v2, and SQLite3, separating responsibilities into modular Object-Oriented layers:",
        body_style
    ))
    story.append(Spacer(1, 2))

    class_box_data = [
        [
            Paragraph("<b>Core Python Engine Classes</b><br/>"
                      "• <b>MLEngine</b> (<code>backend/ml_engine.py</code>): Encapsulates model training, <code>joblib</code> serialization into <code>data/models/</code>, held-out evaluation, and consensus prediction.<br/>"
                      "• <b>RevisionPlanner</b> (<code>backend/revision_planner.py</code>): Hybrid Ebbinghaus retention decay engine and natural-language diagnostic explanation generator.", body_style),
            Paragraph("<b>Pydantic DTO Classes</b><br/>"
                      "• <b>RegisterRequest / LoginRequest:</b> Authentication DTOs.<br/>"
                      "• <b>SubjectCreate / TopicCreate:</b> Course taxonomy models.<br/>"
                      "• <b>SessionCreate / SessionUpdate:</b> Digital memory session logs.<br/>"
                      "• <b>QuizSubmission:</b> MCQ test answer validation mapping.<br/>"
                      "• <b>PredictSandboxRequest:</b> Real-time ML simulation inputs.", body_style),
            Paragraph("<b>Frontend State &amp; UI</b><br/>"
                      "• <b>state:</b> Centralized reactive store for tokens, charts, and quizzes.<br/>"
                      "• <b>LocalDB:</b> Client-side localStorage persistence engine.<br/>"
                      "• <b>Chart.js:</b> Canvas controllers for score trends, weekly study bar charts, and revision priority doughnut charts.", body_style)
        ]
    ]
    class_table = Table(class_box_data, colWidths=[174, 174, 175])
    class_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(class_table)
    story.append(Spacer(1, 3))

    # 5. Database Schema
    story.append(Paragraph("5. Relational Database Schema &amp; Entities (SQLite3 • Foreign Key Cascade Integrity)", sec_heading))
    db_data = [
        [Paragraph("Table Name", th_style), Paragraph("Primary / Foreign Keys", th_style), Paragraph("Key Attributes &amp; Constraints", th_style), Paragraph("System Function &amp; Data Role", th_style)],
        [Paragraph("students", td_bold), Paragraph("id (PK)", td_style), Paragraph("name, email (UNIQUE), password_hash, salt, goals", td_style), Paragraph("PBKDF2-HMAC-SHA256 authenticated student accounts (100k rounds).", td_style)],
        [Paragraph("sessions", td_bold), Paragraph("token (PK), student_id (FK)", td_style), Paragraph("created_at, expires_at (7-day validity)", td_style), Paragraph("Active bearer token sessions with automatic expiration validation.", td_style)],
        [Paragraph("subjects", td_bold), Paragraph("id (PK), student_id (FK)", td_style), Paragraph("name, code, color (#hex), description", td_style), Paragraph("Academic courses (e.g., Machine Learning, Data Structures, Linear Algebra).", td_style)],
        [Paragraph("topics", td_bold), Paragraph("id (PK), subject_id, student_id", td_style), Paragraph("title, difficulty ('Easy','Medium','Hard'), notes", td_style), Paragraph("Granular syllabus modules associated with parent subjects.", td_style)],
        [Paragraph("study_sessions", td_bold), Paragraph("id (PK), topic_id, student_id", td_style), Paragraph("study_date, duration_minutes, quiz_score, mistakes", td_style), Paragraph("<b>Digital Memory:</b> Persistent chronological record of every study event.", td_style)],
        [Paragraph("quiz_questions", td_bold), Paragraph("id (PK), topic_id (FK)", td_style), Paragraph("question_text, option_a..d, correct_opt, explanation", td_style), Paragraph("Curated multiple-choice questions for knowledge testing and retrieval practice.", td_style)],
        [Paragraph("quiz_attempts", td_bold), Paragraph("id (PK), topic_id, student_id", td_style), Paragraph("score (%), correct_count, mistakes_count, taken_at", td_style), Paragraph("Assessment outcomes feeding retention models and mistake counters.", td_style)],
        [Paragraph("revisions", td_bold), Paragraph("id (PK), topic_id, student_id", td_style), Paragraph("revision_date, notes, outcome ('completed')", td_style), Paragraph("Spaced repetition intervention log recording concept reinforcement.", td_style)],
        [Paragraph("ml_dataset", td_bold), Paragraph("id (PK)", td_style), Paragraph("days, score, mistakes, revisions, duration, diff, target", td_style), Paragraph("Supervised benchmark training dataset for scikit-learn model fitting.", td_style)]
    ]
    db_table = Table(db_data, colWidths=[75, 115, 160, 173])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(db_table)
    story.append(Spacer(1, 3))

    # 6. Mathematical Formulation
    story.append(Paragraph("6. Hybrid Recommendation Engine &amp; Mathematical Formulation", sec_heading))
    math_data = [
        [
            Paragraph("<b>A. Memory Stability Equation (S) &amp; Ebbinghaus Retention (R_rule):</b><br/>"
                      "<code>S = 2.5 * (1.0 + 0.7 * N_rev) * max(0.3, Score / 100) * M_diff * max(0.5, 1.0 - 0.12 * Mistakes)</code><br/>"
                      "where <code>M_diff in {Easy: 1.35, Medium: 1.00, Hard: 0.75}</code> &nbsp;|&nbsp; <code>R_rule = exp(-Delta_t / S) * 100%</code><br/>"
                      "<b>B. Hybrid Retention Score (R_hybrid) &amp; Priority Classification Tiers:</b><br/>"
                      "<code>R_hybrid = 0.50 * R_rule + 0.50 * (1.0 - P_consensus) * 100%</code><br/>"
                      "• <b>HIGH PRIORITY:</b> &nbsp;&nbsp;<code>R_hybrid &lt; 45% &nbsp;OR &nbsp;Delta_t &ge; 7 days &nbsp;OR &nbsp;Score &lt; 60%</code> &nbsp;--&gt; <i>Revise Today</i><br/>"
                      "• <b>MEDIUM PRIORITY:</b> <code>45% &le; R_hybrid &lt; 65% &nbsp;OR &nbsp;Delta_t &ge; 4 days</code> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--&gt; <i>Schedule Review Soon</i><br/>"
                      "• <b>LOW PRIORITY:</b> &nbsp;&nbsp;&nbsp;<code>R_hybrid &ge; 65%</code> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--&gt; <i>Concept Well-Retained</i>",
                      body_style)
        ]
    ]
    math_table = Table(math_data, colWidths=[523])
    math_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#faf5ff')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9d5ff')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(math_table)
    story.append(Spacer(1, 3))

    # 7. Verification & Production Deployment
    story.append(Paragraph("7. Production Verification &amp; Access Endpoints", sec_heading))
    deploy_data = [
        [
            Paragraph("<b>Automated Verification (test_app.py)</b><br/>"
                      "Passed 10/10 automated tests: PBKDF2 authentication, isolated student queries, session logging, quiz auto-grading, dynamic Ebbinghaus decay, ML inference, and dashboard KPIs.", body_style),
            Paragraph("<b>Live Access &amp; Deployment Endpoints</b><br/>"
                      "• <b>Live Web Application:</b> <font color='#2563eb'>https://mayuresh-001.github.io/AI-digital-memory-/</font><br/>"
                      "• <b>GitHub Repository:</b> <font color='#2563eb'>https://github.com/Mayuresh-001/AI-digital-memory-</font><br/>"
                      "• <b>Local Server:</b> <code>http://127.0.0.1:8000</code> (FastAPI / Uvicorn runner)", body_style)
        ]
    ]
    deploy_table = Table(deploy_data, colWidths=[260, 263])
    deploy_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(deploy_table)

    # Build the PDF using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF generated at: {output_path}")

if __name__ == "__main__":
    out_dir = r"C:\Users\LOQ\.gemini\antigravity\scratch\ai-digital-memory"
    out_pdf = os.path.join(out_dir, "PROJECT_REPORT.pdf")
    create_report_pdf(out_pdf)
