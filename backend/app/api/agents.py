import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.agent_log import AgentLog
from app.models.incident import Incident
from app.schemas.agent import AgentStatusInfo
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/agents", tags=["agents"])

AGENTS_METADATA = [
    {
        "agent_id": "report_collection",
        "agent_name": "Report Collection Agent",
        "role": "Ingestion, metadata normalization, sensor & citizen payload validation."
    },
    {
        "agent_id": "verification",
        "agent_name": "Verification Agent",
        "role": "Proximity clustering, duplicate detection, credibility score & anomaly flags."
    },
    {
        "agent_id": "classification",
        "agent_name": "Incident Classification Agent",
        "role": "Disaster taxonomy mapping, secondary hazard identification, impact radius."
    },
    {
        "agent_id": "severity",
        "agent_name": "Severity Assessment Agent",
        "role": "Threat-to-life risk scoring, escalation velocity, priority classification."
    },
    {
        "agent_id": "resource_coordination",
        "agent_name": "Resource Coordination Agent",
        "role": "Asset availability matrix, spatial routing proximity, deployment matching."
    },
    {
        "agent_id": "action_planning",
        "agent_name": "Action Planning Agent",
        "role": "Multi-agent synthesis, tactical incident commander action plan & disclaimers."
    }
]

@router.get("/status", response_model=List[AgentStatusInfo])
def get_agents_status(db: Session = Depends(get_db)):
    statuses = []
    for meta in AGENTS_METADATA:
        aid = meta["agent_id"]
        count = db.query(AgentLog).filter(AgentLog.agent_id == aid).count()
        avg_lat = db.query(func.avg(AgentLog.execution_time_ms)).filter(AgentLog.agent_id == aid).scalar() or 45.0
        last_log = db.query(AgentLog).filter(AgentLog.agent_id == aid).order_by(AgentLog.created_at.desc()).first()

        statuses.append(AgentStatusInfo(
            agent_id=aid,
            agent_name=meta["agent_name"],
            role=meta["role"],
            status="Active / Standby" if count > 0 else "Idle",
            total_processed=count,
            avg_latency_ms=round(float(avg_lat), 1),
            last_active=last_log.created_at if last_log else None
        ))
    return statuses

@router.get("/logs")
def get_agent_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AgentLog).order_by(AgentLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "incident_id": l.incident_id,
            "agent_id": l.agent_id,
            "agent_name": l.agent_name,
            "status": l.status,
            "execution_time_ms": l.execution_time_ms,
            "input_summary": l.input_summary,
            "output": l.output_data,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]

@router.post("/run-demo-flood")
def run_demo_flood_workflow(db: Session = Depends(get_db)):
    """
    Executes the comprehensive Flood Demonstration Workflow (Section 17):
    - Submits a realistic flash flood report with photo & coordinates
    - Steps through Agent 1 to Agent 6
    - Updates database and generates real-time pipeline visualization artifact
    """
    count = db.query(Incident).count() + 1
    flood_id = f"INC-2026-{count:03d}"
    
    flood_payload = {
        "id": flood_id,
        "title": "Severe Flash Flood Inundation & Trapped Civilians",
        "description": "Continuous cloudburst rainfall has swollen the local river, flooding over 6 residential streets with rapidly rising water (over 1.4 meters depth). Multiple residents trapped on rooftops, power transformers submerged, and passenger vehicles floating. Swiftwater evacuation boats urgently required.",
        "category": "Flood",
        "location_name": "Riverside Lowland Residential District, Sector 4",
        "latitude": 37.7680,
        "longitude": -122.4090,
        "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "people_affected": 85,
        "affected_area": "4 square blocks around Riverside Ave & 7th St",
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    # Create new incident record
    inc = Incident(
        id=flood_id,
        title=flood_payload["title"],
        description=flood_payload["description"],
        category="Flood",
        status="Reported",
        location_name=flood_payload["location_name"],
        latitude=flood_payload["latitude"],
        longitude=flood_payload["longitude"],
        image_url=flood_payload["image_url"],
        people_affected=85,
        affected_area="Riverside Sector 4 (approx 2 sq km)",
        hazards="1.4m rising water, submerged electrical mains, trapped civilians",
        severity="Critical",
        risk_score=94.0,
        confidence_score=92.0,
        verification_status="Verified",
        pipeline_status="Processing"
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)

    # Execute full multi-agent pipeline
    pipeline_result = orchestrator.run_pipeline(flood_payload, db)
    db.refresh(inc)

    return {
        "message": "Flood Demonstration Workflow executed successfully across all 6 specialized AI agents.",
        "incident_id": flood_id,
        "pipeline_result": pipeline_result
    }
