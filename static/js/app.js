/**
 * AI Digital Memory for Students - Frontend Application
 */

const API_BASE = "/api";
const IS_STATIC_HOST = window.location.hostname.includes("github.io") || window.location.protocol === "file:";

// Application State
const state = {
    token: localStorage.getItem("adm_token") || null,
    student: null,
    currentTab: "dashboard",
    sidebarCollapsed: false,
    charts: {},
    activeQuiz: null,
    quizAnswers: {},
    subjects: [],
    topics: []
};

// Local Client-Side Mock Database for GitHub Pages / Static Hosting
const LocalDB = {
    init() {
        if (!localStorage.getItem("adm_student")) {
            localStorage.setItem("adm_student", JSON.stringify({
                id: 1,
                name: "Alex Chen",
                email: "alex.student@example.com",
                subjects_interest: "Machine Learning, Data Structures, Mathematics",
                study_goals: "Prepare for Final Exams & Machine Learning Certifications",
                daily_target_minutes: 90
            }));
        }
        if (!localStorage.getItem("adm_subjects")) {
            localStorage.setItem("adm_subjects", JSON.stringify([
                { id: 1, name: "Machine Learning", code: "CS401", color: "#4f46e5", description: "Supervised & deep learning" },
                { id: 2, name: "Data Structures & Algorithms", code: "CS201", color: "#2563eb", description: "Trees, graphs, and dynamic programming" },
                { id: 3, name: "Linear Algebra", code: "MATH210", color: "#7c3aed", description: "Vectors, matrices, and eigenvalues" },
                { id: 4, name: "Cellular Biology", code: "BIO101", color: "#059669", description: "Cellular respiration & metabolic pathways" }
            ]));
        }
        if (!localStorage.getItem("adm_topics")) {
            localStorage.setItem("adm_topics", JSON.stringify([
                { id: 1, subject_id: 1, title: "Linear Regression", difficulty: "Medium", notes: "Gradient descent and cost function" },
                { id: 2, subject_id: 1, title: "Neural Network Backpropagation", difficulty: "Hard", notes: "Chain rule and sigmoid derivatives" },
                { id: 3, subject_id: 2, title: "Binary Search Trees", difficulty: "Easy", notes: "In-order traversal O(log n)" },
                { id: 4, subject_id: 2, title: "Dynamic Programming: Knapsack", difficulty: "Hard", notes: "2D memoization table O(n*W)" },
                { id: 5, subject_id: 2, title: "Graph Breadth-First Search", difficulty: "Medium", notes: "Queue-based shortest path" },
                { id: 6, subject_id: 3, title: "Eigenvalues and Eigenvectors", difficulty: "Hard", notes: "det(A - lambda*I) = 0" },
                { id: 7, subject_id: 3, title: "Matrix Multiplication & Inverses", difficulty: "Easy", notes: "Row by column dot product" },
                { id: 8, subject_id: 4, title: "Cellular Respiration & Krebs Cycle", difficulty: "Medium", notes: "Glycolysis and electron transport chain" }
            ]));
        }
        if (!localStorage.getItem("adm_sessions")) {
            const today = new Date();
            const daysAgo = (d) => {
                const dt = new Date(today);
                dt.setDate(dt.getDate() - d);
                return dt.toISOString().split("T")[0];
            };
            localStorage.setItem("adm_sessions", JSON.stringify([
                { id: 1, topic_id: 1, study_date: daysAgo(7), duration_minutes: 50, difficulty: "Medium", quiz_score: 52, mistakes_count: 4, revisions_count: 1, notes: "Struggled with gradient descent formula.", outcome: "needs_revision" },
                { id: 2, topic_id: 2, study_date: daysAgo(9), duration_minutes: 65, difficulty: "Hard", quiz_score: 48, mistakes_count: 5, revisions_count: 0, notes: "Confused on sigmoid derivative in backward pass.", outcome: "needs_revision" },
                { id: 3, topic_id: 4, study_date: daysAgo(5), duration_minutes: 60, difficulty: "Hard", quiz_score: 65, mistakes_count: 2, revisions_count: 1, notes: "Need practice on 2D table drawing.", outcome: "needs_revision" },
                { id: 4, topic_id: 6, study_date: daysAgo(4), duration_minutes: 45, difficulty: "Hard", quiz_score: 72, mistakes_count: 2, revisions_count: 1, notes: "Roots of 3x3 characteristic polynomial.", outcome: "retained" },
                { id: 5, topic_id: 5, study_date: daysAgo(3), duration_minutes: 40, difficulty: "Medium", quiz_score: 84, mistakes_count: 1, revisions_count: 2, notes: "Queue logic solid.", outcome: "retained" },
                { id: 6, topic_id: 8, study_date: daysAgo(2), duration_minutes: 55, difficulty: "Medium", quiz_score: 88, mistakes_count: 1, revisions_count: 2, notes: "Electron transport chain memorized.", outcome: "retained" },
                { id: 7, topic_id: 3, study_date: daysAgo(1), duration_minutes: 35, difficulty: "Easy", quiz_score: 96, mistakes_count: 0, revisions_count: 3, notes: "Recursive insertions mastered.", outcome: "retained" },
                { id: 8, topic_id: 7, study_date: daysAgo(0), duration_minutes: 30, difficulty: "Easy", quiz_score: 100, mistakes_count: 0, revisions_count: 2, notes: "Matrix inverse formula clear.", outcome: "retained" }
            ]));
        }
        if (!localStorage.getItem("adm_questions")) {
            localStorage.setItem("adm_questions", JSON.stringify([
                { id: 1, topic_id: 1, question_text: "What does the slope coefficient represent in simple linear regression y = b0 + b1 * x?", option_a: "Expected y when x is zero", option_b: "Change in mean y per one-unit increase in x", option_c: "Total residual sum of squares", option_d: "Correlation coefficient squared", correct_option: "B", explanation: "The slope coefficient (b1) estimates the change in y for each one-unit increase in x." },
                { id: 2, topic_id: 1, question_text: "Which metric penalizes complex models by factoring in the number of predictors?", option_a: "R-squared", option_b: "Adjusted R-squared", option_c: "Mean Absolute Error", option_d: "Root Mean Squared Error", correct_option: "B", explanation: "Adjusted R-squared penalizes the inclusion of unnecessary explanatory variables." },
                { id: 3, topic_id: 2, question_text: "Which mathematical tool is the fundamental engine of backpropagation?", option_a: "Taylor series", option_b: "Multivariable Chain Rule", option_c: "Lagrange multipliers", option_d: "Singular Value Decomposition", correct_option: "B", explanation: "Backpropagation uses the calculus chain rule recursively backwards to compute gradients." },
                { id: 4, topic_id: 2, question_text: "What is the derivative of the standard logistic sigmoid function sigma(z)?", option_a: "sigma(z) * (1 - sigma(z))", option_b: "1 - sigma(z)^2", option_c: "exp(-z) / (1 + exp(-z))", option_d: "sigma(z) * exp(z)", correct_option: "A", explanation: "The derivative of sigmoid simplifies elegantly to sigma(z) * (1 - sigma(z))." },
                { id: 5, topic_id: 3, question_text: "Which tree traversal of a valid BST visits nodes in strictly ascending numerical order?", option_a: "Pre-order", option_b: "In-order", option_c: "Post-order", option_d: "Level-order", correct_option: "B", explanation: "In-order traversal (Left, Root, Right) processes nodes in sorted ascending order." },
                { id: 6, topic_id: 4, question_text: "What is the time complexity of solving 0/1 Knapsack (n items, capacity W) using Dynamic Programming?", option_a: "O(n log n)", option_b: "O(2^n)", option_c: "O(n * W) pseudo-polynomial", option_d: "O(W^2)", correct_option: "C", explanation: "The DP table requires computing subproblems for n items and capacities 0..W." }
            ]));
        }
        if (!localStorage.getItem("adm_quiz_attempts")) {
            localStorage.setItem("adm_quiz_attempts", JSON.stringify([
                { id: 1, topic_id: 1, score: 50.0, total_questions: 2, correct_count: 1, mistakes_count: 1, taken_at: "2026-10-25 14:20:00" },
                { id: 2, topic_id: 3, score: 100.0, total_questions: 1, correct_count: 1, mistakes_count: 0, taken_at: "2026-10-26 16:45:00" }
            ]));
        }
    },

    mockRequest(endpoint, options = {}) {
        LocalDB.init();
        const student = JSON.parse(localStorage.getItem("adm_student"));
        const subjects = JSON.parse(localStorage.getItem("adm_subjects"));
        const topics = JSON.parse(localStorage.getItem("adm_topics"));
        const sessions = JSON.parse(localStorage.getItem("adm_sessions"));
        const questions = JSON.parse(localStorage.getItem("adm_questions"));
        const attempts = JSON.parse(localStorage.getItem("adm_quiz_attempts"));

        const url = endpoint.split("?")[0];
        const method = options.method || "GET";
        const body = options.body ? JSON.parse(options.body) : {};

        // Auth
        if (url === "/auth/me" || url === "/auth/demo-login" || url === "/auth/login") {
            return { status: "success", token: "local_demo_token_123", student };
        }
        if (url === "/auth/profile" && method === "PUT") {
            Object.assign(student, body);
            localStorage.setItem("adm_student", JSON.stringify(student));
            return { status: "success", message: "Profile updated successfully.", student };
        }

        // Subjects & Topics
        if (url === "/subjects") {
            if (method === "GET") {
                const subWithCounts = subjects.map(s => ({
                    ...s,
                    topic_count: topics.filter(t => t.subject_id === s.id).length
                }));
                return { status: "success", subjects: subWithCounts };
            }
            if (method === "POST") {
                const newSub = { id: Date.now(), ...body };
                subjects.push(newSub);
                localStorage.setItem("adm_subjects", JSON.stringify(subjects));
                return { status: "success", message: "Subject created.", id: newSub.id };
            }
        }
        if (url.startsWith("/subjects/") && method === "DELETE") {
            const id = parseInt(url.split("/")[2]);
            const filtered = subjects.filter(s => s.id !== id);
            localStorage.setItem("adm_subjects", JSON.stringify(filtered));
            return { status: "success", message: "Subject deleted." };
        }

        if (url === "/topics") {
            if (method === "GET") {
                const joined = topics.map(t => {
                    const sub = subjects.find(s => s.id === t.subject_id) || {};
                    return { ...t, subject_name: sub.name || "General", subject_color: sub.color || "#2563eb" };
                });
                return { status: "success", topics: joined };
            }
            if (method === "POST") {
                const newT = { id: Date.now(), ...body };
                topics.push(newT);
                localStorage.setItem("adm_topics", JSON.stringify(topics));
                return { status: "success", message: "Topic created.", id: newT.id };
            }
        }

        // Sessions
        if (url === "/sessions") {
            if (method === "GET") {
                const joined = sessions.map(s => {
                    const t = topics.find(tp => tp.id === s.topic_id) || {};
                    const sub = subjects.find(sb => sb.id === t.subject_id) || {};
                    return { ...s, topic_title: t.title || "Topic", subject_name: sub.name || "Subject", subject_color: sub.color || "#2563eb" };
                }).sort((a, b) => (b.study_date > a.study_date ? 1 : -1));
                return { status: "success", sessions: joined };
            }
            if (method === "POST") {
                const newS = { id: Date.now(), ...body };
                sessions.unshift(newS);
                localStorage.setItem("adm_sessions", JSON.stringify(sessions));
                return { status: "success", message: "Study session logged into Digital Memory.", id: newS.id };
            }
        }
        if (url.startsWith("/sessions/") && method === "DELETE") {
            const id = parseInt(url.split("/")[2]);
            const filtered = sessions.filter(s => s.id !== id);
            localStorage.setItem("adm_sessions", JSON.stringify(filtered));
            return { status: "success", message: "Study session deleted." };
        }

        // Recommendations / Planner
        if (url === "/planner/recommendations" || url === "/analytics/dashboard") {
            const today = new Date();
            const plan = topics.map(t => {
                const sub = subjects.find(s => s.id === t.subject_id) || {};
                const topSessions = sessions.filter(s => s.topic_id === t.id).sort((a, b) => (b.study_date > a.study_date ? 1 : -1));
                const lastSess = topSessions[0] || {};
                const studyDate = lastSess.study_date ? new Date(lastSess.study_date) : new Date(today.getTime() - 14 * 86400000);
                const daysElapsed = Math.max(0.1, Math.round((today - studyDate) / 86400000));
                const score = lastSess.quiz_score !== undefined ? lastSess.quiz_score : 65;
                const mistakes = lastSess.mistakes_count || 0;
                const revisions = lastSess.revisions_count || 0;

                // Ebbinghaus rule calculation
                const scoreFactor = Math.max(0.3, score / 100);
                const stability = 2.5 * (1 + 0.7 * revisions) * scoreFactor * (t.difficulty === "Easy" ? 1.35 : t.difficulty === "Hard" ? 0.75 : 1.0);
                const retentionPct = Math.min(99, Math.max(5, Math.round(Math.exp(-daysElapsed / stability) * 100)));
                const priorityScore = 100 - retentionPct;
                const priority = priorityScore >= 55 || daysElapsed >= 7 ? "HIGH" : priorityScore >= 35 ? "MEDIUM" : "LOW";

                const expl = priority === "HIGH" 
                    ? `HIGH PRIORITY - Revise ${t.title} today because ${daysElapsed} days have elapsed since last study, latest quiz score was ${score}%, and ${mistakes} mistakes recorded.`
                    : priority === "MEDIUM"
                    ? `MEDIUM PRIORITY - Schedule revision for ${t.title} soon. ${daysElapsed} days have passed and retention is decaying.`
                    : `LOW PRIORITY - ${t.title} is well-retained. Studied recently with solid score.`;

                return {
                    topic_id: t.id,
                    title: t.title,
                    subject_name: sub.name || "General",
                    subject_color: sub.color || "#2563eb",
                    difficulty: t.difficulty,
                    days_elapsed: daysElapsed,
                    last_studied: lastSess.study_date || "Never",
                    quiz_score: lastSess.quiz_score !== undefined ? lastSess.quiz_score : null,
                    mistakes_count: mistakes,
                    revisions_count: revisions,
                    retention_health_pct: retentionPct,
                    priority_score: priorityScore,
                    priority,
                    priority_badge: `${priority.charAt(0) + priority.slice(1).toLowerCase()} Priority`,
                    explanation: expl
                };
            }).sort((a, b) => b.priority_score - a.priority_score);

            if (url === "/planner/recommendations") {
                return {
                    status: "success",
                    summary: {
                        total_topics: plan.length,
                        high_priority_count: plan.filter(p => p.priority === "HIGH").length,
                        medium_priority_count: plan.filter(p => p.priority === "MEDIUM").length,
                        low_priority_count: plan.filter(p => p.priority === "LOW").length
                    },
                    study_today: plan[0] || null,
                    recommendations: plan
                };
            }

            // Dashboard payload
            const avgScore = sessions.length ? Math.round(sessions.reduce((acc, s) => acc + (s.quiz_score || 0), 0) / sessions.length) : 0;
            const avgRetention = plan.length ? Math.round(plan.reduce((acc, p) => acc + p.retention_health_pct, 0) / plan.length) : 0;
            const recentAct = sessions.slice(0, 6).map(s => {
                const t = topics.find(tp => tp.id === s.topic_id) || {};
                const sub = subjects.find(sb => sb.id === t.subject_id) || {};
                return { ...s, topic_title: t.title, subject_name: sub.name, subject_color: sub.color };
            });

            return {
                status: "success",
                kpis: {
                    total_topics: topics.length,
                    total_sessions: sessions.length,
                    total_study_minutes: sessions.reduce((acc, s) => acc + s.duration_minutes, 0),
                    average_quiz_score: avgScore,
                    topics_needing_revision: plan.filter(p => p.priority !== "LOW").length,
                    overall_retention_health: avgRetention
                },
                study_today: plan[0] || null,
                charts: {
                    score_trends: attempts.map(a => {
                        const t = topics.find(tp => tp.id === a.topic_id) || {};
                        return { date: a.taken_at.split(" ")[0], score: a.score, topic: t.title };
                    }),
                    weekly_study: [
                        { day_label: "Mon", minutes: 45 }, { day_label: "Tue", minutes: 60 },
                        { day_label: "Wed", minutes: 30 }, { day_label: "Thu", minutes: 75 },
                        { day_label: "Fri", minutes: 40 }, { day_label: "Sat", minutes: 90 },
                        { day_label: "Sun", minutes: 55 }
                    ],
                    priority_distribution: {
                        High: plan.filter(p => p.priority === "HIGH").length,
                        Medium: plan.filter(p => p.priority === "MEDIUM").length,
                        Low: plan.filter(p => p.priority === "LOW").length
                    }
                },
                recent_activity: recentAct
            };
        }

        if (url.startsWith("/planner/revise/")) {
            const topicId = parseInt(url.split("/")[3]);
            const todayStr = new Date().toISOString().split("T")[0];
            const sess = sessions.find(s => s.topic_id === topicId);
            if (sess) {
                sess.study_date = todayStr;
                sess.revisions_count = (sess.revisions_count || 0) + 1;
                sess.outcome = "retained";
            } else {
                sessions.unshift({ id: Date.now(), topic_id: topicId, study_date: todayStr, duration_minutes: 30, difficulty: "Medium", quiz_score: 85, mistakes_count: 0, revisions_count: 1, notes: "Revised today", outcome: "retained" });
            }
            localStorage.setItem("adm_sessions", JSON.stringify(sessions));
            return { status: "success", message: "Topic marked as revised today. Memory stability updated!" };
        }

        // Quizzes
        if (url === "/quizzes/topics") {
            const qTopics = topics.map(t => {
                const sub = subjects.find(s => s.id === t.subject_id) || {};
                const tQuestions = questions.filter(q => q.topic_id === t.id);
                const tAttempts = attempts.filter(a => a.topic_id === t.id);
                const latest = tAttempts.length ? tAttempts[tAttempts.length - 1].score : null;
                return {
                    id: t.id,
                    title: t.title,
                    difficulty: t.difficulty,
                    subject_name: sub.name || "General",
                    subject_color: sub.color || "#2563eb",
                    question_count: tQuestions.length,
                    latest_score: latest
                };
            });
            return { status: "success", topics: qTopics };
        }

        if (url.startsWith("/quizzes/") && url.endsWith("/questions")) {
            const topicId = parseInt(url.split("/")[2]);
            const topic = topics.find(t => t.id === topicId) || {};
            const topicQuestions = questions.filter(q => q.topic_id === topicId).map(q => ({
                id: q.id,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d
            }));
            return { status: "success", topic, questions: topicQuestions };
        }

        if (url.startsWith("/quizzes/") && url.endsWith("/attempt")) {
            const topicId = parseInt(url.split("/")[2]);
            const topic = topics.find(t => t.id === topicId) || {};
            const topicQuestions = questions.filter(q => q.topic_id === topicId);
            const userAnswers = body.answers || {};
            let correct = 0;
            let mistakes = 0;
            const detailed = topicQuestions.map(q => {
                const ans = (userAnswers[q.id] || "").toUpperCase();
                const isCorr = ans === q.correct_option;
                if (isCorr) correct++; else mistakes++;
                return {
                    question_id: q.id,
                    question_text: q.question_text,
                    options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
                    student_answer: ans,
                    correct_answer: q.correct_option,
                    is_correct: isCorr,
                    explanation: q.explanation
                };
            });
            const scorePct = topicQuestions.length ? Math.round((correct / topicQuestions.length) * 100) : 0;
            attempts.unshift({ id: Date.now(), topic_id: topicId, score: scorePct, total_questions: topicQuestions.length, correct_count: correct, mistakes_count: mistakes, taken_at: new Date().toISOString().replace("T", " ").substring(0, 19) });
            localStorage.setItem("adm_quiz_attempts", JSON.stringify(attempts));

            // update session
            const s = sessions.find(sn => sn.topic_id === topicId);
            if (s) {
                s.quiz_score = scorePct;
                s.mistakes_count = mistakes;
            }
            localStorage.setItem("adm_sessions", JSON.stringify(sessions));

            return {
                status: "success",
                score: scorePct,
                total_questions: topicQuestions.length,
                correct_count: correct,
                mistakes_count: mistakes,
                detailed_results: detailed
            };
        }

        if (url === "/quizzes/history") {
            const joined = attempts.map(a => {
                const t = topics.find(tp => tp.id === a.topic_id) || {};
                const sub = subjects.find(sb => sb.id === t.subject_id) || {};
                return { ...a, topic_title: t.title, subject_name: sub.name, subject_color: sub.color };
            });
            return { status: "success", attempts: joined };
        }

        // ML Status & Sandbox
        if (url === "/ml/status") {
            return {
                status: "success",
                is_trained: true,
                last_trained_at: "Active Model",
                training_sample_count: 120,
                model_comparison: {
                    logistic_regression: { accuracy: 0.90, precision: 0.90, recall: 0.947, f1_score: 0.923, test_samples: 30 },
                    random_forest: { accuracy: 0.90, precision: 0.90, recall: 0.947, f1_score: 0.923, test_samples: 30 },
                    gradient_boosting: { accuracy: 0.90, precision: 0.90, recall: 0.947, f1_score: 0.923, test_samples: 30 }
                },
                feature_importance: {
                    random_forest: {
                        days_since_last_study: 0.38,
                        latest_quiz_score: 0.26,
                        mistakes_count: 0.17,
                        difficulty_level: 0.09,
                        revisions_count: 0.06,
                        study_duration_minutes: 0.04
                    }
                }
            };
        }

        if (url === "/ml/predict") {
            const { days_since_last_study, latest_quiz_score, mistakes_count, revisions_count, difficulty_level } = body;
            const decay = (days_since_last_study * 1.8) + (mistakes_count * 2.5) + (difficulty_level * 3.5) - (latest_quiz_score * 0.25) - (revisions_count * 4.0);
            const proba = Math.min(0.99, Math.max(0.05, 1 / (1 + Math.exp(-decay / 5))));
            const needsRev = proba >= 0.5;

            const risks = [];
            if (days_since_last_study >= 5) risks.push(`Significant decay: ${days_since_last_study} days elapsed`);
            if (latest_quiz_score < 65) risks.push(`Low quiz score: ${latest_quiz_score}%`);
            if (mistakes_count >= 2) risks.push(`${mistakes_count} recorded mistakes`);

            return {
                status: "success",
                result: {
                    predicted_needs_revision: needsRev,
                    consensus_forgetting_probability: Math.round(proba * 100) / 100,
                    model_breakdown: {
                        logistic_regression: { probability: Math.round(proba * 100) / 100, prediction: needsRev ? "Needs Revision" : "Retained" },
                        random_forest: { probability: Math.round(proba * 100) / 100, prediction: needsRev ? "Needs Revision" : "Retained" },
                        gradient_boosting: { probability: Math.round(proba * 100) / 100, prediction: needsRev ? "Needs Revision" : "Retained" }
                    },
                    risk_factors: risks
                }
            };
        }

        if (url === "/ml/train") {
            return { status: "success", message: "ML models evaluated and refreshed." };
        }

        return { status: "success" };
    }
};

// API Fetch Helper with Auto-Fallback for GitHub Pages
async function apiRequest(endpoint, options = {}) {
    // If running statically on GitHub Pages, use LocalDB directly
    if (IS_STATIC_HOST) {
        return LocalDB.mockRequest(endpoint, options);
    }

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (state.token) {
        headers["Authorization"] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            logout();
            throw new Error("Session expired. Please log in again.");
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "An error occurred.");
        }
        return data;
    } catch (err) {
        // Graceful fallback to client-side database if server is unreachable
        console.warn("Backend API unreachable, using client-side memory store:", err.message);
        return LocalDB.mockRequest(endpoint, options);
    }
}

// Toast Notifications
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColors = {
        success: "bg-emerald-600 text-white",
        error: "bg-rose-600 text-white",
        warning: "bg-amber-600 text-white",
        info: "bg-blue-600 text-white"
    };
    const icons = {
        success: "fa-check-circle",
        error: "fa-exclamation-circle",
        warning: "fa-exclamation-triangle",
        info: "fa-info-circle"
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// App Initialization
document.addEventListener("DOMContentLoaded", async () => {
    setupEventListeners();
    if (state.token) {
        try {
            const res = await apiRequest("/auth/me");
            state.student = res.student;
            renderAuthenticatedApp();
            switchTab("dashboard");
        } catch (e) {
            renderLandingPage();
        }
    } else {
        renderLandingPage();
    }
});

// Event Listeners Setup
function setupEventListeners() {
    // Sidebar toggle
    const toggleBtn = document.getElementById("sidebar-toggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
            const sidebar = document.getElementById("sidebar");
            const mainContent = document.getElementById("main-content");
            if (state.sidebarCollapsed) {
                sidebar.classList.add("-translate-x-full", "md:w-20");
                sidebar.classList.remove("md:w-64");
                document.querySelectorAll(".sidebar-text").forEach(el => el.classList.add("hidden"));
                if (mainContent) mainContent.classList.remove("md:ml-64");
                if (mainContent) mainContent.classList.add("md:ml-20");
            } else {
                sidebar.classList.remove("-translate-x-full", "md:w-20");
                sidebar.classList.add("md:w-64");
                document.querySelectorAll(".sidebar-text").forEach(el => el.classList.remove("hidden"));
                if (mainContent) mainContent.classList.remove("md:ml-20");
                if (mainContent) mainContent.classList.add("md:ml-64");
            }
        });
    }
}

// Tab Switching
function switchTab(tabName) {
    state.currentTab = tabName;

    // Update nav links
    document.querySelectorAll(".nav-link").forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.className = "nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 transition";
        } else {
            btn.className = "nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition";
        }
    });

    // Hide all view containers
    document.querySelectorAll(".view-container").forEach(el => el.classList.add("hidden"));

    const activeView = document.getElementById(`${tabName}-view`);
    if (activeView) {
        activeView.classList.remove("hidden");
        activeView.classList.add("animate-fade-in");
    }

    // Trigger specific loaders
    switch (tabName) {
        case "dashboard":
            loadDashboard();
            break;
        case "planner":
            loadPlanner();
            break;
        case "memory":
            loadMemorySessions();
            break;
        case "subjects":
            loadSubjects();
            break;
        case "quizzes":
            loadQuizCenter();
            break;
        case "ml":
            loadMLLab();
            break;
        case "profile":
            loadProfile();
            break;
    }
}

// Render Unauthenticated Landing View
function renderLandingPage() {
    document.getElementById("auth-app").classList.add("hidden");
    document.getElementById("landing-app").classList.remove("hidden");
}

// Render Authenticated Shell
function renderAuthenticatedApp() {
    document.getElementById("landing-app").classList.add("hidden");
    document.getElementById("auth-app").classList.remove("hidden");

    if (state.student) {
        document.getElementById("student-name-display").textContent = state.student.name;
        document.getElementById("student-email-display").textContent = state.student.email;
        document.getElementById("student-avatar-initial").textContent = state.student.name.charAt(0).toUpperCase();
    }
}

// Authentication Actions
async function loginDemo() {
    try {
        const res = await apiRequest("/auth/demo-login", { method: "POST" });
        state.token = res.token;
        state.student = res.student;
        localStorage.setItem("adm_token", res.token);
        closeAuthModal();
        renderAuthenticatedApp();
        switchTab("dashboard");
        showToast("Welcome back, Alex! Demo student profile loaded.", "success");
    } catch (e) {
        showToast(e.message, "error");
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        state.token = res.token;
        state.student = res.student;
        localStorage.setItem("adm_token", res.token);
        closeAuthModal();
        renderAuthenticatedApp();
        switchTab("dashboard");
        showToast(`Welcome back, ${res.student.name}!`, "success");
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const subjects_interest = document.getElementById("reg-subjects").value;

    try {
        const res = await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password, subjects_interest })
        });
        state.token = res.token;
        state.student = res.student;
        localStorage.setItem("adm_token", res.token);
        closeAuthModal();
        renderAuthenticatedApp();
        switchTab("dashboard");
        showToast("Registration successful! Welcome to AI Digital Memory.", "success");
    } catch (err) {
        showToast(err.message, "error");
    }
}

function logout() {
    state.token = null;
    state.student = null;
    localStorage.removeItem("adm_token");
    renderLandingPage();
    showToast("You have been signed out.", "info");
}

function openAuthModal(mode = "login") {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    switchAuthForm(mode);
}

function closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.classList.add("hidden");
}

function switchAuthForm(mode) {
    const loginForm = document.getElementById("login-form-container");
    const regForm = document.getElementById("reg-form-container");
    const tabLogin = document.getElementById("tab-auth-login");
    const tabReg = document.getElementById("tab-auth-register");

    if (mode === "login") {
        loginForm.classList.remove("hidden");
        regForm.classList.add("hidden");
        tabLogin.className = "w-1/2 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600";
        tabReg.className = "w-1/2 py-2 text-sm font-medium text-slate-500 border-b border-slate-200 hover:text-slate-700";
    } else {
        loginForm.classList.add("hidden");
        regForm.classList.remove("hidden");
        tabReg.className = "w-1/2 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600";
        tabLogin.className = "w-1/2 py-2 text-sm font-medium text-slate-500 border-b border-slate-200 hover:text-slate-700";
    }
}

// -------------------------------------------------------------------------
// 1. DASHBOARD
// -------------------------------------------------------------------------
async function loadDashboard() {
    try {
        const data = await apiRequest("/analytics/dashboard");
        const kpis = data.kpis;

        // KPI Cards
        document.getElementById("kpi-total-topics").textContent = kpis.total_topics;
        document.getElementById("kpi-total-sessions").textContent = kpis.total_sessions;
        document.getElementById("kpi-avg-score").textContent = `${kpis.average_quiz_score}%`;
        document.getElementById("kpi-topics-revision").textContent = kpis.topics_needing_revision;
        document.getElementById("kpi-retention-health").textContent = `${kpis.overall_retention_health}%`;

        // "What should I study today?"
        const studyCard = document.getElementById("study-today-card");
        if (data.study_today) {
            const st = data.study_today;
            studyCard.innerHTML = `
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold shrink-0">
                            <i class="fas fa-brain"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    st.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                                    st.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                }">${st.priority_badge}</span>
                                <span class="text-xs font-medium px-2 py-0.5 rounded text-white" style="background-color: ${st.subject_color}">${st.subject_name}</span>
                                <span class="text-xs text-slate-500">Last studied ${st.days_elapsed} days ago</span>
                            </div>
                            <h3 class="text-lg font-bold text-slate-900">${st.title}</h3>
                            <p class="text-sm text-slate-600 mt-1 max-w-2xl">${st.explanation}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
                        <button onclick="markRevisedDirect(${st.topic_id})" class="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-check"></i> Mark Revised
                        </button>
                        <button onclick="startTopicQuiz(${st.topic_id})" class="flex-1 md:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center justify-center gap-2">
                            <i class="fas fa-play"></i> Take Quiz
                        </button>
                    </div>
                </div>
            `;
        } else {
            studyCard.innerHTML = `
                <div class="text-center py-6 text-slate-500">
                    <i class="fas fa-check-circle text-4xl text-emerald-500 mb-2"></i>
                    <h4 class="font-semibold text-slate-800">All caught up!</h4>
                    <p class="text-sm">No urgent topics need revision right now. Explore new topics or take a refresher quiz.</p>
                </div>
            `;
        }

        // Render Charts
        renderDashboardCharts(data.charts);

        // Recent Activity Feed
        renderRecentActivity(data.recent_activity);

    } catch (e) {
        showToast("Error loading dashboard data: " + e.message, "error");
    }
}

function renderDashboardCharts(chartsData) {
    // 1. Quiz Score Trends Line Chart
    const ctxTrend = document.getElementById("chart-score-trends");
    if (ctxTrend) {
        if (state.charts.scoreTrends) state.charts.scoreTrends.destroy();

        const labels = chartsData.score_trends.map(d => d.date);
        const scores = chartsData.score_trends.map(d => d.score);

        state.charts.scoreTrends = new Chart(ctxTrend, {
            type: "line",
            data: {
                labels: labels.length ? labels : ["No data"],
                datasets: [{
                    label: "Quiz Score (%)",
                    data: scores.length ? scores : [0],
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.1)",
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#2563eb",
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100, ticks: { callback: v => `${v}%` } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 2. Weekly Study Minutes Bar Chart
    const ctxWeekly = document.getElementById("chart-weekly-study");
    if (ctxWeekly) {
        if (state.charts.weeklyStudy) state.charts.weeklyStudy.destroy();

        const labels = chartsData.weekly_study.map(d => d.day_label);
        const minutes = chartsData.weekly_study.map(d => d.minutes);

        state.charts.weeklyStudy = new Chart(ctxWeekly, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Study Time (min)",
                    data: minutes,
                    backgroundColor: "#7c3aed",
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 3. Priority Distribution Doughnut Chart
    const ctxPriority = document.getElementById("chart-priority-dist");
    if (ctxPriority) {
        if (state.charts.priorityDist) state.charts.priorityDist.destroy();

        const dist = chartsData.priority_distribution;
        state.charts.priorityDist = new Chart(ctxPriority, {
            type: "doughnut",
            data: {
                labels: ["High Priority", "Medium Priority", "Low Priority"],
                datasets: [{
                    data: [dist.High, dist.Medium, dist.Low],
                    backgroundColor: ["#f43f5e", "#f59e0b", "#10b981"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" }
                },
                cutout: "70%"
            }
        });
    }
}

function renderRecentActivity(activities) {
    const tableBody = document.getElementById("recent-activity-tbody");
    if (!tableBody) return;

    if (!activities || !activities.length) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">No study sessions recorded yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = activities.map(act => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="py-3 px-4 font-medium text-slate-800">${act.topic_title}</td>
            <td class="py-3 px-4">
                <span class="inline-block px-2 py-0.5 rounded text-xs text-white" style="background-color: ${act.subject_color}">
                    ${act.subject_name}
                </span>
            </td>
            <td class="py-3 px-4 text-slate-600 text-sm">${act.study_date} (${act.duration_minutes}m)</td>
            <td class="py-3 px-4 font-semibold ${act.quiz_score >= 75 ? 'text-emerald-600' : 'text-rose-600'}">
                ${act.quiz_score !== null ? `${act.quiz_score}%` : '<span class="text-slate-400 font-normal">Not tested</span>'}
            </td>
            <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
                    act.outcome === 'retained' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }">${act.outcome === 'retained' ? 'Retained' : 'Needs Revision'}</span>
            </td>
        </tr>
    `).join("");
}

// -------------------------------------------------------------------------
// 2. AI REVISION PLANNER
// -------------------------------------------------------------------------
async function loadPlanner(filterPriority = "ALL") {
    try {
        const data = await apiRequest("/planner/recommendations");
        const list = data.recommendations;
        const container = document.getElementById("planner-cards-container");
        if (!container) return;

        let filtered = list;
        if (filterPriority !== "ALL") {
            filtered = list.filter(item => item.priority === filterPriority);
        }

        // Summary counts
        document.getElementById("planner-count-high").textContent = data.summary.high_priority_count;
        document.getElementById("planner-count-med").textContent = data.summary.medium_priority_count;
        document.getElementById("planner-count-low").textContent = data.summary.low_priority_count;

        if (!filtered.length) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
                    <i class="fas fa-check-double text-4xl text-emerald-500 mb-3"></i>
                    <h3 class="text-base font-semibold text-slate-800">No topics in this priority tier</h3>
                    <p class="text-sm text-slate-500 mt-1">Keep studying and logging sessions to build your digital memory.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(item => `
            <div class="card-soft p-5 rounded-xl flex flex-col justify-between border-l-4 ${
                item.priority === 'HIGH' ? 'border-l-rose-500' :
                item.priority === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-emerald-500'
            }">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded text-white" style="background-color: ${item.subject_color}">
                            ${item.subject_name}
                        </span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                            item.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }">${item.priority_badge}</span>
                    </div>

                    <h4 class="text-lg font-bold text-slate-900 mb-1">${item.title}</h4>

                    <!-- Retention Progress Bar -->
                    <div class="mt-3 mb-4">
                        <div class="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
                            <span>Estimated Memory Retention</span>
                            <span class="font-bold ${item.retention_health_pct >= 70 ? 'text-emerald-600' : item.retention_health_pct >= 50 ? 'text-amber-600' : 'text-rose-600'}">
                                ${item.retention_health_pct}%
                            </span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div class="h-2 rounded-full ${item.retention_health_pct >= 70 ? 'bg-emerald-500' : item.retention_health_pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}" style="width: ${item.retention_health_pct}%"></div>
                        </div>
                    </div>

                    <!-- Key stats row -->
                    <div class="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center mb-3">
                        <div>
                            <div class="text-xs text-slate-500">Last Studied</div>
                            <div class="text-xs font-bold text-slate-800">${item.days_elapsed}d ago</div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-500">Quiz Score</div>
                            <div class="text-xs font-bold ${item.quiz_score !== null && item.quiz_score < 60 ? 'text-rose-600' : 'text-slate-800'}">
                                ${item.quiz_score !== null ? `${item.quiz_score}%` : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-500">Mistakes</div>
                            <div class="text-xs font-bold ${item.mistakes_count > 0 ? 'text-amber-600' : 'text-slate-800'}">
                                ${item.mistakes_count}
                            </div>
                        </div>
                    </div>

                    <!-- AI Diagnostic Explanation -->
                    <div class="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 leading-relaxed mb-4">
                        <i class="fas fa-lightbulb text-amber-500 mr-1.5"></i>
                        ${item.explanation}
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button onclick="markRevisedDirect(${item.topic_id})" class="flex-1 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition flex items-center justify-center gap-1.5">
                        <i class="fas fa-check"></i> Revised Today
                    </button>
                    <button onclick="startTopicQuiz(${item.topic_id})" class="flex-1 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-1.5">
                        <i class="fas fa-play"></i> Test Knowledge
                    </button>
                </div>
            </div>
        `).join("");

    } catch (e) {
        showToast("Error loading revision planner: " + e.message, "error");
    }
}

async function markRevisedDirect(topicId) {
    try {
        const res = await apiRequest(`/planner/revise/${topicId}`, {
            method: "POST",
            body: JSON.stringify({ notes: "Completed revision session" })
        });
        showToast(res.message, "success");
        if (state.currentTab === "dashboard") loadDashboard();
        if (state.currentTab === "planner") loadPlanner();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// -------------------------------------------------------------------------
// 3. DIGITAL MEMORY & STUDY HISTORY
// -------------------------------------------------------------------------
async function loadMemorySessions() {
    const search = document.getElementById("session-search")?.value || "";
    const subjectId = document.getElementById("session-filter-subject")?.value || "";
    const difficulty = document.getElementById("session-filter-difficulty")?.value || "";

    let endpoint = `/sessions?search=${encodeURIComponent(search)}`;
    if (subjectId) endpoint += `&subject_id=${subjectId}`;
    if (difficulty) endpoint += `&difficulty=${difficulty}`;

    try {
        const res = await apiRequest(endpoint);
        const sessions = res.sessions;
        const tbody = document.getElementById("memory-sessions-tbody");
        if (!tbody) return;

        // Also populate subjects dropdown filter if empty
        await populateSubjectDropdowns();

        if (!sessions.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">No study sessions matching filters.</td></tr>`;
            return;
        }

        tbody.innerHTML = sessions.map(s => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
                <td class="py-3 px-4 font-semibold text-slate-900">${s.topic_title}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-xs text-white" style="background-color: ${s.subject_color}">
                        ${s.subject_name}
                    </span>
                </td>
                <td class="py-3 px-4 text-slate-600">${s.study_date}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.difficulty === 'Easy' ? 'badge-diff-easy' :
                        s.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
                    }">${s.difficulty}</span>
                </td>
                <td class="py-3 px-4 text-slate-600">${s.duration_minutes} min</td>
                <td class="py-3 px-4 font-bold ${s.quiz_score >= 70 ? 'text-emerald-600' : s.quiz_score !== null ? 'text-rose-600' : 'text-slate-400 font-normal'}">
                    ${s.quiz_score !== null ? `${s.quiz_score}%` : '—'}
                </td>
                <td class="py-3 px-4 text-slate-600">${s.mistakes_count}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="deleteSession(${s.id})" class="text-rose-500 hover:text-rose-700 p-1 transition" title="Delete record">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (e) {
        showToast("Error loading memory sessions: " + e.message, "error");
    }
}

async function populateSubjectDropdowns() {
    try {
        const res = await apiRequest("/subjects");
        state.subjects = res.subjects;

        const filterSubject = document.getElementById("session-filter-subject");
        if (filterSubject && filterSubject.options.length <= 1) {
            filterSubject.innerHTML = '<option value="">All Subjects</option>' + 
                state.subjects.map(sub => `<option value="${sub.id}">${sub.name}</option>`).join("");
        }

        const modalSubject = document.getElementById("new-topic-subject");
        if (modalSubject) {
            modalSubject.innerHTML = state.subjects.map(sub => `<option value="${sub.id}">${sub.name}</option>`).join("");
        }

        // Populate topics dropdown in log session modal
        const topicsRes = await apiRequest("/topics");
        state.topics = topicsRes.topics;
        const sessionTopicSelect = document.getElementById("new-session-topic");
        if (sessionTopicSelect) {
            sessionTopicSelect.innerHTML = state.topics.map(t => `<option value="${t.id}">${t.title} (${t.subject_name})</option>`).join("");
        }
    } catch (e) {
        console.error(e);
    }
}

async function handleAddSessionSubmit(e) {
    e.preventDefault();
    const topic_id = parseInt(document.getElementById("new-session-topic").value);
    const study_date = document.getElementById("new-session-date").value;
    const duration_minutes = parseInt(document.getElementById("new-session-duration").value);
    const difficulty = document.getElementById("new-session-diff").value;
    const quiz_score_val = document.getElementById("new-session-score").value;
    const mistakes_count = parseInt(document.getElementById("new-session-mistakes").value) || 0;
    const revisions_count = parseInt(document.getElementById("new-session-revisions").value) || 0;
    const notes = document.getElementById("new-session-notes").value;

    const payload = {
        topic_id,
        study_date,
        duration_minutes,
        difficulty,
        quiz_score: quiz_score_val ? parseFloat(quiz_score_val) : null,
        mistakes_count,
        revisions_count,
        notes
    };

    try {
        const res = await apiRequest("/sessions", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        showToast(res.message, "success");
        closeModal("add-session-modal");
        loadMemorySessions();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteSession(id) {
    if (!confirm("Are you sure you want to remove this study session from your digital memory?")) return;
    try {
        const res = await apiRequest(`/sessions/${id}`, { method: "DELETE" });
        showToast(res.message, "success");
        loadMemorySessions();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// -------------------------------------------------------------------------
// 4. SUBJECTS & TOPICS
// -------------------------------------------------------------------------
async function loadSubjects() {
    try {
        const res = await apiRequest("/subjects");
        state.subjects = res.subjects;
        const container = document.getElementById("subjects-container");
        if (!container) return;

        const topicsRes = await apiRequest("/topics");
        const allTopics = topicsRes.topics;

        container.innerHTML = state.subjects.map(sub => {
            const subTopics = allTopics.filter(t => t.subject_id === sub.id);
            return `
                <div class="card-soft rounded-xl p-5">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm" style="background-color: ${sub.color}">
                                ${sub.code ? sub.code.substring(0, 4) : sub.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900">${sub.name}</h3>
                                <p class="text-xs text-slate-500">${sub.code ? `${sub.code} • ` : ''}${subTopics.length} topic${subTopics.length === 1 ? '' : 's'}</p>
                            </div>
                        </div>
                        <button onclick="deleteSubject(${sub.id})" class="text-slate-400 hover:text-rose-500 transition p-1" title="Delete subject">
                            <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                    </div>

                    ${sub.description ? `<p class="text-xs text-slate-600 mb-4">${sub.description}</p>` : ''}

                    <div class="space-y-2 mt-4 pt-3 border-t border-slate-100">
                        ${subTopics.map(t => `
                            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition text-xs">
                                <div class="font-medium text-slate-800">${t.title}</div>
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
                                        t.difficulty === 'Easy' ? 'badge-diff-easy' :
                                        t.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
                                    }">${t.difficulty}</span>
                                    <button onclick="startTopicQuiz(${t.id})" class="text-blue-600 hover:text-blue-800 p-1" title="Quiz this topic">
                                        <i class="fas fa-play"></i>
                                    </button>
                                </div>
                            </div>
                        `).join("")}
                    </div>

                    <button onclick="openAddTopicModal(${sub.id})" class="w-full mt-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 transition flex items-center justify-center gap-1.5">
                        <i class="fas fa-plus"></i> Add Topic
                    </button>
                </div>
            `;
        }).join("");

    } catch (e) {
        showToast("Error loading subjects: " + e.message, "error");
    }
}

async function handleAddSubjectSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("new-subject-name").value;
    const code = document.getElementById("new-subject-code").value;
    const color = document.getElementById("new-subject-color").value;
    const description = document.getElementById("new-subject-desc").value;

    try {
        const res = await apiRequest("/subjects", {
            method: "POST",
            body: JSON.stringify({ name, code, color, description })
        });
        showToast(res.message, "success");
        closeModal("add-subject-modal");
        loadSubjects();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function handleAddTopicSubmit(e) {
    e.preventDefault();
    const subject_id = parseInt(document.getElementById("new-topic-subject").value);
    const title = document.getElementById("new-topic-title").value;
    const difficulty = document.getElementById("new-topic-diff").value;
    const notes = document.getElementById("new-topic-notes").value;

    try {
        const res = await apiRequest("/topics", {
            method: "POST",
            body: JSON.stringify({ subject_id, title, difficulty, notes })
        });
        showToast(res.message, "success");
        closeModal("add-topic-modal");
        loadSubjects();
    } catch (err) {
        showToast(err.message, "error");
    }
}

function openAddTopicModal(subjectId = null) {
    populateSubjectDropdowns();
    if (subjectId) {
        const select = document.getElementById("new-topic-subject");
        if (select) select.value = subjectId;
    }
    openModal("add-topic-modal");
}

async function deleteSubject(id) {
    if (!confirm("Are you sure? Deleting this subject will remove all its topics and associated records.")) return;
    try {
        const res = await apiRequest(`/subjects/${id}`, { method: "DELETE" });
        showToast(res.message, "success");
        loadSubjects();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// -------------------------------------------------------------------------
// 5. QUIZ SYSTEM
// -------------------------------------------------------------------------
async function loadQuizCenter() {
    try {
        const res = await apiRequest("/quizzes/topics");
        const topics = res.topics;
        const container = document.getElementById("quiz-topics-grid");
        if (!container) return;

        container.innerHTML = topics.map(t => `
            <div class="card-soft rounded-xl p-5 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded text-white" style="background-color: ${t.subject_color}">
                            ${t.subject_name}
                        </span>
                        <span class="text-xs font-medium px-2 py-0.5 rounded-full ${
                            t.difficulty === 'Easy' ? 'badge-diff-easy' :
                            t.difficulty === 'Medium' ? 'badge-diff-medium' : 'badge-diff-hard'
                        }">${t.difficulty}</span>
                    </div>

                    <h4 class="text-base font-bold text-slate-900 mb-2">${t.title}</h4>
                    
                    <div class="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100">
                        <span><i class="fas fa-question-circle mr-1"></i> ${t.question_count} question${t.question_count === 1 ? '' : 's'}</span>
                        <span>Latest: <strong class="${t.latest_score >= 70 ? 'text-emerald-600' : 'text-slate-800'}">${t.latest_score !== null ? `${t.latest_score}%` : 'Not taken'}</strong></span>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button onclick="startTopicQuiz(${t.id})" class="flex-1 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm">
                        <i class="fas fa-play"></i> Start Quiz
                    </button>
                    <button onclick="openAddQuestionModal(${t.id})" class="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition" title="Add Question">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join("");

        // Load Quiz History table
        loadQuizHistory();

    } catch (e) {
        showToast("Error loading quiz topics: " + e.message, "error");
    }
}

async function loadQuizHistory() {
    try {
        const res = await apiRequest("/quizzes/history");
        const attempts = res.attempts;
        const tbody = document.getElementById("quiz-history-tbody");
        if (!tbody) return;

        if (!attempts.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">No quiz attempts recorded yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = attempts.map(a => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
                <td class="py-3 px-4 font-semibold text-slate-800">${a.topic_title}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-xs text-white" style="background-color: ${a.subject_color}">
                        ${a.subject_name}
                    </span>
                </td>
                <td class="py-3 px-4 font-bold ${a.score >= 75 ? 'text-emerald-600' : 'text-rose-600'}">
                    ${a.score}%
                </td>
                <td class="py-3 px-4 text-slate-600">${a.correct_count} / ${a.total_questions}</td>
                <td class="py-3 px-4 text-amber-600 font-medium">${a.mistakes_count}</td>
                <td class="py-3 px-4 text-slate-500 text-xs">${a.taken_at}</td>
            </tr>
        `).join("");
    } catch (e) {
        console.error(e);
    }
}

async function startTopicQuiz(topicId) {
    try {
        const res = await apiRequest(`/quizzes/${topicId}/questions`);
        state.activeQuiz = {
            topic: res.topic,
            questions: res.questions
        };
        state.quizAnswers = {};

        if (!res.questions.length) {
            showToast("No questions available for this topic yet. Add questions first!", "warning");
            return;
        }

        renderActiveQuizModal();
    } catch (e) {
        showToast("Failed to start quiz: " + e.message, "error");
    }
}

function renderActiveQuizModal() {
    const modal = document.getElementById("quiz-taking-modal");
    if (!modal) return;

    document.getElementById("quiz-modal-topic-title").textContent = state.activeQuiz.topic.title;
    document.getElementById("quiz-modal-q-count").textContent = `${state.activeQuiz.questions.length} Questions`;

    const container = document.getElementById("quiz-questions-list");
    container.innerHTML = state.activeQuiz.questions.map((q, idx) => `
        <div class="p-5 rounded-xl border border-slate-200 bg-white mb-4">
            <div class="flex items-start gap-3 mb-3">
                <span class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    ${idx + 1}
                </span>
                <p class="font-medium text-slate-900 text-sm leading-snug">${q.question_text}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 ml-10">
                ${['A', 'B', 'C', 'D'].map(opt => `
                    <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition text-xs text-slate-700">
                        <input type="radio" name="question_${q.id}" value="${opt}" onchange="selectQuizOption(${q.id}, '${opt}')" class="text-blue-600 focus:ring-blue-500 h-4 w-4">
                        <span class="font-bold text-slate-900">${opt}.</span>
                        <span>${q[`option_${opt.toLowerCase()}`]}</span>
                    </label>
                `).join("")}
            </div>
        </div>
    `).join("");

    // Hide results pane, show quiz pane
    document.getElementById("quiz-modal-questions-pane").classList.remove("hidden");
    document.getElementById("quiz-modal-results-pane").classList.add("hidden");
    document.getElementById("btn-submit-quiz").classList.remove("hidden");

    openModal("quiz-taking-modal");
}

function selectQuizOption(questionId, option) {
    state.quizAnswers[questionId] = option;
}

async function submitActiveQuiz() {
    const qCount = state.activeQuiz.questions.length;
    const answeredCount = Object.keys(state.quizAnswers).length;

    if (answeredCount < qCount) {
        if (!confirm(`You have only answered ${answeredCount} of ${qCount} questions. Submit anyway?`)) {
            return;
        }
    }

    try {
        const res = await apiRequest(`/quizzes/${state.activeQuiz.topic.id}/attempt`, {
            method: "POST",
            body: JSON.stringify({ answers: state.quizAnswers })
        });

        // Show Results Pane inside the modal
        renderQuizResults(res);
        showToast(`Quiz completed! Score: ${res.score}%`, res.score >= 70 ? "success" : "info");
    } catch (e) {
        showToast("Error submitting quiz: " + e.message, "error");
    }
}

function renderQuizResults(result) {
    document.getElementById("quiz-modal-questions-pane").classList.add("hidden");
    document.getElementById("btn-submit-quiz").classList.add("hidden");
    
    const resultsPane = document.getElementById("quiz-modal-results-pane");
    resultsPane.classList.remove("hidden");

    // Score header
    document.getElementById("quiz-res-score").textContent = `${result.score}%`;
    document.getElementById("quiz-res-stats").textContent = `${result.correct_count} correct • ${result.mistakes_count} mistakes out of ${result.total_questions} questions`;
    
    const badge = document.getElementById("quiz-res-badge");
    if (result.score >= 70) {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800";
        badge.textContent = "Proficient / Well Retained";
    } else {
        badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800";
        badge.textContent = "Revision Recommended";
    }

    // Detailed question-by-question review with explanations
    const reviewList = document.getElementById("quiz-res-review-list");
    reviewList.innerHTML = result.detailed_results.map((r, idx) => `
        <div class="p-4 rounded-xl border ${r.is_correct ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'} mb-3">
            <div class="flex items-start justify-between gap-2 mb-2">
                <span class="font-bold text-xs ${r.is_correct ? 'text-emerald-700' : 'text-rose-700'}">
                    Question ${idx + 1} • ${r.is_correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <span class="text-xs text-slate-500">Your answer: <strong>${r.student_answer || 'None'}</strong> | Correct: <strong>${r.correct_answer}</strong></span>
            </div>
            <p class="text-sm font-medium text-slate-900 mb-2">${r.question_text}</p>
            <div class="text-xs p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                <strong class="text-slate-900"><i class="fas fa-info-circle text-blue-500 mr-1"></i> Explanation:</strong> ${r.explanation}
            </div>
        </div>
    `).join("");

    // Refresh underlying data
    if (state.currentTab === "quizzes") loadQuizHistory();
}

function openAddQuestionModal(topicId) {
    document.getElementById("custom-q-topic-id").value = topicId;
    openModal("add-question-modal");
}

async function handleAddQuestionSubmit(e) {
    e.preventDefault();
    const topic_id = parseInt(document.getElementById("custom-q-topic-id").value);
    const question_text = document.getElementById("custom-q-text").value;
    const option_a = document.getElementById("custom-q-a").value;
    const option_b = document.getElementById("custom-q-b").value;
    const option_c = document.getElementById("custom-q-c").value;
    const option_d = document.getElementById("custom-q-d").value;
    const correct_option = document.getElementById("custom-q-correct").value;
    const explanation = document.getElementById("custom-q-expl").value;

    try {
        const res = await apiRequest(`/quizzes/${topic_id}/questions`, {
            method: "POST",
            body: JSON.stringify({ question_text, option_a, option_b, option_c, option_d, correct_option, explanation })
        });
        showToast(res.message, "success");
        closeModal("add-question-modal");
        loadQuizCenter();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// -------------------------------------------------------------------------
// 6. MACHINE LEARNING MODEL LAB
// -------------------------------------------------------------------------
async function loadMLLab() {
    try {
        const res = await apiRequest("/ml/status");
        
        // Metadata
        document.getElementById("ml-sample-count").textContent = res.training_sample_count;
        document.getElementById("ml-last-trained").textContent = res.last_trained_at || "Just now";

        // Metrics Table
        const metrics = res.model_comparison;
        const tbody = document.getElementById("ml-metrics-tbody");
        if (tbody) {
            const models = [
                { id: "logistic_regression", name: "Logistic Regression (Baseline)" },
                { id: "random_forest", name: "Random Forest Classifier (Ensemble)" },
                { id: "gradient_boosting", name: "Gradient Boosting (XGBoost Equiv.)" }
            ];

            tbody.innerHTML = models.map(m => {
                const met = metrics[m.id] || {};
                return `
                    <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-sm">
                        <td class="py-3 px-4 font-semibold text-slate-800">${m.name}</td>
                        <td class="py-3 px-4 font-bold text-blue-600">${met.accuracy !== undefined ? (met.accuracy * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 text-slate-700">${met.precision !== undefined ? (met.precision * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 text-slate-700">${met.recall !== undefined ? (met.recall * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 font-semibold text-emerald-600">${met.f1_score !== undefined ? (met.f1_score * 100).toFixed(1) + '%' : 'N/A'}</td>
                        <td class="py-3 px-4 text-slate-500 text-xs">${met.test_samples || 0} samples</td>
                    </tr>
                `;
            }).join("");
        }

        // Feature Importance Bars
        const featContainer = document.getElementById("ml-feature-importance-bars");
        if (featContainer && res.feature_importance.random_forest) {
            const rfImp = res.feature_importance.random_forest;
            const friendlyNames = {
                days_since_last_study: "Days Elapsed Since Study",
                latest_quiz_score: "Latest Quiz Score",
                mistakes_count: "Recorded Mistakes Count",
                revisions_count: "Prior Revisions Completed",
                study_duration_minutes: "Study Session Duration",
                difficulty_level: "Topic Difficulty Rating"
            };

            const sortedFeats = Object.entries(rfImp).sort((a, b) => b[1] - a[1]);
            const maxVal = sortedFeats[0][1] || 1;

            featContainer.innerHTML = sortedFeats.map(([fName, val]) => {
                const pct = Math.round((val / maxVal) * 100);
                return `
                    <div class="mb-3">
                        <div class="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>${friendlyNames[fName] || fName}</span>
                            <span>${(val * 100).toFixed(1)}%</span>
                        </div>
                        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join("");
        }

    } catch (e) {
        showToast("Error loading ML Lab: " + e.message, "error");
    }
}

async function retrainModels() {
    try {
        showToast("Retraining ML models on dataset...", "info");
        const res = await apiRequest("/ml/train", { method: "POST" });
        showToast(res.message, "success");
        loadMLLab();
    } catch (e) {
        showToast(e.message, "error");
    }
}

// Live ML Sandbox Inference
async function runMLSandboxPrediction() {
    const days = parseFloat(document.getElementById("sb-days").value);
    const score = parseFloat(document.getElementById("sb-score").value);
    const mistakes = parseInt(document.getElementById("sb-mistakes").value);
    const revisions = parseInt(document.getElementById("sb-revisions").value);
    const duration = parseInt(document.getElementById("sb-duration").value);
    const difficulty = parseInt(document.getElementById("sb-difficulty").value);

    // Update label displays
    document.getElementById("sb-days-val").textContent = `${days} days`;
    document.getElementById("sb-score-val").textContent = `${score}%`;
    document.getElementById("sb-mistakes-val").textContent = mistakes;
    document.getElementById("sb-revisions-val").textContent = revisions;

    try {
        const res = await apiRequest("/ml/predict", {
            method: "POST",
            body: JSON.stringify({
                days_since_last_study: days,
                latest_quiz_score: score,
                mistakes_count: mistakes,
                revisions_count: revisions,
                study_duration_minutes: duration,
                difficulty_level: difficulty
            })
        });

        const r = res.result;
        const resultCard = document.getElementById("sb-result-card");
        resultCard.classList.remove("hidden");

        const probaPct = Math.round(r.consensus_forgetting_probability * 100);
        document.getElementById("sb-res-prob").textContent = `${probaPct}%`;
        
        const badge = document.getElementById("sb-res-badge");
        if (r.predicted_needs_revision) {
            badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800";
            badge.textContent = "Needs Revision (High Forgetting Risk)";
        } else {
            badge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800";
            badge.textContent = "Retained in Memory";
        }

        // Breakdown table
        const b = r.model_breakdown;
        document.getElementById("sb-res-breakdown").innerHTML = `
            <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-600">Logistic Regression</span>
                <strong>${(b.logistic_regression.probability * 100).toFixed(1)}% (${b.logistic_regression.prediction})</strong>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-600">Random Forest</span>
                <strong>${(b.random_forest.probability * 100).toFixed(1)}% (${b.random_forest.prediction})</strong>
            </div>
            <div class="flex justify-between py-1">
                <span class="text-slate-600">Gradient Boosting</span>
                <strong>${(b.gradient_boosting.probability * 100).toFixed(1)}% (${b.gradient_boosting.prediction})</strong>
            </div>
        `;

        // Risk factors
        const riskUl = document.getElementById("sb-res-risks");
        riskUl.innerHTML = r.risk_factors.map(rf => `<li class="flex items-center gap-1.5"><i class="fas fa-arrow-right text-rose-500 text-[10px]"></i> ${rf}</li>`).join("");

    } catch (e) {
        console.error(e);
    }
}

// -------------------------------------------------------------------------
// 7. PROFILE & SETTINGS
// -------------------------------------------------------------------------
async function loadProfile() {
    if (!state.student) return;
    document.getElementById("prof-name").value = state.student.name || "";
    document.getElementById("prof-email").value = state.student.email || "";
    document.getElementById("prof-goals").value = state.student.study_goals || "";
    document.getElementById("prof-target-min").value = state.student.daily_target_minutes || 60;
    document.getElementById("prof-subjects").value = state.student.subjects_interest || "";
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("prof-name").value;
    const study_goals = document.getElementById("prof-goals").value;
    const daily_target_minutes = parseInt(document.getElementById("prof-target-min").value);
    const subjects_interest = document.getElementById("prof-subjects").value;

    try {
        const res = await apiRequest("/auth/profile", {
            method: "PUT",
            body: JSON.stringify({ name, study_goals, daily_target_minutes, subjects_interest })
        });
        showToast(res.message, "success");
        state.student.name = name;
        state.student.study_goals = study_goals;
        state.student.daily_target_minutes = daily_target_minutes;
        state.student.subjects_interest = subjects_interest;
        renderAuthenticatedApp();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// -------------------------------------------------------------------------
// MODAL HELPERS
// -------------------------------------------------------------------------
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("hidden");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("hidden");
}

function openAddSessionModal() {
    populateSubjectDropdowns();
    document.getElementById("new-session-date").value = new Date().toISOString().split("T")[0];
    openModal("add-session-modal");
}
