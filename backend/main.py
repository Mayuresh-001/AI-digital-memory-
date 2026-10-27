import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import init_db, seed_demo_data
from .ml_engine import ml_engine
from .routes.auth_routes import router as auth_router
from .routes.subject_routes import router as subject_router
from .routes.session_routes import router as session_router
from .routes.quiz_routes import router as quiz_router
from .routes.planner_routes import router as planner_router
from .routes.ml_routes import router as ml_router
from .routes.analytics_routes import router as analytics_router

STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database tables & demo seed data are initialized
    init_db()
    seed_demo_data()
    # Ensure ML models are trained
    if not ml_engine.is_trained:
        ml_engine.train_models()
    print("AI Digital Memory for Students backend initialized successfully.")
    yield

app = FastAPI(
    title="AI Digital Memory for Students",
    description="Machine Learning Based Personalized Revision System with Ebbinghaus Spaced Repetition",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)
app.include_router(subject_router)
app.include_router(session_router)
app.include_router(quiz_router)
app.include_router(planner_router)
app.include_router(ml_router)
app.include_router(analytics_router)

# Serve static files for frontend SPA
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
