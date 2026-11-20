from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.seed_data import seed_database
from app.services.llm_service import llm_service

router = APIRouter(prefix="/system", tags=["system"])

@router.post("/reset-demo-data")
def reset_demo_data(db: Session = Depends(get_db)):
    seed_database(db, force_reset=True)
    return {"message": "Demo data successfully reset and freshly seeded with realistic emergency scenarios and resources."}

@router.get("/test-gemini")
def test_gemini_connection():
    """Validates live Gemini API connectivity, model availability, and latency."""
    return llm_service.test_connection()
