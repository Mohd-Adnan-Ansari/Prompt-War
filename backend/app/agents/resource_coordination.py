import math
from typing import Dict, Any, List
from app.agents.base import BaseAgent, AgentContext
from app.models.resource import Resource
from app.services.llm_service import llm_service

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

CATEGORY_REQUIREMENTS = {
    "Flood": ["Flood rescue boats", "Rescue teams", "Ambulances", "Emergency shelters", "Hospitals", "Police units"],
    "Fire": ["Fire trucks", "Fire stations", "Ambulances", "Hospitals", "Police units", "Rescue teams"],
    "Accident": ["Ambulances", "Police units", "Hospitals", "Rescue teams", "Fire trucks"],
    "Earthquake": ["Rescue teams", "Hospitals", "Emergency shelters", "Medical teams", "Fire stations", "Police units"],
    "Landslide": ["Rescue teams", "Ambulances", "Hospitals", "Police units", "Emergency shelters"],
    "Medical": ["Ambulances", "Hospitals", "Medical teams", "Police units"],
    "Other": ["Police units", "Rescue teams", "Ambulances", "Hospitals"]
}

class ResourceCoordinationAgent(BaseAgent):
    agent_id = "resource_coordination"
    agent_name = "Resource Coordination Agent"
    role_description = "Evaluates tactical asset readiness, calculates spatial proximity matrices, and recommends specialized response units."

    def run(self, context: AgentContext) -> Dict[str, Any]:
        inc = context.incident_data
        cls_output = (context.get_agent_result("classification") or {}).get("output", {})
        sev_output = (context.get_agent_result("severity") or {}).get("output", {})
        
        category = cls_output.get("category", inc.get("category", "Other"))
        severity = sev_output.get("severity_level", "Medium")
        lat = float(inc.get("latitude", 0.0))
        lng = float(inc.get("longitude", 0.0))

        needed_categories = CATEGORY_REQUIREMENTS.get(category, CATEGORY_REQUIREMENTS["Other"])
        
        all_resources: List[Dict[str, Any]] = []
        candidates: List[Dict[str, Any]] = []
        availability_counts = {"Available": 0, "Deployed": 0, "Busy": 0, "Offline": 0}

        if context.db:
            try:
                db_resources = context.db.query(Resource).all()
                for r in db_resources:
                    dist = haversine_km(lat, lng, r.latitude, r.longitude) if (lat != 0 and lng != 0) else 5.0
                    res_dict = {
                        "id": r.id,
                        "name": r.name,
                        "category": r.category,
                        "status": r.status,
                        "location_name": r.location_name,
                        "latitude": r.latitude,
                        "longitude": r.longitude,
                        "distance_km": round(dist, 2),
                        "contact": r.contact,
                        "capacity": r.capacity,
                        "assigned_incident_id": r.assigned_incident_id
                    }
                    all_resources.append(res_dict)
                    availability_counts[r.status] = availability_counts.get(r.status, 0) + 1

                    if r.category in needed_categories:
                        is_available = (r.status == "Available")
                        score = (100 - min(dist * 5, 60)) + (30 if is_available else 0)
                        candidates.append({
                            "resource_id": r.id,
                            "resource_name": r.name,
                            "category": r.category,
                            "status": r.status,
                            "distance_km": round(dist, 1),
                            "match_score": round(score, 1),
                            "capacity": r.capacity,
                            "location_name": r.location_name
                        })
            except Exception:
                pass

        # Sort candidate resources by spatial match score
        candidates.sort(key=lambda x: x["match_score"], reverse=True)
        top_candidates = candidates[:6]

        # Use Gemini for tactical deployment rationale
        prompt = f"""
You are the Resource Coordination Agent for CrisisAI.
Incident: {inc.get('title')} ({category}, {severity} severity)
Location: {inc.get('location_name')}
Hazards: {cls_output.get('primary_hazards', [])}

Top candidate resources evaluated by GIS proximity:
{top_candidates}

Provide tactical allocation rationales in JSON:
{{
  "recommendations": [
    {{
      "resource_id": "string",
      "rationale": "Tactical reason why this unit is recommended for this specific incident",
      "recommended_role": "Primary tactical assignment"
    }}
  ],
  "fleet_posture_assessment": "1 sentence overview of regional fleet readiness for this incident"
}}
"""
        gemini_res = llm_service.generate_json(prompt, system_prompt="You are an Emergency Logistics & Staging Officer.")

        recommendations = []
        gemini_recs_map = {}
        if gemini_res and "recommendations" in gemini_res:
            for item in gemini_res.get("recommendations", []):
                gemini_recs_map[item.get("resource_id")] = item

        for cand in top_candidates:
            rid = cand["resource_id"]
            if rid in gemini_recs_map:
                reason = gemini_recs_map[rid].get("rationale")
                role = gemini_recs_map[rid].get("recommended_role", f"Primary {cand['category']} unit")
            else:
                reason = f"{cand['category']} unit stationed {cand['distance_km']}km away. Status [{cand['status']}]."
                if cand['status'] == 'Available':
                    reason += " Immediate readiness for forward staging."
                else:
                    reason += " Engaged; requires command redirection authorization."
                role = f"Primary {cand['category']} unit for {category} response"

            recommendations.append({
                "resource_id": rid,
                "resource_name": cand["resource_name"],
                "category": cand["category"],
                "status": cand["status"],
                "distance_km": cand["distance_km"],
                "match_score": cand["match_score"],
                "rationale": reason,
                "recommended_role": role
            })

        return {
            "status": "Completed",
            "incident_category": category,
            "incident_severity": severity,
            "required_resource_types": needed_categories,
            "fleet_status_summary": availability_counts,
            "recommended_resources": recommendations,
            "total_candidates_evaluated": len(candidates),
            "ai_engine": "Gemini API (Active)" if gemini_res else "Heuristic Dispatch Engine",
            "safety_disclaimer": "Simulated operational asset matching. No automated emergency dispatch has been initiated. Human dispatcher authorization required."
        }
