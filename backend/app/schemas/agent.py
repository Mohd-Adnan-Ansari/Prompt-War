from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

class AgentStepResult(BaseModel):
    agent_id: str
    agent_name: str
    status: str  # Waiting, Processing, Completed, Needs Review, Failed
    execution_time_ms: int
    input_summary: str
    output: Dict[str, Any]

class PipelineRunResponse(BaseModel):
    incident_id: str
    pipeline_status: str
    total_execution_time_ms: int
    steps: List[AgentStepResult]
    summary: str

class AgentStatusInfo(BaseModel):
    agent_id: str
    agent_name: str
    role: str
    status: str
    total_processed: int
    avg_latency_ms: float
    last_active: Optional[datetime] = None
