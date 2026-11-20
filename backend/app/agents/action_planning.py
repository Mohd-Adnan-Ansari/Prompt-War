from typing import Dict, Any, List
from app.agents.base import BaseAgent, AgentContext
from app.services.llm_service import llm_service

class ActionPlanningAgent(BaseAgent):
    agent_id = "action_planning"
    agent_name = "Action Planning Agent"
    role_description = "Synthesizes multi-agent telemetry into an actionable operational incident commander playbook."

    def run(self, context: AgentContext) -> Dict[str, Any]:
        inc = context.incident_data
        rep = (context.get_agent_result("report_collection") or {}).get("output", {})
        ver = (context.get_agent_result("verification") or {}).get("output", {})
        cls = (context.get_agent_result("classification") or {}).get("output", {})
        sev = (context.get_agent_result("severity") or {}).get("output", {})
        res = (context.get_agent_result("resource_coordination") or {}).get("output", {})

        category = cls.get("category", inc.get("category", "Other"))
        severity = sev.get("severity_level", "High")
        risk_score = sev.get("risk_score", 70.0)
        confidence = ver.get("confidence_score", 75)
        top_resources = res.get("recommended_resources", [])[:4]
        concerns = sev.get("immediate_concerns", [])
        hazards = cls.get("primary_hazards", [])

        prompt = f"""
Create an operational tactical response action plan for this emergency:
Title: {inc.get('title')}
Category: {category}
Severity: {severity} (Risk: {risk_score}/100)
Confidence: {confidence}% ({ver.get('verification_status')})
Location: {inc.get('location_name')}
Primary Hazards: {', '.join(hazards)}
Immediate Concerns: {', '.join(concerns)}
Recommended Resources: {', '.join([r.get('resource_name', '') for r in top_resources])}

Respond in JSON:
{{
  "incident_summary": "Cohesive summary of situation and operational posture",
  "immediate_priorities": ["priority 1", "priority 2", "priority 3"],
  "recommended_response_actions": [
    {{
      "phase": "Immediate (0-15 min)" | "Secondary (15-60 min)" | "Stabilization",
      "action": "Description of tactical action",
      "assigned_unit": "e.g. Incident Commander / Rescue Squad / Traffic Division",
      "priority": "Critical" | "High" | "Medium"
    }}
  ],
  "potential_risks": ["risk 1", "risk 2"],
  "unverified_information": ["item 1", "item 2"]
}}
"""
        llm_res = llm_service.generate_json(prompt, system_prompt="You are a Chief Incident Command Tactical Planner.")

        if llm_res and "incident_summary" in llm_res:
            summary = llm_res.get("incident_summary", "")
            priorities = llm_res.get("immediate_priorities", [])
            actions = llm_res.get("recommended_response_actions", [])
            risks = llm_res.get("potential_risks", [])
            unverified = llm_res.get("unverified_information", [])
        else:
            # Deterministic domain-specific tactical playbook generator
            summary = (
                f"Emergency incident '{inc.get('title')}' categorized as {category.upper()} with "
                f"{severity.upper()} severity (Risk: {risk_score}/100, Verification Confidence: {confidence}%). "
                f"Affected area requires immediate perimeter containment, life-safety triage, and coordinated asset positioning."
            )

            priorities = [
                f"Establish Command Post at safe staging area outside active {category} zone",
                "Deploy reconnaissance or frontline assets to confirm occupant safety and casualty counts",
                "Secure utility isolation (power/gas) and restrict civilian transit corridor access"
            ]

            actions = [
                {
                    "phase": "Immediate (0-15 min)",
                    "action": f"Deploy nearest frontline response units to secure perimeter and initiate life-safety sweep.",
                    "assigned_unit": "First Responders / Patrol Unit",
                    "priority": "Critical" if severity in ["Critical", "High"] else "High"
                },
                {
                    "phase": "Immediate (0-15 min)",
                    "action": f"Alert nearest hospital emergency department for incoming casualties triage and bed capacity hold.",
                    "assigned_unit": "Emergency Medical Dispatch",
                    "priority": "Critical" if severity == "Critical" else "High"
                },
                {
                    "phase": "Secondary (15-60 min)",
                    "action": f"Establish specialized support units ({', '.join(cls.get('primary_hazards', ['general rescue']))[:60]}) to neutralize escalation points.",
                    "assigned_unit": "Special Operations / Hazmat / Rescue",
                    "priority": "High"
                },
                {
                    "phase": "Stabilization (1-4 hrs)",
                    "action": "Conduct structural and environmental damage assessment and coordinate temporary civilian sheltering.",
                    "assigned_unit": "Municipal Emergency Management",
                    "priority": "Medium"
                }
            ]

            risks = [
                f"Rapid hazard escalation due to localized {category} dynamics and potential secondary failures",
                "Access route congestion impeding incoming specialized response equipment",
                "Spillover impact into adjoining residential and commercial facilities"
            ]

            unverified = [
                "Exact head count of trapped or isolated individuals",
                "Structural stability of adjacent infrastructure",
                "Underground gas and electrical conduits integrity"
            ]

        action_plan_doc = {
            "incident_summary": summary,
            "current_severity": severity,
            "risk_score": risk_score,
            "immediate_priorities": priorities,
            "recommended_response_actions": actions,
            "suggested_emergency_resources": top_resources,
            "potential_risks": risks,
            "unverified_information": unverified,
            "approval_status": "Pending Human Responder Authorization",
            "ai_disclaimer": "CRISISAI ADVISORY NOTICE: All operational directives and resource suggestions are AI-generated decision aids. Final tactical deployment must be explicitly validated and authorized by human Incident Commanders."
        }

        return {
            "status": "Completed",
            "action_plan": action_plan_doc,
            "plan_summary": f"Generated 4-phase tactical plan with {len(priorities)} immediate priorities and {len(actions)} operational actions.",
            "requires_human_approval": True
        }
