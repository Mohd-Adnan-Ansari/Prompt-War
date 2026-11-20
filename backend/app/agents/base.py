import time
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

class AgentContext:
    def __init__(self, incident_data: Dict[str, Any], db_session=None):
        self.incident_data = incident_data
        self.db = db_session
        self.results: Dict[str, Any] = {}
        self.logs: list = []

    def set_agent_result(self, agent_id: str, result: Dict[str, Any]):
        self.results[agent_id] = result

    def get_agent_result(self, agent_id: str) -> Optional[Dict[str, Any]]:
        return self.results.get(agent_id)

class BaseAgent(ABC):
    agent_id: str = "base"
    agent_name: str = "Base Agent"
    role_description: str = "Base agent specification"

    @abstractmethod
    def run(self, context: AgentContext) -> Dict[str, Any]:
        """Execute the agent's logic and return structured output."""
        pass

    def execute(self, context: AgentContext) -> Dict[str, Any]:
        start_time = time.time()
        status = "Processing"
        try:
            output = self.run(context)
            status = output.get("status", "Completed")
            exec_time_ms = int((time.time() - start_time) * 1000)
            
            result = {
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "status": status,
                "execution_time_ms": exec_time_ms,
                "input_summary": self.get_input_summary(context),
                "output": output
            }
            context.set_agent_result(self.agent_id, result)
            return result
        except Exception as e:
            exec_time_ms = int((time.time() - start_time) * 1000)
            result = {
                "agent_id": self.agent_id,
                "agent_name": self.agent_name,
                "status": "Failed",
                "execution_time_ms": exec_time_ms,
                "input_summary": self.get_input_summary(context),
                "output": {"error": str(e)}
            }
            context.set_agent_result(self.agent_id, result)
            return result

    def get_input_summary(self, context: AgentContext) -> str:
        inc = context.incident_data
        return f"Incident: {inc.get('title', 'Unknown')} [{inc.get('category', 'Unspecified')}] at {inc.get('location_name', 'Unknown')}"
