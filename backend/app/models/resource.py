import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.core.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    # Categories: Ambulances, Hospitals, Fire stations, Fire trucks, Rescue teams, Flood rescue boats, Medical teams, Emergency shelters, Police units
    category = Column(String, nullable=False, index=True)
    # Statuses: Available, Deployed, Busy, Offline
    status = Column(String, default="Available", index=True)
    
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    contact = Column(String, default="Emergency Dispatch Unit")
    capacity = Column(String, default="Standard")
    
    assigned_incident_id = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
