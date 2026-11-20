import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, index=True)
    agent_id = Column(String, index=True)  # report_collection, verification, classification, severity, resource_coordination, action_planning
    agent_name = Column(String, nullable=False)
    status = Column(String, default="Completed")  # Waiting, Processing, Completed, Needs Review, Failed
    execution_time_ms = Column(Integer, default=0)
    input_summary = Column(Text, default="")
    output_data_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def output_data(self):
        try:
            return json.loads(self.output_data_json or "{}")
        except Exception:
            return {}

    @output_data.setter
    def output_data(self, value):
        self.output_data_json = json.dumps(value)
