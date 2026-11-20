import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.resource import Resource
from app.models.incident import Incident
from app.schemas.resource import ResourceResponse, ResourceUpdate, ResourceAssign

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("", response_model=List[ResourceResponse])
def get_resources(
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Resource)
    if category and category != "All":
        query = query.filter(Resource.category == category)
    if status and status != "All":
        query = query.filter(Resource.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Resource.name.ilike(s)) |
            (Resource.location_name.ilike(s)) |
            (Resource.id.ilike(s)) |
            (Resource.category.ilike(s))
        )
    return query.order_by(Resource.category, Resource.name).all()

@router.get("/available", response_model=List[ResourceResponse])
def get_available_resources(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Resource).filter(Resource.status == "Available")
    if category and category != "All":
        query = query.filter(Resource.category == category)
    return query.all()

@router.patch("/{id}", response_model=ResourceResponse)
def update_resource(id: str, data: ResourceUpdate, db: Session = Depends(get_db)):
    res = db.query(Resource).filter(Resource.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(res, field, val)

    res.last_updated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(res)
    return res

@router.post("/assign", response_model=ResourceResponse)
def assign_resource_to_incident(data: ResourceAssign, db: Session = Depends(get_db)):
    res = db.query(Resource).filter(Resource.id == data.resource_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    inc = db.query(Incident).filter(Incident.id == data.incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    res.assigned_incident_id = data.incident_id
    res.status = "Deployed"
    res.last_updated = datetime.datetime.utcnow()

    # Also transition incident to Response in Progress if it was Reported or Under Investigation
    if inc.status in ["Reported", "Under Investigation"]:
        inc.status = "Response in Progress"
        inc.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(res)
    return res

@router.post("/unassign/{id}", response_model=ResourceResponse)
def unassign_resource(id: str, db: Session = Depends(get_db)):
    res = db.query(Resource).filter(Resource.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    res.assigned_incident_id = None
    res.status = "Available"
    res.last_updated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(res)
    return res
