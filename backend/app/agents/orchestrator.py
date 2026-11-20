import time
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base import AgentContext
from app.agents.report_collection import ReportCollectionAgent
from app.agents.verification import VerificationAgent
from app.agents.classification import IncidentClassificationAgent
from app.agents.severity import SeverityAssessmentAgent
from app.agents.resource_coordination import ResourceCoordinationAgent
from app.agents.action_planning import ActionPlanningAgent
from app.models.incident import Incident
from app.models.agent_log import AgentLog

class AgentOrchestrator:
    def __init__(self):
        self.agents = [
            ReportCollectionAgent(),
            VerificationAgent(),
            IncidentClassificationAgent(),
            SeverityAssessmentAgent(),
            ResourceCoordinationAgent(),
            ActionPlanningAgent(),
        ]

    def run_pipeline(self, incident_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        Executes the sequential 6-agent crisis analysis pipeline.
        Logs each agent's execution to the database and updates the incident record.
        """
        start_pipeline = time.time()
        context = AgentContext(incident_data=incident_data, db_session=db)
        incident_id = incident_data.get("id")
        
        step_results: List[Dict[str, Any]] = []
        overall_status = "Completed"

        for agent in self.agents:
            step_res = agent.execute(context)
            step_results.append(step_res)
            
            # Persist agent log
            try:
                log_entry = AgentLog(
                    incident_id=incident_id,
                    agent_id=step_res["agent_id"],
                    agent_name=step_res["agent_name"],
                    status=step_res["status"],
                    execution_time_ms=step_res["execution_time_ms"],
                    input_summary=step_res["input_summary"],
                )
                log_entry.output_data = step_res["output"]
                db.add(log_entry)
                db.commit()
            except Exception as e:
                db.rollback()

            if step_res["status"] == "Failed":
                overall_status = "Failed"
                break
            elif step_res["status"] == "Needs Review" and overall_status == "Completed":
                overall_status = "Needs Review"

        total_time_ms = int((time.time() - start_pipeline) * 1000)

        # Extract enriched fields from the agent results
        rep_res = context.get_agent_result("report_collection") or {}
        ver_res = context.get_agent_result("verification") or {}
        cls_res = context.get_agent_result("classification") or {}
        sev_res = context.get_agent_result("severity") or {}
        res_res = context.get_agent_result("resource_coordination") or {}
        act_res = context.get_agent_result("action_planning") or {}

        ver_out = ver_res.get("output", {})
        cls_out = cls_res.get("output", {})
        sev_out = sev_res.get("output", {})
        res_out = res_res.get("output", {})
        act_out = act_res.get("output", {})

        # Consolidated AI Analysis Object
        full_analysis = {
            "pipeline_status": overall_status,
            "total_execution_time_ms": total_time_ms,
            "agents_executed": len(step_results),
            "step_results": step_results,
            "report_collection": rep_res.get("output", {}),
            "verification": ver_out,
            "classification": cls_out,
            "severity": sev_out,
            "resource_coordination": res_out,
            "action_planning": act_out
        }

        # Update Incident in DB if it exists
        if incident_id:
            try:
                inc_record = db.query(Incident).filter(Incident.id == incident_id).first()
                if inc_record:
                    inc_record.category = cls_out.get("category", inc_record.category)
                    inc_record.severity = sev_out.get("severity_level", inc_record.severity)
                    inc_record.risk_score = sev_out.get("risk_score", inc_record.risk_score)
                    inc_record.confidence_score = ver_out.get("confidence_score", inc_record.confidence_score)
                    inc_record.verification_status = ver_out.get("verification_status", inc_record.verification_status)
                    inc_record.verification_reason = ver_out.get("verification_reason", inc_record.verification_reason)
                    inc_record.affected_area = cls_out.get("affected_area", inc_record.affected_area)
                    inc_record.people_affected = cls_out.get("estimated_people_affected", inc_record.people_affected)
                    inc_record.hazards = ", ".join(cls_out.get("primary_hazards", []))
                    
                    # Update JSON blobs
                    inc_record.ai_analysis = full_analysis
                    inc_record.action_plan = act_out.get("action_plan", {})
                    inc_record.recommended_resources = res_out.get("recommended_resources", [])
                    inc_record.pipeline_status = overall_status
                    
                    db.commit()
                    db.refresh(inc_record)
            except Exception as e:
                db.rollback()

        return {
            "incident_id": incident_id,
            "pipeline_status": overall_status,
            "total_execution_time_ms": total_time_ms,
            "steps": step_results,
            "summary": f"Completed 6-agent analysis in {total_time_ms}ms with status: {overall_status}."
        }

orchestrator = AgentOrchestrator()
