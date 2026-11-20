import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings, UPLOAD_DIR
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.services.llm_service import llm_service
from app.api.incidents import router as incidents_router
from app.api.resources import router as resources_router
from app.api.agents import router as agents_router
from app.api.dashboard import router as dashboard_router
from app.api.analytics import router as analytics_router
from app.api.assistant import router as assistant_router
from app.api.system import router as system_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed initial demo data
    db = SessionLocal()
    try:
        seed_database(db, force_reset=False)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multi-Agent Emergency Command Centre orchestrating 6 specialized AI agents for disaster management powered by Google Gemini.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded disaster images
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API routers
app.include_router(incidents_router, prefix=settings.API_PREFIX)
app.include_router(resources_router, prefix=settings.API_PREFIX)
app.include_router(agents_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(assistant_router, prefix=settings.API_PREFIX)
app.include_router(system_router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def healthcheck():
    gemini_status = "Connected (google.genai)" if llm_service.client_ready else "Fallback Heuristic Mode"
    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "agents_available": 6,
        "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        "ai_engine": f"Gemini Intelligence Pipeline: {gemini_status}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
