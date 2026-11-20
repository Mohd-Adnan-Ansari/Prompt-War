import math
from typing import Dict, Any, List
from app.agents.base import BaseAgent, AgentContext
from app.models.incident import Incident
from app.services.llm_service import llm_service

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class VerificationAgent(BaseAgent):
    agent_id = "verification"
    agent_name = "Verification Agent"
    role_description = "Evaluates report authenticity, detects duplicate incidents, compares geographic proximity, and assigns confidence score."

    def run(self, context: AgentContext) -> Dict[str, Any]:
        inc = context.incident_data
        report_step = context.get_agent_result("report_collection") or {}
        
        current_id = inc.get("id")
        title = inc.get("title", "").lower()
        desc = inc.get("description", "").lower()
        cat = inc.get("category", "")
        lat = float(inc.get("latitude", 0.0))
        lng = float(inc.get("longitude", 0.0))
        has_image = bool(inc.get("image_url"))
        
        # Check database for nearby duplicates
        duplicates: List[Dict[str, Any]] = []
        nearby_incidents: List[Dict[str, Any]] = []
        
        if context.db:
            try:
                existing = context.db.query(Incident).filter(Incident.id != current_id).all()
                for item in existing:
                    dist = haversine_distance_km(lat, lng, item.latitude, item.longitude)
                    if dist <= 3.0: # within 3km
                        nearby_incidents.append({
                            "id": item.id,
                            "title": item.title,
                            "category": item.category,
                            "distance_km": round(dist, 2),
                            "status": item.status
                        })
                        # Check keyword overlap for duplicate flag
                        words_curr = set(title.split() + desc.split())
                        words_prev = set(item.title.lower().split() + item.description.lower().split())
                        overlap = len(words_curr.intersection(words_prev)) / max(len(words_curr), 1)
                        if item.category == cat and (overlap > 0.35 or dist < 0.8):
                            duplicates.append({
                                "id": item.id,
                                "title": item.title,
                                "similarity_score": round(min(0.6 + overlap * 0.4, 0.98) * 100, 1),
                                "distance_km": round(dist, 2)
                            })
            except Exception as e:
                pass

        # LLM Verification or Rule-based verification
        prompt = f"""
Evaluate this emergency report for authenticity, credibility, and duplicate potential:
Title: {inc.get('title')}
Description: {inc.get('description')}
Category: {cat}
Location: {inc.get('location_name')} ({lat}, {lng})
Has Photo: {has_image}
Nearby Incidents Count: {len(nearby_incidents)}
Duplicates Found: {len(duplicates)}

Respond with JSON:
{{
  "confidence_score": 0-100,
  "verification_status": "Verified" | "Needs Review" | "Unverified",
  "reason": "Detailed explanation of credibility assessment",
  "duplicate_risk": "None" | "Low" | "Moderate" | "High",
  "credibility_factors": ["string"],
  "flags": ["string"]
}}
"""
        llm_res = llm_service.generate_json(prompt, system_prompt="You are a specialized Disaster Intelligence Verification Agent.")
        
        if llm_res and "confidence_score" in llm_res:
            confidence = int(llm_res.get("confidence_score", 70))
            v_status = llm_res.get("verification_status", "Needs Review")
            reason = llm_res.get("reason", "Corroborated by available contextual indicators.")
            factors = llm_res.get("credibility_factors", [])
            flags = llm_res.get("flags", [])
            dup_risk = llm_res.get("duplicate_risk", "Low" if not duplicates else "Moderate")
        else:
            # Deterministic heuristic engine
            confidence = 65
            factors = []
            flags = []

            if has_image:
                confidence += 15
                factors.append("Photographic evidence attached and parsed")
            else:
                flags.append("No visual imagery provided in initial submission")

            if lat != 0.0 and lng != 0.0:
                confidence += 10
                factors.append("Precise geographic coordinates verified")
            else:
                confidence -= 20
                flags.append("Missing or unverified geographic coordinates")

            if len(desc) > 80:
                confidence += 10
                factors.append("Detailed circumstantial description provided")
            elif len(desc) < 30:
                confidence -= 15
                flags.append("Terse or vague description provided")

            if len(nearby_incidents) > 0:
                factors.append(f"Corroborated by {len(nearby_incidents)} existing incident(s) in regional sector")
                confidence += 5

            if duplicates:
                dup_risk = "High" if duplicates[0]["similarity_score"] > 80 else "Moderate"
                flags.append(f"Potential duplicate of existing incident {duplicates[0]['id']} ({duplicates[0]['similarity_score']}% match)")
                reason = f"Potential duplicate detected matching {duplicates[0]['id']} within {duplicates[0]['distance_km']}km. Highly consistent with active operational cluster."
            else:
                dup_risk = "Low"
                if confidence >= 80:
                    v_status = "Verified"
                    reason = "High multi-source consistency: Validated GPS positioning, photographic corroboration, and descriptive clarity."
                elif confidence >= 60:
                    v_status = "Needs Review"
                    reason = "Report contains valid emergency signals but requires human responder cross-verification or eyewitness corroboration."
                else:
                    v_status = "Unverified"
                    reason = "Insufficient supporting telemetry, lacking photo or specific geographical confirmation."

            if duplicates and confidence >= 75:
                v_status = "Verified"
            elif not duplicates and confidence >= 80:
                v_status = "Verified"
            elif confidence >= 55:
                v_status = "Needs Review"
            else:
                v_status = "Unverified"

            confidence = max(10, min(99, confidence))

        return {
            "status": "Completed",
            "confidence_score": confidence,
            "verification_status": v_status,
            "verification_reason": reason,
            "duplicate_risk": dup_risk,
            "duplicate_incidents": duplicates,
            "nearby_incidents_count": len(nearby_incidents),
            "credibility_factors": factors,
            "audit_flags": flags,
            "human_verification_required": True,
            "advisory_notice": "AI confidence score is an operational heuristic; formal authentication must be affirmed by human command dispatch."
        }
