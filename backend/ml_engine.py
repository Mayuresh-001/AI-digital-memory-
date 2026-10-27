import os
import joblib
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from .database import get_db

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "models"))
FEATURE_NAMES = [
    "days_since_last_study",
    "latest_quiz_score",
    "mistakes_count",
    "revisions_count",
    "study_duration_minutes",
    "difficulty_level"
]

class MLEngine:
    def __init__(self):
        os.makedirs(MODELS_DIR, exist_ok=True)
        self.scaler = None
        self.models = {}
        self.metrics = {}
        self.is_trained = False
        self.last_trained_at = None
        self.training_sample_count = 0
        self.feature_importance = {}
        self.load_or_train()

    def load_dataset(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
        SELECT days_since_last_study, latest_quiz_score, mistakes_count, 
               revisions_count, study_duration_minutes, difficulty_level, needs_revision
        FROM ml_dataset
        """)
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            return None, None

        X = []
        y = []
        for r in rows:
            X.append([
                float(r["days_since_last_study"]),
                float(r["latest_quiz_score"]),
                float(r["mistakes_count"]),
                float(r["revisions_count"]),
                float(r["study_duration_minutes"]),
                float(r["difficulty_level"])
            ])
            y.append(int(r["needs_revision"]))

        return np.array(X), np.array(y)

    def train_models(self) -> dict:
        X, y = self.load_dataset()
        if X is None or len(X) < 20:
            return {"status": "error", "message": "Insufficient labeled training data (need at least 20 samples)."}

        self.training_sample_count = len(X)

        # Train/test split with stratification for honest evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scaler = scaler

        # 1. Baseline: Logistic Regression
        lr = LogisticRegression(max_iter=1000, random_state=42)
        lr.fit(X_train_scaled, y_train)
        lr_pred = lr.predict(X_test_scaled)
        lr_proba = lr.predict_proba(X_test_scaled)[:, 1]

        # 2. Non-linear Ensemble: Random Forest
        rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        rf.fit(X_train, y_train)  # Tree ensembles can work directly on unscaled
        rf_pred = rf.predict(X_test)
        rf_proba = rf.predict_proba(X_test)[:, 1]

        # 3. Advanced Boosting: Gradient Boosting (comparable to XGBoost)
        gb = GradientBoostingClassifier(n_estimators=80, learning_rate=0.1, max_depth=3, random_state=42)
        gb.fit(X_train, y_train)
        gb_pred = gb.predict(X_test)
        gb_proba = gb.predict_proba(X_test)[:, 1]

        # Compute genuine evaluation metrics on held-out test set
        def eval_metrics(y_true, y_pred):
            cm = confusion_matrix(y_true, y_pred).tolist()
            return {
                "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
                "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
                "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
                "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
                "confusion_matrix": cm,
                "test_samples": len(y_true)
            }

        self.models = {
            "logistic_regression": lr,
            "random_forest": rf,
            "gradient_boosting": gb
        }

        self.metrics = {
            "logistic_regression": eval_metrics(y_test, lr_pred),
            "random_forest": eval_metrics(y_test, rf_pred),
            "gradient_boosting": eval_metrics(y_test, gb_pred)
        }

        # Calculate genuine feature importances
        # For Logistic Regression: normalized coefficients
        lr_coefs = lr.coef_[0]
        lr_importance = {
            FEATURE_NAMES[i]: {
                "weight": round(float(lr_coefs[i]), 4),
                "direction": "Increases Revision Need" if lr_coefs[i] > 0 else "Decreases Revision Need"
            }
            for i in range(len(FEATURE_NAMES))
        }

        # For Random Forest: Gini feature importances
        rf_importances = rf.feature_importances_
        rf_importance = {
            FEATURE_NAMES[i]: round(float(rf_importances[i]), 4)
            for i in range(len(FEATURE_NAMES))
        }

        self.feature_importance = {
            "logistic_regression": lr_importance,
            "random_forest": rf_importance
        }

        self.is_trained = True
        self.last_trained_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Save artifacts to disk
        joblib.dump(self.models, os.path.join(MODELS_DIR, "models.joblib"))
        joblib.dump(self.scaler, os.path.join(MODELS_DIR, "scaler.joblib"))
        joblib.dump({
            "metrics": self.metrics,
            "feature_importance": self.feature_importance,
            "last_trained_at": self.last_trained_at,
            "training_sample_count": self.training_sample_count
        }, os.path.join(MODELS_DIR, "meta.joblib"))

        return {
            "status": "success",
            "message": f"Successfully trained and evaluated models on {self.training_sample_count} labeled records.",
            "metrics": self.metrics,
            "last_trained_at": self.last_trained_at
        }

    def load_or_train(self):
        models_path = os.path.join(MODELS_DIR, "models.joblib")
        meta_path = os.path.join(MODELS_DIR, "meta.joblib")
        scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")

        if os.path.exists(models_path) and os.path.exists(meta_path) and os.path.exists(scaler_path):
            try:
                self.models = joblib.load(models_path)
                self.scaler = joblib.load(scaler_path)
                meta = joblib.load(meta_path)
                self.metrics = meta.get("metrics", {})
                self.feature_importance = meta.get("feature_importance", {})
                self.last_trained_at = meta.get("last_trained_at")
                self.training_sample_count = meta.get("training_sample_count", 0)
                self.is_trained = True
                return
            except Exception as e:
                print(f"Error loading models: {e}. Retraining...")

        # Train freshly if not yet persisted
        self.train_models()

    def predict(self, days: float, score: float, mistakes: int, revisions: int, duration: int, difficulty_level: int) -> dict:
        """
        Runs inference across trained ML models and provides a consensus probability.
        """
        if not self.is_trained or not self.models:
            self.train_models()

        raw_features = np.array([[days, score, mistakes, revisions, duration, difficulty_level]])
        scaled_features = self.scaler.transform(raw_features)

        lr = self.models["logistic_regression"]
        rf = self.models["random_forest"]
        gb = self.models["gradient_boosting"]

        lr_proba = float(lr.predict_proba(scaled_features)[0][1])
        rf_proba = float(rf.predict_proba(raw_features)[0][1])
        gb_proba = float(gb.predict_proba(raw_features)[0][1])

        # Ensemble consensus probability (weighted average: RF & GB hold higher weight for non-linearities)
        consensus_proba = round(0.25 * lr_proba + 0.40 * rf_proba + 0.35 * gb_proba, 3)
        predicted_class = 1 if consensus_proba >= 0.50 else 0

        # Feature impact breakdown
        risk_factors = []
        if days >= 5:
            risk_factors.append(f"Significant decay: {days:.1f} days elapsed since study")
        if score < 65:
            risk_factors.append(f"Low quiz mastery: {score:.0f}% score")
        if mistakes >= 2:
            risk_factors.append(f"High mistake volume: {mistakes} mistakes recorded")
        if difficulty_level == 3:
            risk_factors.append("Challenging topic complexity (Hard)")
        if revisions >= 2:
            risk_factors.append(f"Stabilized by {revisions} previous revisions")

        return {
            "predicted_needs_revision": bool(predicted_class),
            "consensus_forgetting_probability": consensus_proba,
            "model_breakdown": {
                "logistic_regression": {
                    "probability": round(lr_proba, 3),
                    "prediction": "Needs Revision" if lr_proba >= 0.5 else "Retained"
                },
                "random_forest": {
                    "probability": round(rf_proba, 3),
                    "prediction": "Needs Revision" if rf_proba >= 0.5 else "Retained"
                },
                "gradient_boosting": {
                    "probability": round(gb_proba, 3),
                    "prediction": "Needs Revision" if gb_proba >= 0.5 else "Retained"
                }
            },
            "risk_factors": risk_factors
        }

ml_engine = MLEngine()
