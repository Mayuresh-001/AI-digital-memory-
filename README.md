# AI Digital Memory for Students 🧠

> **A Machine Learning-Based Personalized Revision System designed to help students master topics, retain what they study, and never fall behind.**

---

## 🌟 Overview

Students often forget concepts after studying them. Because every individual learns and forgets at a different rate, static revision timetables fail. 

**AI Digital Memory for Students** solves this by:
1. Maintaining a persistent digital memory of each student's study history.
2. Tracking quiz mastery, mistakes count, and difficult sub-concepts.
3. Modeling retention risk with an integrated **Ebbinghaus Spaced Repetition Curve** and **Scikit-Learn Machine Learning Pipeline** (Logistic Regression, Random Forest, Gradient Boosting).
4. Providing real-time, diagnostic revision recommendations explaining *why* a topic needs to be studied today.

---

## 🚀 Key Features

- **🔐 Student Authentication & Private Isolation:**
  - Secure PBKDF2-HMAC-SHA256 salted password hashing and bearer session management.
  - Profile customization (subjects of interest, study goals, daily study target minutes).
  - Private multi-student data isolation.

- **📊 Comprehensive Student Dashboard:**
  - KPI cards: Total Topics Studied, Total Study Sessions, Average Quiz Score, Topics Needing Revision, Retention Health.
  - **"What Should I Study Today?"** priority recommendation widget with 1-click revision and quiz actions.
  - Interactive charts: Quiz score performance trends over time, weekly study minutes bar chart, revision priority distribution.
  - Recent study activity feed.

- **💾 Persistent Digital Memory & Study History:**
  - Log sessions with topic, subject, duration, difficulty (Easy, Medium, Hard), quiz score, mistakes count, and qualitative concept notes.
  - Full-text search and filtering by subject and difficulty.
  - Delete and edit capability with SQLite persistence.

- **📝 Interactive Quiz Center:**
  - Topic-based multiple-choice quizzes with instant grading.
  - Detailed explanation review: explains why the correct option is right and breaks down mistakes.
  - Automatically feeds quiz results, scores, and mistakes into the student's digital memory to update memory decay models.
  - Support for creating custom student quiz questions.

- **🤖 AI-Powered Personalized Revision Planner:**
  - Classifies topics into **High Priority**, **Medium Priority**, and **Low Priority**.
  - Natural diagnostic explanations for every topic (e.g., *"HIGH PRIORITY — Revise Linear Regression today because 7 days have elapsed since last study, latest quiz score was 52%, and 4 mistakes were recorded."*).
  - 1-click **"Revised Today"** button that immediately recalculates retention health.

- **🔬 Machine Learning Model Lab:**
  - Real scikit-learn models:
    - **Logistic Regression** (transparent linear baseline with feature weights).
    - **Random Forest Classifier** (100-tree ensemble capturing non-linear interactions).
    - **Gradient Boosting Classifier** (sequential boosting comparable to XGBoost).
  - Evaluated on a held-out stratified test set (25%) reporting genuine **Accuracy, Precision, Recall, and F1-score**.
  - Feature importance analysis ranking the impact of elapsed days, quiz scores, mistakes, and difficulty.
  - **Interactive Inference Sandbox**: adjust sliders in real-time to simulate forgetting probability.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn, SQLite3, Pydantic v2
- **Machine Learning:** Scikit-Learn, NumPy, SciPy, Joblib
- **Frontend:** HTML5, Tailwind CSS (modern SaaS design in blue, white, and subtle purple), FontAwesome 6, Chart.js
- **Security:** PBKDF2-HMAC-SHA256 password hashing, token-based session auth

---

## 🏃 Quick Start Instructions

### 1. Requirements
Ensure Python 3.10+ is installed on your system.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python run.py
```

Open your browser and navigate to:
- **Web Application:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive OpenAPI / Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 4. Demo Student Credentials
To explore the application without manual registration:
- **Email:** `alex.student@example.com`
- **Password:** `password123`
- *Alternatively, click the **"1-Click Demo"** button on the landing page!*

---

## 📁 Project Structure

```
ai-digital-memory/
├── backend/
│   ├── routes/
│   │   ├── auth_routes.py         # Login, register, profile
│   │   ├── subject_routes.py      # Subject and topic management
│   │   ├── session_routes.py      # Study session logging & filtering
│   │   ├── quiz_routes.py         # MCQ quiz taking, grading, history
│   │   ├── planner_routes.py      # Priority calculation & revision updates
│   │   ├── ml_routes.py           # Model status, retraining, sandbox
│   │   └── analytics_routes.py    # KPIs and chart analytics
│   ├── auth.py                    # Password hashing & session bearer tokens
│   ├── database.py                # SQLite schema & realistic seed data
│   ├── ml_engine.py               # Scikit-learn models & inference
│   ├── revision_planner.py        # Spaced repetition retention engine
│   └── main.py                    # FastAPI server & static file mount
├── data/
│   ├── digital_memory.db          # SQLite persistent database
│   └── models/                    # Serialized joblib ML model artifacts
├── static/
│   ├── css/
│   │   └── custom.css             # SaaS styling, animations, badges
│   ├── js/
│   │   └── app.js                 # Reactive frontend SPA controller
│   └── index.html                 # Single page application markup
├── requirements.txt               # Backend dependencies
├── run.py                         # Startup runner script
└── README.md                      # Documentation
```
