import uuid
import datetime
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import UPLOAD_DIR
from app.models.incident import Incident
from app.models.resource import Resource
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse
from app.schemas.agent import PipelineRunResponse
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    verification_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if category and category != "All":
        query = query.filter(Incident.category == category)
    if severity and severity != "All":
        query = query.filter(Incident.severity == severity)
    if status and status != "All":
        query = query.filter(Incident.status == status)
    if verification_status and verification_status != "All":
        query = query.filter(Incident.verification_status == verification_status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Incident.title.ilike(s)) |
            (Incident.description.ilike(s)) |
            (Incident.location_name.ilike(s)) |
            (Incident.id.ilike(s))
        )
    return query.order_by(Incident.created_at.desc()).all()

@router.get("/{id}", response_model=IncidentResponse)
def get_incident(id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("", response_model=IncidentResponse)
def create_incident(
    data: IncidentCreate,
    trigger_ai: bool = Query(True, description="Whether to immediately run the 6-agent analysis"),
    db: Session = Depends(get_db)
):
    # Generate unique ID
    count = db.query(Incident).count() + 1
    inc_id = f"INC-2026-{count:03d}"
    
    incident = Incident(
        id=inc_id,
        title=data.title,
        description=data.description,
        category=data.category or "Other",
        status="Reported",
        location_name=data.location_name,
        latitude=data.latitude,
        longitude=data.longitude,
        image_url=data.image_url,
        people_affected=data.people_affected or 0,
        affected_area=data.affected_area or "Local vicinity",
        hazards=data.hazards or "Under initial assessment",
        severity="Medium",
        risk_score=50.0,
        confidence_score=65.0,
        verification_status="Needs Review",
        pipeline_status="Processing" if trigger_ai else "Idle"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    if trigger_ai:
        inc_dict = {
            "id": incident.id,
            "title": incident.title,
            "description": incident.description,
            "category": incident.category,
            "location_name": incident.location_name,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "image_url": incident.image_url,
            "people_affected": incident.people_affected,
            "created_at": incident.created_at.isoformat()
        }
        orchestrator.run_pipeline(inc_dict, db)
        db.refresh(incident)

    return incident

@router.patch("/{id}", response_model=IncidentResponse)
def update_incident(id: str, data: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(incident, field, val)

    incident.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(incident)
    return incident

@router.post("/{id}/analyze", response_model=PipelineRunResponse)
def trigger_agent_analysis(id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    inc_dict = {
        "id": incident.id,
        "title": incident.title,
        "description": incident.description,
        "category": incident.category,
        "location_name": incident.location_name,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "image_url": incident.image_url,
        "people_affected": incident.people_affected,
        "created_at": incident.created_at.isoformat()
    }
    
    result = orchestrator.run_pipeline(inc_dict, db)
    return result

@router.post("/upload-image")
async def upload_incident_image(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix or ".jpg"
    unique_filename = f"{uuid.uuid4()}{ext}"
    dest_path = UPLOAD_DIR / unique_filename
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/uploads/{unique_filename}", "filename": file.filename}
