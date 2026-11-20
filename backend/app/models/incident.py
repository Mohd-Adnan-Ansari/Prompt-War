import datetime
import json
from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="Other")  # Flood, Fire, Accident, Earthquake, Landslide, Medical, Other
    status = Column(String, default="Reported")  # Reported, Under Investigation, Verified, Response in Progress, Resolved
    
    # Severity & Verification metrics
    severity = Column(String, default="Medium")  # Critical, High, Medium, Low
    risk_score = Column(Float, default=50.0)     # 0 - 100
    confidence_score = Column(Float, default=70.0)  # 0 - 100
    verification_status = Column(String, default="Needs Review")  # Verified, Unverified, Needs Review
    verification_reason = Column(Text, nullable=True)

    # Location
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Media & Impact
    image_url = Column(String, nullable=True)
    affected_area = Column(String, default="Local vicinity")
    people_affected = Column(Integer, default=0)
    hazards = Column(Text, default="Pending assessment")
    
    # AI Multi-agent artifacts stored as JSON strings
    ai_analysis_json = Column(Text, default="{}")
    action_plan_json = Column(Text, default="{}")
    recommended_resources_json = Column(Text, default="[]")
    
    # Pipeline execution tracking
    pipeline_status = Column(String, default="Completed")  # Waiting, Processing, Completed, Needs Review, Failed
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    @property
    def ai_analysis(self):
        try:
            return json.loads(self.ai_analysis_json or "{}")
        except Exception:
            return {}

    @ai_analysis.setter
    def ai_analysis(self, value):
        self.ai_analysis_json = json.dumps(value)

    @property
    def action_plan(self):
        try:
            return json.loads(self.action_plan_json or "{}")
        except Exception:
            return {}

    @action_plan.setter
    def action_plan(self, value):
        self.action_plan_json = json.dumps(value)

    @property
    def recommended_resources(self):
        try:
            return json.loads(self.recommended_resources_json or "[]")
        except Exception:
            return []

    @recommended_resources.setter
    def recommended_resources(self, value):
        self.recommended_resources_json = json.dumps(value)
