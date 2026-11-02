# TECHNICAL REPORT: AI DIGITAL MEMORY FOR STUDENTS
**Machine Learning-Based Personalized Revision System**
*Author: Engineering Team | Date: November 2026 | Version: 1.0*

---

## 1. Executive Summary & Problem Formulation
Students forget learned material at different rates depending on topic difficulty, initial comprehension, and time elapsed. Static revision schedules fail to adapt to individual forgetting trajectories. **AI Digital Memory for Students** solves this by maintaining a persistent history of study sessions and quiz outcomes, modeling retention decay using cognitive psychology principles (the Ebbinghaus forgetting curve), and training supervised machine learning algorithms to predict whether a student needs to revise a specific topic today.

```
+---------------------------------------------------------------------------------------------------+
|                                      SYSTEM PIPELINE OVERVIEW                                     |
|                                                                                                   |
|  [Student Study Session]  -->  [Interactive MCQ Quiz]  -->  [SQLite Digital Memory Database]      |
|                                                                           |                       |
|                                                                           v                       |
|  [Personalized Daily Plan] <-- [Hybrid Priority Engine] <-- [Ebbinghaus Decay + Scikit-Learn ML]  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Dataset Architecture & Feature Engineering

### 2.1 Dataset Description
The system utilizes the **Student Learning Outcome & Retention Benchmark Dataset** (`ml_dataset`), grounded in Hermann Ebbinghaus's spacing effect principles and calibrated on 120 labeled learning observations.

### 2.2 Feature Dictionary
The dataset comprises 6 predictive input features and 1 binary classification target:

| Feature Name | Data Type | Range / Domain | Cognitive & Modeling Purpose |
| :--- | :--- | :--- | :--- |
| `days_since_last_study` | Float | 0.5 – 21.0 days | Primary decay driver; elapsed duration since last active engagement. |
| `latest_quiz_score` | Float | 30.0% – 100.0% | Initial encoding strength; higher mastery decelerates forgetting. |
| `mistakes_count` | Integer | 0 – 8 mistakes | Specific misconceptions identified during the latest assessment. |
| `revisions_count` | Integer | 0 – 5 reviews | Memory consolidation index; each repetition increases memory stability. |
| `study_duration_minutes`| Integer | 20 – 90 mins | Exposure length during previous study session. |
| `difficulty_level` | Integer | 1 (Easy), 2 (Med), 3 (Hard) | Subjective and structural complexity of the topic material. |
| **`needs_revision` (Target)** | **Binary** | **0 (Retained) / 1 (Revise)** | **Ground-truth outcome: 1 indicates memory decay below 55% threshold.** |

### 2.3 Data Preprocessing & Validation
- **Standardization:** Numerical features are normalized via `sklearn.preprocessing.StandardScaler` to ensure zero-mean unit-variance for distance and gradient-based estimators (Logistic Regression).
- **Validation Split:** 75% training set (90 samples) and 25% held-out test set (30 samples) with class-stratified sampling to prevent distribution shift.

---

## 3. Machine Learning Algorithms & Model Comparison

Three distinct algorithmic paradigms were implemented and evaluated on the held-out test split:

```
                                  MODEL BENCHMARK PERFORMANCE
  +-----------------------------------------------------------------------------------------------+
  | Model Architecture           | Accuracy | Precision |  Recall  | F1-Score | Role & Behavior   |
  +------------------------------+----------+-----------+----------+----------+-------------------+
  | 1. Logistic Regression (L2)  |  90.0%   |   90.0%   |  94.7%   |  92.3%   | Linear Baseline   |
  | 2. Random Forest (100 Trees) |  90.0%   |   90.0%   |  94.7%   |  92.3%   | Non-linear Gini   |
  | 3. Gradient Boosting (Tree)  |  90.0%   |   90.0%   |  94.7%   |  92.3%   | Sequential Loss   |
  +-----------------------------------------------------------------------------------------------+
```

### 3.1 Model Roles
1. **Logistic Regression (Baseline):** Fits an L2-regularized linear decision boundary. It provides interpretable log-odds weights demonstrating that `days_since_last_study` and `mistakes_count` strongly correlate with positive revision need, while `latest_quiz_score` and `revisions_count` correlate negatively.
2. **Random Forest Classifier (Ensemble):** Constructs 100 decorrelated decision trees (`max_depth=5`) using bootstrap aggregation. Captures non-linear thresholds (e.g., hard topics decaying faster after 4 days).
3. **Gradient Boosting Classifier (Advanced):** Sequentially constructs shallow regression trees minimizing logistic loss with a learning rate of 0.1 and 80 estimators, providing robust generalization against edge cases.

### 3.2 Gini Feature Importance Ranking (Random Forest)
1. `days_since_last_study`: **38.2%** (primary driver of decay)
2. `latest_quiz_score`: **26.1%** (mastery indicator)
3. `mistakes_count`: **17.4%** (concept confusion penalty)
4. `difficulty_level`: **8.9%** (inherent concept drag)
5. `revisions_count`: **5.8%** (long-term stabilization)
6. `study_duration_minutes`: **3.6%** (session volume)

---
*(End of Page 1 — System Design & Classes continue on Page 2)*
\newpage
---
*(Page 2 — Object-Oriented Architecture, Schema & Engine Details)*

## 4. Software Architecture & Class Taxonomy

The backend is built in Python 3.12 with **FastAPI** and **Pydantic v2**, separating business logic, machine learning pipelines, and data persistence into modular components:

```
+---------------------------------------------------------------------------------------------------+
|                                        APPLICATION TAXONOMY                                       |
+---------------------------------------------------------------------------------------------------+
|  [Core Engines]          [Pydantic DTO Classes]          [Frontend State & Services]              |
|  - MLEngine              - RegisterRequest               - state (Global Reactive Store)          |
|  - RevisionPlanner       - LoginRequest                  - LocalDB (Mock / Offline Cache)         |
|                          - ProfileUpdateRequest          - Chart.js (Line, Bar, Doughnut)         |
|  [Database Models]       - SubjectCreate / TopicCreate                                            |
|  - SQLite3 Engine        - SessionCreate / SessionUpdate                                          |
|  - PBKDF2 Password Hash  - QuizSubmission / CustomQuestion                                        |
|  - HTTPBearer Security   - PredictSandboxRequest                                                  |
+---------------------------------------------------------------------------------------------------+
```

### 4.1 Key Backend Classes
- **`MLEngine` (`backend/ml_engine.py`):**
  - Encapsulates model lifecycle: `load_dataset()`, `train_models()`, `predict()`, and `load_or_train()`.
  - Serializes trained model ensembles and metadata using `joblib` into `data/models/`.
  - Generates consensus probability: $P_{\text{consensus}} = 0.25 P_{\text{LR}} + 0.40 P_{\text{RF}} + 0.35 P_{\text{GB}}$.
- **Pydantic Data Transfer Objects (`backend/routes/*.py`):**
  - `RegisterRequest`, `LoginRequest`, `ProfileUpdateRequest`: User lifecycle and authentication.
  - `SubjectCreate`, `TopicCreate`: Course and module hierarchical structure.
  - `SessionCreate`, `SessionUpdate`: Study session entries recording duration, difficulties, and notes.
  - `QuizSubmission`: Payload mapping question IDs to student selected options (`A`, `B`, `C`, `D`).
  - `PredictSandboxRequest`, `AddSampleRequest`: Live simulation parameters and feedback ingestion.

---

## 5. Database Schema & Relational Modeling (SQLite3)

The persistent database consists of 9 normalized tables with foreign key integrity enabled:

```
  +------------------+         +------------------+         +--------------------+
  |     students     | 1 --- * |     subjects     | 1 --- * |       topics       |
  |------------------|         |------------------|         |--------------------|
  | id (PK)          |         | id (PK)          |         | id (PK)            |
  | name             |         | student_id (FK)  |         | subject_id (FK)    |
  | email (UNIQUE)   |         | name, code       |         | title              |
  | password_hash    |         | color, desc      |         | difficulty         |
  | salt, goals      |         +------------------+         | notes              |
  +------------------+                                      +--------------------+
         | 1                                                   | 1            | 1
         |                                                     |              |
         +-----------------+                                   |              |
         |                 |                                   v *            v *
         v *               v *                       +---------------+  +---------------+
  +---------------+  +-----------------+             |study_sessions |  |quiz_questions |
  |   sessions    |  |  quiz_attempts  |             |---------------|  |---------------|
  |---------------|  |-----------------|             | id (PK)       |  | id (PK)       |
  | token (PK)    |  | id (PK)         |             | topic_id (FK) |  | topic_id (FK) |
  | student_id(FK)|  | student_id (FK) |             | study_date    |  | question_text |
  | expires_at    |  | topic_id (FK)   |             | duration_mins |  | option_a..d   |
  +---------------+  | score, mistakes |             | quiz_score    |  | correct_opt   |
                     | answers_json    |             | mistakes_count|  | explanation   |
                     +-----------------+             | revisions_cnt |  +---------------+
                                                     | outcome       |
                                                     +---------------+
```

---

## 6. Hybrid Recommendation Logic (Mathematical Formulation)

The revision recommendation engine operates on a hybrid model balancing psychological decay laws with empirical machine learning:

1. **Ebbinghaus Memory Stability ($S$):**
   $$S = 2.5 \times (1.0 + 0.7 \cdot N_{\text{rev}}) \times \max\left(0.3, \frac{\text{Score}}{100}\right) \times M_{\text{diff}} \times \max(0.5, 1.0 - 0.12 \cdot M_{\text{mistakes}})$$
   Where $M_{\text{diff}} \in \{1.35 \text{ (Easy)}, 1.0 \text{ (Medium)}, 0.75 \text{ (Hard)}\}$.

2. **Rule-Based Retention Probability ($R_{\text{rule}}$):**
   $$R_{\text{rule}} = \exp\left(-\frac{\Delta t}{S}\right) \times 100\%$$

3. **Hybrid Retention Score ($R_{\text{hybrid}}$):**
   $$R_{\text{hybrid}} = 0.5 \cdot R_{\text{rule}} + 0.5 \cdot (1.0 - P_{\text{consensus}}) \times 100\%$$

4. **Actionable Priority Classification:**
   - **HIGH PRIORITY:** $R_{\text{hybrid}} < 45\%$ OR $\Delta t \ge 7 \text{ days}$ OR $(\text{Score} < 60\%)$
   - **MEDIUM PRIORITY:** $45\% \le R_{\text{hybrid}} < 65\%$ OR $\Delta t \ge 4 \text{ days}$
   - **LOW PRIORITY:** $R_{\text{hybrid}} \ge 65\%$ (Well-retained, scheduled for later review)

---

## 7. Production Verification & Deployment

- **Automated Verification:** 10-point test suite verified in [`test_app.py`](test_app.py) validating password salts, JWT session issuance, CRUD memory logs, quiz auto-grading, dynamic revision priority calculation, and ML inference.
- **Production Artifacts:**
  - **Live Web App (GitHub Pages):** [https://mayuresh-001.github.io/AI-digital-memory-/](https://mayuresh-001.github.io/AI-digital-memory-/)
  - **Open Source Repository:** [https://github.com/Mayuresh-001/AI-digital-memory-](https://github.com/Mayuresh-001/AI-digital-memory-)
  - **Local Execution:** Powered by Uvicorn on `http://127.0.0.1:8000` via `python run.py`.
