from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class IncidentReference(BaseModel):
    id: str
    title: str
    category: str
    severity: str
    location: str

class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    selected_incident_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str] = []
    referenced_incidents: List[IncidentReference] = []
    data_summary: Optional[Dict[str, Any]] = None
