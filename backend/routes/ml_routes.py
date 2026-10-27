from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..ml_engine import ml_engine, FEATURE_NAMES
from ..database import get_db
from ..auth import get_current_student

router = APIRouter(prefix="/api/ml", tags=["Machine Learning Engine"])

class PredictSandboxRequest(BaseModel):
    days_since_last_study: float
    latest_quiz_score: float
    mistakes_count: int
    revisions_count: int
    study_duration_minutes: int
    difficulty_level: int # 1: Easy, 2: Medium, 3: Hard

class AddSampleRequest(BaseModel):
    days_since_last_study: float
    latest_quiz_score: float
    mistakes_count: int
    revisions_count: int
    study_duration_minutes: int
    difficulty_level: int
    needs_revision: int # 0 or 1

@router.get("/status")
def get_ml_status(current_student: dict = Depends(get_current_student)):
    return {
        "status": "success",
        "is_trained": ml_engine.is_trained,
        "last_trained_at": ml_engine.last_trained_at,
        "training_sample_count": ml_engine.training_sample_count,
        "features": FEATURE_NAMES,
        "model_comparison": ml_engine.metrics,
        "feature_importance": ml_engine.feature_importance,
        "methodology": {
            "evaluation_strategy": "Held-out Stratified Test Split (25%)",
            "models": [
                {"name": "Logistic Regression", "role": "Interpretable linear baseline with L2 regularization"},
                {"name": "Random Forest Classifier", "role": "Ensemble of 100 decision trees capturing non-linear feature interactions"},
                {"name": "Gradient Boosting Classifier", "role": "Sequential tree boosting minimizing log loss (comparable to XGBoost)"}
            ]
        }
    }

@router.post("/train")
def train_models(current_student: dict = Depends(get_current_student)):
    result = ml_engine.train_models()
    return result

@router.post("/predict")
def predict_sandbox(req: PredictSandboxRequest, current_student: dict = Depends(get_current_student)):
    if req.difficulty_level not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Difficulty level must be 1 (Easy), 2 (Medium), or 3 (Hard).")

    prediction = ml_engine.predict(
        days=req.days_since_last_study,
        score=req.latest_quiz_score,
        mistakes=req.mistakes_count,
        revisions=req.revisions_count,
        duration=req.study_duration_minutes,
        difficulty_level=req.difficulty_level
    )

    return {
        "status": "success",
        "input_features": req.dict(),
        "result": prediction
    }

@router.post("/add-training-sample")
def add_training_sample(req: AddSampleRequest, current_student: dict = Depends(get_current_student)):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO ml_dataset 
    (days_since_last_study, latest_quiz_score, mistakes_count, revisions_count, study_duration_minutes, difficulty_level, needs_revision, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'student_feedback')
    """, (
        req.days_since_last_study,
        req.latest_quiz_score,
        req.mistakes_count,
        req.revisions_count,
        req.study_duration_minutes,
        req.difficulty_level,
        req.needs_revision
    ))
    conn.commit()
    conn.close()

    # Automatically retrain with new data
    ml_engine.train_models()

    return {"status": "success", "message": "Sample added and ML models retrained."}
