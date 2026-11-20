from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class IncidentBase(BaseModel):
    title: str = Field(..., description="Short title of the incident")
    category: str = Field(default="Other", description="Flood, Fire, Accident, Earthquake, Landslide, Medical, Other")
    description: str = Field(..., description="Detailed description of the incident")
    location_name: str = Field(..., description="Human-readable location or address")
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    image_url: Optional[str] = None
    affected_area: Optional[str] = "Local vicinity"
    people_affected: Optional[int] = 0
    hazards: Optional[str] = "Pending assessment"

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # Reported, Under Investigation, Verified, Response in Progress, Resolved
    severity: Optional[str] = None
    risk_score: Optional[float] = None
    verification_status: Optional[str] = None
    verification_reason: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    affected_area: Optional[str] = None
    people_affected: Optional[int] = None
    hazards: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: str
    status: str
    severity: str
    risk_score: float
    confidence_score: float
    verification_status: str
    verification_reason: Optional[str] = None
    ai_analysis: Dict[str, Any] = {}
    action_plan: Dict[str, Any] = {}
    recommended_resources: List[Dict[str, Any]] = []
    pipeline_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
