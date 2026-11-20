import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.resource import Resource
from app.schemas.assistant import ChatResponse, IncidentReference
from app.services.llm_service import llm_service

class AssistantService:
    def process_query(self, query: str, db: Session, selected_incident_id: str = None) -> ChatResponse:
        q = query.lower().strip()
        all_incidents = db.query(Incident).all()
        all_resources = db.query(Resource).all()

        active_incidents = [i for i in all_incidents if i.status != "Resolved"]
        critical_incidents = [i for i in all_incidents if i.severity == "Critical"]
        unverified_incidents = [i for i in all_incidents if i.verification_status in ["Unverified", "Needs Review"]]
        available_resources = [r for r in all_resources if r.status == "Available"]

        referenced_incidents: List[IncidentReference] = []

        # Find target incident if mentioned or selected
        target_incident = None
        if selected_incident_id:
            target_incident = db.query(Incident).filter(Incident.id == selected_incident_id).first()
        else:
            match = re.search(r"inc-\d{4}-\d{3}", q)
            if match:
                target_incident = db.query(Incident).filter(Incident.id == match.group(0).upper()).first()

        # Build ground-truth summary for citations
        for inc in all_incidents:
            if inc.id.lower() in q or (target_incident and target_incident.id == inc.id):
                if inc not in [r.id for r in referenced_incidents]:
                    referenced_incidents.append(IncidentReference(
                        id=inc.id, title=inc.title, category=inc.category, severity=inc.severity, location=inc.location_name
                    ))
            elif "critical" in q and inc.severity == "Critical":
                referenced_incidents.append(IncidentReference(
                    id=inc.id, title=inc.title, category=inc.category, severity=inc.severity, location=inc.location_name
                ))
            elif "flood" in q and inc.category == "Flood":
                referenced_incidents.append(IncidentReference(
                    id=inc.id, title=inc.title, category=inc.category, severity=inc.severity, location=inc.location_name
                ))
            elif "unverified" in q and inc.verification_status in ["Unverified", "Needs Review"]:
                referenced_incidents.append(IncidentReference(
                    id=inc.id, title=inc.title, category=inc.category, severity=inc.severity, location=inc.location_name
                ))

        # Build grounded telemetry database context for Gemini
        incidents_context = [
            {
                "id": i.id,
                "title": i.title,
                "category": i.category,
                "severity": i.severity,
                "risk_score": i.risk_score,
                "status": i.status,
                "verification_status": i.verification_status,
                "confidence_score": i.confidence_score,
                "location": i.location_name,
                "people_affected": i.people_affected,
                "hazards": i.hazards
            }
            for i in all_incidents
        ]

        resources_context = [
            {
                "id": r.id,
                "name": r.name,
                "category": r.category,
                "status": r.status,
                "location": r.location_name,
                "capacity": r.capacity,
                "assigned_incident": r.assigned_incident_id
            }
            for r in all_resources
        ]

        gemini_prompt = f"""
You are the CrisisAI Assistant, an operational AI copilot for emergency command dispatchers.
Answer the dispatcher's query using ONLY the real-time crisis database context provided below.

DISASTER INCIDENTS DATABASE:
{incidents_context}

EMERGENCY RESOURCES & FLEET DATABASE:
{resources_context}

DISPATCHER QUERY:
"{query}"

RULES:
1. Reference exact incident IDs (e.g. [INC-2026-001]) when discussing incidents.
2. Use markdown formatting with bullet points and bold headers.
3. If the user asks about an incident or resource not in the database, clearly say that the information is unavailable rather than inventing incidents or resources.
4. Keep answers operational, concise, and focused on life-safety and asset allocation.
"""
        gemini_reply = llm_service.generate_text(
            gemini_prompt,
            system_prompt="You are CrisisAI Assistant, an emergency command center copilot grounded strictly in operational telemetry."
        )

        if gemini_reply:
            # Extract any mentioned incident IDs from Gemini reply to add to clickable citations
            found_ids = re.findall(r"INC-\d{4}-\d{3}", gemini_reply)
            for fid in found_ids:
                matching_inc = next((i for i in all_incidents if i.id == fid), None)
                if matching_inc and not any(r.id == fid for r in referenced_incidents):
                    referenced_incidents.append(IncidentReference(
                        id=matching_inc.id,
                        title=matching_inc.title,
                        category=matching_inc.category,
                        severity=matching_inc.severity,
                        location=matching_inc.location_name
                    ))

            suggested = [
                "What are the current critical incidents?",
                "Which reports are still unverified?",
                "What emergency resources are available?"
            ]

            return ChatResponse(
                reply=gemini_reply,
                suggested_actions=suggested,
                referenced_incidents=referenced_incidents,
                data_summary={
                    "total_incidents": len(all_incidents),
                    "active_incidents": len(active_incidents),
                    "critical_incidents": len(critical_incidents),
                    "available_resources": len(available_resources),
                    "ai_engine": "Gemini API (Active)"
                }
            )

        # Fallback to local heuristic engine if Gemini is unreachable or offline
        reply_lines = []
        suggested_actions = []

        if "critical" in q or "urgent" in q or "immediate attention" in q:
            reply_lines.append(f"### 🚨 Active Critical Emergencies ({len(critical_incidents)} Detected)\n")
            if not critical_incidents:
                reply_lines.append("There are currently no incidents classified as **Critical**.")
            else:
                for inc in critical_incidents:
                    reply_lines.append(f"- **[{inc.id}] {inc.title}** ({inc.category})")
                    reply_lines.append(f"  - **Risk Score:** {inc.risk_score}/100 | **Location:** {inc.location_name}")
                    reply_lines.append(f"  - **Status:** {inc.status} | **People Affected:** ~{inc.people_affected}\n")
            suggested_actions = ["Show nearest available resources", "Generate tactical response plan"]

        elif "flood" in q:
            floods = [i for i in all_incidents if i.category == "Flood"]
            reply_lines.append(f"### 🌊 Flood Situational Telemetry ({len(floods)} Incidents Found)\n")
            for inc in floods:
                reply_lines.append(f"- **[{inc.id}] {inc.title}** ({inc.severity} Severity)")
                reply_lines.append(f"  - **Location:** {inc.location_name}")
                reply_lines.append(f"  - **Impact:** {inc.affected_area} (~{inc.people_affected} residents)\n")
            suggested_actions = ["Recommend boats and high-water vehicles", "Check evacuation shelters"]

        elif target_incident:
            reply_lines.append(f"### 📋 Incident Focus: [{target_incident.id}] {target_incident.title}\n")
            reply_lines.append(f"- **Category:** {target_incident.category} | **Severity:** **{target_incident.severity}** (Risk: {target_incident.risk_score}/100)")
            reply_lines.append(f"- **Location:** {target_incident.location_name}")
            reply_lines.append(f"- **Hazards:** {target_incident.hazards}\n")
            suggested_actions = ["Show recommended resources", "Update status to Response in Progress"]

        else:
            reply_lines.append(f"CrisisAI command engine processed your query regarding: *\"{query}\"*.\n")
            reply_lines.append(f"Currently tracking **{len(active_incidents)} active emergencies** with **{len(available_resources)} available response assets** across the metropolitan sector.")
            suggested_actions = ["What are the current critical incidents?", "What resources are currently available?"]

        return ChatResponse(
            reply="\n".join(reply_lines),
            suggested_actions=suggested_actions,
            referenced_incidents=referenced_incidents,
            data_summary={
                "total_incidents": len(all_incidents),
                "active_incidents": len(active_incidents),
                "critical_incidents": len(critical_incidents),
                "available_resources": len(available_resources),
                "ai_engine": "Heuristic Local Engine"
            }
        )

assistant_service = AssistantService()
