import sqlite3
import os
import hashlib
import json
from datetime import datetime, timedelta

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
DB_PATH = os.path.join(DB_DIR, "digital_memory.db")

def get_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return dk.hex(), salt

def verify_password(password: str, hashed: str, salt: str) -> bool:
    dk, _ = hash_password(password, salt)
    return dk == hashed

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Students table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        subjects_interest TEXT DEFAULT '',
        study_goals TEXT DEFAULT 'Master core topics and excel in upcoming exams',
        daily_target_minutes INTEGER DEFAULT 60,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Active auth tokens / sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        student_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # Subjects table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        code TEXT DEFAULT '',
        color TEXT DEFAULT '#2563eb',
        description TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    # Topics table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );
    """)

    # Study Sessions / Memory records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        study_date DATE NOT NULL,
        duration_minutes INTEGER NOT NULL DEFAULT 45,
        difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Medium',
        quiz_score REAL DEFAULT NULL,
        mistakes_count INTEGER DEFAULT 0,
        revisions_count INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        outcome TEXT CHECK(outcome IN ('retained', 'needs_revision', 'pending')) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    """)

    # Quiz Questions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT CHECK(correct_option IN ('A', 'B', 'C', 'D')) NOT NULL,
        explanation TEXT DEFAULT '',
        created_by TEXT DEFAULT 'system',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    """)

    # Quiz Attempts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        score REAL NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,
        mistakes_count INTEGER NOT NULL,
        answers_json TEXT NOT NULL,
        taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    """)

    # Revision Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        revision_date DATE NOT NULL,
        notes TEXT DEFAULT '',
        retention_score_prior REAL,
        outcome TEXT DEFAULT 'revised',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    );
    """)

    # Labeled Training Dataset for ML Models
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ml_dataset (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        days_since_last_study REAL NOT NULL,
        latest_quiz_score REAL NOT NULL,
        mistakes_count INTEGER NOT NULL,
        revisions_count INTEGER NOT NULL,
        study_duration_minutes INTEGER NOT NULL,
        difficulty_level INTEGER NOT NULL, -- 1: Easy, 2: Medium, 3: Hard
        needs_revision INTEGER NOT NULL,   -- 0: Retained, 1: Needs Revision
        source TEXT DEFAULT 'historical'
    );
    """)

    conn.commit()
    conn.close()

def seed_demo_data():
    conn = get_db()
    cursor = conn.cursor()

    # Check if demo student exists
    cursor.execute("SELECT id FROM students WHERE email = 'alex.student@example.com'")
    if cursor.fetchone():
        conn.close()
        return

    print("Seeding initial demo data for AI Digital Memory...")
    
    # 1. Create demo student
    hashed, salt = hash_password("password123")
    cursor.execute("""
    INSERT INTO students (name, email, password_hash, salt, subjects_interest, study_goals, daily_target_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        "Alex Chen",
        "alex.student@example.com",
        hashed,
        salt,
        "Machine Learning, Data Structures, Mathematics",
        "Prepare for Final Exams & Machine Learning Certifications",
        90
    ))
    student_id = cursor.lastrowid

    # 2. Create Subjects
    subjects_data = [
        ("Machine Learning", "CS401", "#4f46e5", "Supervised, unsupervised algorithms and deep learning concepts"),
        ("Data Structures & Algorithms", "CS201", "#2563eb", "Fundamental structures, trees, graphs, and complexity"),
        ("Linear Algebra", "MATH210", "#7c3aed", "Vectors, matrices, eigenvalues, and coordinate transformations"),
        ("Cellular Biology", "BIO101", "#059669", "Cell structure, metabolic pathways, and cellular respiration")
    ]
    
    subject_map = {}
    for name, code, color, desc in subjects_data:
        cursor.execute("""
        INSERT INTO subjects (student_id, name, code, color, description)
        VALUES (?, ?, ?, ?, ?)
        """, (student_id, name, code, color, desc))
        subject_map[name] = cursor.lastrowid

    # 3. Create Topics
    topics_data = [
        # ML
        (subject_map["Machine Learning"], "Linear Regression", "Medium", "Cost function J(theta), gradient descent, R-squared and collinearity"),
        (subject_map["Machine Learning"], "Neural Network Backpropagation", "Hard", "Chain rule of calculus, gradient flow, activation derivatives"),
        (subject_map["Machine Learning"], "Support Vector Machines", "Hard", "Max margin hyperplane, kernel trick, slack variables"),
        # DSA
        (subject_map["Data Structures & Algorithms"], "Binary Search Trees", "Easy", "In-order traversal yields sorted order, average O(log n) lookup"),
        (subject_map["Data Structures & Algorithms"], "Dynamic Programming: Knapsack", "Hard", "Overlapping subproblems, 2D memoization table, time complexity"),
        (subject_map["Data Structures & Algorithms"], "Graph Breadth-First Search", "Medium", "Queue-based traversal, shortest path in unweighted graphs"),
        # Math
        (subject_map["Linear Algebra"], "Eigenvalues and Eigenvectors", "Hard", "Characteristic equation det(A - lambda*I) = 0, diagonalizability"),
        (subject_map["Linear Algebra"], "Matrix Multiplication & Inverses", "Easy", "Row by column dot product, determinant checks for singularity"),
        # Bio
        (subject_map["Cellular Biology"], "Cellular Respiration & Krebs Cycle", "Medium", "Glycolysis, acetyl-CoA, citric acid cycle, ATP synthase yield")
    ]

    topic_map = {}
    for sub_id, title, diff, notes in topics_data:
        cursor.execute("""
        INSERT INTO topics (student_id, subject_id, title, difficulty, notes)
        VALUES (?, ?, ?, ?, ?)
        """, (student_id, sub_id, title, diff, notes))
        topic_map[title] = cursor.lastrowid

    now = datetime.now()

    # 4. Create Historical Study Sessions spanning past 14 days
    sessions_data = [
        # Linear Regression: studied 7 days ago, low quiz score (52%), 4 mistakes -> CLEAR HIGH PRIORITY REVISION
        (topic_map["Linear Regression"], now - timedelta(days=7), 50, "Medium", 52.0, 4, 1, "Struggled with the gradient descent learning rate formula and bias-variance tradeoff.", "needs_revision"),
        
        # Neural Network Backprop: studied 9 days ago, score 48%, 5 mistakes -> CLEAR HIGH PRIORITY REVISION
        (topic_map["Neural Network Backpropagation"], now - timedelta(days=9), 65, "Hard", 48.0, 5, 0, "Confused on computing derivative of sigmoid activation during the backward pass.", "needs_revision"),

        # Dynamic Programming: studied 5 days ago, score 65%, 2 mistakes -> MEDIUM PRIORITY
        (topic_map["Dynamic Programming: Knapsack"], now - timedelta(days=5), 60, "Hard", 65.0, 2, 1, "Understood recursive relation, need more practice drawing the 2D table.", "needs_revision"),

        # Eigenvalues and Eigenvectors: studied 4 days ago, score 72%, 2 mistakes -> MEDIUM PRIORITY
        (topic_map["Eigenvalues and Eigenvectors"], now - timedelta(days=4), 45, "Hard", 72.0, 2, 1, "Calculating roots of 3x3 characteristic polynomial takes too long.", "retained"),

        # Graph BFS: studied 3 days ago, score 84%, 1 mistake -> LOW/MEDIUM PRIORITY
        (topic_map["Graph Breadth-First Search"], now - timedelta(days=3), 40, "Medium", 84.0, 1, 2, "Queue logic is solid. Just need to remember visited set edge cases.", "retained"),

        # Cellular Respiration: studied 2 days ago, score 88%, 1 mistake -> LOW PRIORITY
        (topic_map["Cellular Respiration & Krebs Cycle"], now - timedelta(days=2), 55, "Medium", 88.0, 1, 2, "Memorized electron transport chain complexes and proton pump ATP counts.", "retained"),

        # Binary Search Trees: studied 1 day ago, score 96%, 0 mistakes -> LOW PRIORITY (FRESH)
        (topic_map["Binary Search Trees"], now - timedelta(days=1), 35, "Easy", 96.0, 0, 3, "Very comfortable with recursive insertions and balancing concepts.", "retained"),

        # Matrix Multiplication: studied today, score 100%, 0 mistakes -> LOW PRIORITY (FRESH)
        (topic_map["Matrix Multiplication & Inverses"], now, 30, "Easy", 100.0, 0, 2, "Fast 2x2 inverse formula and row reduction master.", "retained")
    ]

    for top_id, s_date, dur, diff, score, mistakes, rev_cnt, notes, outcome in sessions_data:
        cursor.execute("""
        INSERT INTO study_sessions (student_id, topic_id, study_date, duration_minutes, difficulty, quiz_score, mistakes_count, revisions_count, notes, outcome)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (student_id, top_id, s_date.strftime("%Y-%m-%d"), dur, diff, score, mistakes, rev_cnt, notes, outcome))

    # 5. Seed Comprehensive MCQ Quizzes
    quiz_bank = [
        # Linear Regression
        (topic_map["Linear Regression"], "What does the slope coefficient represent in a simple linear regression y = beta_0 + beta_1 * x?",
         "The expected value of y when x is zero",
         "The change in the mean of y per one-unit increase in x",
         "The total residual sum of squares",
         "The correlation coefficient squared",
         "B", "The slope coefficient (beta_1) quantifies the estimated change in dependent variable y for every 1-unit increase in predictor x."),

        (topic_map["Linear Regression"], "Which metric penalizes complex models by factoring in the number of predictors?",
         "R-squared",
         "Adjusted R-squared",
         "Mean Absolute Error",
         "Root Mean Squared Error",
         "B", "Adjusted R-squared incorporates a penalty for each additional independent variable added to the model."),

        (topic_map["Linear Regression"], "If the learning rate in gradient descent is excessively large, what occurs?",
         "Gradient descent converges very slowly",
         "The parameters overshoot the minimum and cost function may diverge",
         "The model underfits due to vanishing gradients",
         "The residuals will automatically equal zero",
         "B", "An excessively large learning rate causes gradient descent steps to overshoot the global minimum, causing oscillations or divergence."),

        # Neural Network Backpropagation
        (topic_map["Neural Network Backpropagation"], "Which mathematical tool is the fundamental engine of backpropagation?",
         "Taylor series expansion",
         "Multivariable Chain Rule",
         "Lagrange multipliers",
         "Singular Value Decomposition",
         "B", "Backpropagation computes partial derivatives of the loss with respect to every weight by systematically applying the multivariable chain rule backwards."),

        (topic_map["Neural Network Backpropagation"], "What is the derivative of the standard logistic sigmoid function sigma(z)?",
         "sigma(z) * (1 - sigma(z))",
         "1 - sigma(z)^2",
         "exp(-z) / (1 + exp(-z))",
         "sigma(z) * exp(z)",
         "A", "The derivative of sigmoid sigma(z) simplifies cleanly to sigma(z) * (1 - sigma(z))."),

        # Binary Search Trees
        (topic_map["Binary Search Trees"], "Which tree traversal of a valid Binary Search Tree visits nodes in strictly ascending numerical order?",
         "Pre-order traversal",
         "In-order traversal",
         "Post-order traversal",
         "Level-order traversal",
         "B", "An in-order traversal (Left, Root, Right) processes keys in non-decreasing sorted order for any binary search tree."),

        (topic_map["Binary Search Trees"], "What is the worst-case time complexity of searching an element in an unbalanced BST of n nodes?",
         "O(1)",
         "O(log n)",
         "O(n)",
         "O(n log n)",
         "C", "In a degenerate skewed BST (resembling a linked list), searching takes O(n) linear time."),

        # Dynamic Programming: Knapsack
        (topic_map["Dynamic Programming: Knapsack"], "What is the time complexity of solving the 0/1 Knapsack problem with n items and capacity W using Dynamic Programming?",
         "O(n log n)",
         "O(2^n)",
         "O(n * W) pseudo-polynomial",
         "O(W^2)",
         "C", "The DP table requires computing subproblems for n items and capacities 0..W, giving an O(n*W) pseudo-polynomial runtime."),

        # Eigenvalues and Eigenvectors
        (topic_map["Eigenvalues and Eigenvectors"], "For a square matrix A, what scalar lambda satisfies A*v = lambda*v for non-zero vector v?",
         "Determinant",
         "Trace",
         "Eigenvalue",
         "Singular Value",
         "C", "Lambda is the eigenvalue corresponding to the eigenvector v, scaling v without altering its directional span."),

        # Cellular Respiration
        (topic_map["Cellular Respiration & Krebs Cycle"], "Where in a eukaryotic cell does the Citric Acid (Krebs) Cycle occur?",
         "Cytoplasm",
         "Mitochondrial matrix",
         "Inner mitochondrial membrane",
         "Ribosomes",
         "B", "The citric acid cycle enzymes reside inside the fluid-filled mitochondrial matrix.")
    ]

    for top_id, q_text, opt_a, opt_b, opt_c, opt_d, ans, expl in quiz_bank:
        cursor.execute("""
        INSERT INTO quiz_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'system')
        """, (top_id, q_text, opt_a, opt_b, opt_c, opt_d, ans, expl))

    # 6. Seed Labeled Training Dataset for ML Model (120 realistic benchmark samples)
    # Grounded in cognitive psychology & forgetting curves
    import random
    random.seed(42)

    ml_samples = []
    # Generate balanced labeled outcomes
    for _ in range(120):
        days = round(random.uniform(0.5, 21.0), 1)
        diff_level = random.choice([1, 2, 3]) # 1: Easy, 2: Medium, 3: Hard
        revisions = random.choice([0, 1, 2, 3, 4])
        duration = random.randint(20, 90)
        
        # Realistic quiz score based on revisions and difficulty
        base_score = 60 + (revisions * 8) - (diff_level * 6) + random.uniform(-15, 20)
        quiz_score = max(30.0, min(100.0, round(base_score, 1)))

        mistakes = max(0, int(round((100 - quiz_score) / 15 + random.uniform(-1, 2))))
        
        # Ground truth outcome: 1 = Needs Revision, 0 = Retained
        # Forgetting probability increases with elapsed days, low score, high mistakes, high difficulty; decreases with revisions
        decay_factor = (days * 1.8) + (mistakes * 2.5) + (diff_level * 3.5) - (quiz_score * 0.25) - (revisions * 4.0)
        
        # Add slight stochastic noise
        needs_revision = 1 if decay_factor > 2.0 else 0
        ml_samples.append((days, quiz_score, mistakes, revisions, duration, diff_level, needs_revision, 'benchmark'))

    cursor.executemany("""
    INSERT INTO ml_dataset (days_since_last_study, latest_quiz_score, mistakes_count, revisions_count, study_duration_minutes, difficulty_level, needs_revision, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, ml_samples)

    conn.commit()
    conn.close()
    print("Demo data seeded successfully with realistic student history, quizzes, and ML training dataset.")

if __name__ == "__main__":
    init_db()
    seed_demo_data()
