from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ResourceBase(BaseModel):
    name: str
    category: str  # Ambulances, Hospitals, Fire stations, Fire trucks, Rescue teams, Flood rescue boats, Medical teams, Emergency shelters, Police units
    status: str = "Available"  # Available, Deployed, Busy, Offline
    location_name: str
    latitude: float
    longitude: float
    contact: Optional[str] = "Emergency Dispatch Unit"
    capacity: Optional[str] = "Standard"

class ResourceCreate(ResourceBase):
    id: str

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact: Optional[str] = None
    capacity: Optional[str] = None
    assigned_incident_id: Optional[str] = None

class ResourceAssign(BaseModel):
    resource_id: str
    incident_id: str

class ResourceResponse(ResourceBase):
    id: str
    assigned_incident_id: Optional[str] = None
    last_updated: datetime

    class Config:
        from_attributes = True
