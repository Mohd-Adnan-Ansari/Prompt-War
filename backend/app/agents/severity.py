from typing import Dict, Any, List
from app.agents.base import BaseAgent, AgentContext
from app.services.llm_service import llm_service

class SeverityAssessmentAgent(BaseAgent):
    agent_id = "severity"
    agent_name = "Severity Assessment Agent"
    role_description = "Evaluates life safety risks, escalation dynamics, infrastructure damage, and produces calibrated risk score and urgency level."

    def run(self, context: AgentContext) -> Dict[str, Any]:
        inc = context.incident_data
        cls_result = context.get_agent_result("classification") or {}
        cls_output = cls_result.get("output", {})
        
        category = cls_output.get("category", inc.get("category", "Other"))
        people_affected = cls_output.get("estimated_people_affected", inc.get("people_affected", 10))
        hazards = cls_output.get("primary_hazards", [])
        
        text = f"{inc.get('title', '')} {inc.get('description', '')}".lower()

        prompt = f"""
Assess the emergency severity and risk score for this disaster event:
Category: {category}
Title: {inc.get('title')}
Description: {inc.get('description')}
Estimated People Affected: {people_affected}
Primary Hazards: {', '.join(hazards)}

Criteria to weigh:
- Immediate threat to life
- Number of affected people
- Infrastructure damage
- Escalation or spread potential
- Access obstacles

Respond in JSON:
{{
  "severity_level": "Critical" | "High" | "Medium" | "Low",
  "risk_score": 0-100,
  "reason": "Detailed justification for the severity and risk score",
  "immediate_concerns": ["concern 1", "concern 2", "concern 3"],
  "recommended_urgency": "Immediate Code Red (< 10 min)" | "Urgent Priority (< 30 min)" | "Standard Response (< 60 min)" | "Routine Monitoring",
  "threat_to_life": "Extreme" | "Substantial" | "Moderate" | "Low",
  "escalation_potential": "Rapid" | "Moderate" | "Contained"
}}
"""
        llm_res = llm_service.generate_json(prompt, system_prompt="You are an Emergency Severity Assessment Officer.")

        if llm_res and "severity_level" in llm_res:
            sev = llm_res.get("severity_level", "High")
            risk = float(llm_res.get("risk_score", 75.0))
            reason = llm_res.get("reason", "Severity established based on life safety risks and environmental conditions.")
            concerns = llm_res.get("immediate_concerns", [])
            urgency = llm_res.get("recommended_urgency", "Urgent Priority (< 30 min)")
            threat = llm_res.get("threat_to_life", "Substantial")
            escalation = llm_res.get("escalation_potential", "Moderate")
        else:
            # Deterministic heuristic risk scoring engine
            # Base risk calculation
            base_risk = 45.0
            critical_keywords = ["trapped", "collapse", "explosion", "fatal", "drowning", "casualt", "submerged", "unconscious", "head-on", "structural failure", "toxic", "evacuat"]
            high_keywords = ["fire", "blaze", "heavy rain", "rising", "multi-vehicle", "pileup", "gas leak", "hazard", "severe", "injured", "smoke"]
            
            crit_matches = sum(1 for kw in critical_keywords if kw in text)
            high_matches = sum(1 for kw in high_keywords if kw in text)

            base_risk += (crit_matches * 12.0) + (high_matches * 6.0)

            # People affected multiplier
            if people_affected > 50:
                base_risk += 18.0
            elif people_affected > 20:
                base_risk += 10.0
            elif people_affected > 5:
                base_risk += 5.0

            # Category weight adjustments
            if category in ["Earthquake", "Flood", "Fire"]:
                base_risk += 8.0
            elif category in ["Accident", "Landslide"]:
                base_risk += 5.0

            risk = min(max(base_risk, 15.0), 98.0)

            # Calibrate severity level and concerns
            if risk >= 78.0:
                sev = "Critical"
                urgency = "Immediate Code Red (< 10 min)"
                threat = "Extreme"
                escalation = "Rapid"
                reason = f"Acute threat to human life with {people_affected}+ potentially impacted individuals, rapid escalation indicators, and complex secondary hazards."
                concerns = [
                    "Immediate life safety hazard to occupants and bystanders",
                    "Compromised access routes for standard emergency vehicles",
                    "Secondary structural or environmental cascade failures"
                ]
            elif risk >= 58.0:
                sev = "High"
                urgency = "Urgent Priority (< 30 min)"
                threat = "Substantial"
                escalation = "Moderate"
                reason = f"Significant structural/environmental damage with moderate threat to life and active disruption to public transit or utility networks."
                concerns = [
                    "Containment of hazard before perimeter expands",
                    "Rapid medical triage and localized evacuation",
                    "Traffic rerouting and secure staging zone setup"
                ]
            elif risk >= 35.0:
                sev = "Medium"
                urgency = "Standard Response (< 60 min)"
                threat = "Moderate"
                escalation = "Contained"
                reason = "Localized incident with manageable perimeter, minor injuries reported, and stable physical surroundings."
                concerns = [
                    "Scene control and civilian safety perimeter",
                    "Infrastructure inspection to prevent secondary degradation"
                ]
            else:
                sev = "Low"
                urgency = "Routine Monitoring"
                threat = "Low"
                escalation = "Contained"
                reason = "Minor disruption with minimal immediate peril to human life or critical facilities."
                concerns = [
                    "Routine documentation and municipal maintenance dispatch"
                ]

        return {
            "status": "Completed",
            "severity_level": sev,
            "risk_score": round(risk, 1),
            "severity_reason": reason,
            "immediate_concerns": concerns,
            "recommended_urgency": urgency,
            "threat_to_life": threat,
            "escalation_potential": escalation,
            "assessment_summary": f"{sev.upper()} Severity (Risk Score: {round(risk, 1)}/100) — Urgency: {urgency}"
        }
