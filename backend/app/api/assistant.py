from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant_service import assistant_service

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    return assistant_service.process_query(
        query=req.message,
        db=db,
        selected_incident_id=req.selected_incident_id
    )

@router.get("/suggestions")
def get_chat_suggestions():
    return [
        "What are the current critical incidents?",
        "Show all flood-related reports and assets",
        "Which reports are still unverified?",
        "What resources are currently available?",
        "Which hospitals are near a critical incident?",
        "Summarize today's emergency situation",
        "Which incidents have the highest risk score?",
        "Generate a response plan for INC-2026-001"
    ]
