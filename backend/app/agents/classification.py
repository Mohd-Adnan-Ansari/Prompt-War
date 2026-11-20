import re
from typing import Dict, Any, List
from app.agents.base import BaseAgent, AgentContext
from app.services.llm_service import llm_service

CATEGORIES = ["Flood", "Fire", "Accident", "Earthquake", "Landslide", "Medical", "Other"]

KEYWORDS = {
    "Flood": ["flood", "water", "river", "rain", "submerged", "inundation", "drown", "overflow", "storm surge", "drainage"],
    "Fire": ["fire", "flames", "smoke", "blaze", "burning", "explosion", "combustion", "arson", "inferno"],
    "Accident": ["crash", "collision", "overturned", "highway", "vehicles", "pileup", "car", "truck", "traffic"],
    "Earthquake": ["tremor", "quake", "aftershock", "shaking", "fault line", "structural fissure", "earthquake"],
    "Landslide": ["mudslide", "rockfall", "debris flow", "slope failure", "landslide", "hill collapse"],
    "Medical": ["cardiac", "stroke", "bleeding", "unconscious", "casualty", "epidemic", "poisoning", "trauma"]
}

class IncidentClassificationAgent(BaseAgent):
    agent_id = "classification"
    agent_name = "Incident Classification Agent"
    role_description = "Performs NLP multi-label categorization, hazard taxonomy mapping, and impact sphere estimation."

    def run(self, context: AgentContext) -> Dict[str, Any]:
        inc = context.incident_data
        text = f"{inc.get('title', '')} {inc.get('description', '')}".lower()
        current_cat = inc.get("category", "Other")

        prompt = f"""
Analyze this incident report and classify it into: {', '.join(CATEGORIES)}.
Report Title: {inc.get('title')}
Description: {inc.get('description')}
Declared Category: {current_cat}

Extract impact metrics and hazards. Respond in JSON:
{{
  "predicted_category": "Flood" | "Fire" | "Accident" | "Earthquake" | "Landslide" | "Medical" | "Other",
  "category_confidence": 0-100,
  "affected_area": "e.g. 5-block radius / Highway MP 42-45",
  "estimated_people_affected": integer,
  "primary_hazards": ["string"],
  "secondary_hazards": ["string"],
  "infrastructure_affected": ["string"]
}}
"""
        llm_res = llm_service.generate_json(prompt, system_prompt="You are a Disaster Hazard Classification Expert.")
        
        if llm_res and "predicted_category" in llm_res:
            cat = llm_res.get("predicted_category", current_cat)
            cat_conf = llm_res.get("category_confidence", 85)
            affected_area = llm_res.get("affected_area", "Local sector (approx 500m radius)")
            est_people = int(llm_res.get("estimated_people_affected", 25))
            primary_hazards = llm_res.get("primary_hazards", [])
            secondary_hazards = llm_res.get("secondary_hazards", [])
            infrastructure = llm_res.get("infrastructure_affected", [])
        else:
            # Deterministic heuristic classifier
            scores = {}
            for c, terms in KEYWORDS.items():
                match_count = sum(1 for term in terms if term in text)
                scores[c] = match_count

            best_cat = max(scores, key=scores.get)
            if scores[best_cat] > 0:
                cat = best_cat
                cat_conf = min(75 + scores[best_cat] * 7, 96)
            else:
                cat = current_cat if current_cat in CATEGORIES else "Other"
                cat_conf = 65

            # Contextual hazards extraction
            primary_hazards = []
            secondary_hazards = []
            infrastructure = []
            affected_area = "Urban locality sector (approx 1.2 km radius)"
            est_people = 15

            if cat == "Flood":
                primary_hazards = ["Rising water levels", "Submerged ground infrastructure", "Electrical hazards in flooded basements"]
                secondary_hazards = ["Waterborne contaminants", "Structural foundation weakening", "Stranded occupants"]
                infrastructure = ["Stormwater drainage conduits", "Low-lying roadways", "Power sub-distribution"]
                est_people = 65
                affected_area = "Riverbank low-lying residential belt (~2.5 sq km)"
            elif cat == "Fire":
                primary_hazards = ["Thermal radiation & active flame front", "Toxic smoke inhalation", "Structural collapse risk"]
                secondary_hazards = ["Spread to adjacent commercial units", "Rupture of gas mains"]
                infrastructure = ["Commercial utility lines", "HVAC ducting", "Emergency egress corridors"]
                est_people = 40
                affected_area = "Multi-story commercial facility & adjacent 100m perimeter"
            elif cat == "Accident":
                primary_hazards = ["Multi-vehicle wreckage entanglement", "Flammable fuel leakage", "High-speed secondary collisions"]
                secondary_hazards = ["Total arterial highway gridlock", "Hazardous cargo spill risk"]
                infrastructure = ["Interstate median barrier", "Lane 1-3 westbound", "Overhead gantry sign"]
                est_people = 12
                affected_area = "Interchange junction & 1.5 km approach queue"
            elif cat == "Earthquake":
                primary_hazards = ["Structural shear failures", "Falling masonry debris", "Severe aftershock recurrence"]
                secondary_hazards = ["Fractured gas mains", "Severed water supply pressure"]
                infrastructure = ["Overpass bridges", "Historic masonry facades", "Regional power grid"]
                est_people = 150
                affected_area = "District-wide epicenter impact zone"
            elif cat == "Landslide":
                primary_hazards = ["Rapid hillside mass movement", "Buried transport corridors", "River damming"]
                secondary_hazards = ["Secondary mudflow trigger upon precipitation", "Isolated community cutoff"]
                infrastructure = ["Mountain access road", "Electrical transmission towers"]
                est_people = 35
                affected_area = "Steep grade hillside section (~800m slip face)"
            elif cat == "Medical":
                primary_hazards = ["Acute physiological distress", "Potential bio-contagion", "Time-critical oxygen deprivation"]
                secondary_hazards = ["Secondary shock", "Crowd distress"]
                infrastructure = ["Emergency ingress/egress bay"]
                est_people = 6
                affected_area = "Specific site perimeter"
            else:
                primary_hazards = ["Unspecified physical hazard"]
                secondary_hazards = ["Escalation under variable conditions"]
                infrastructure = ["Local street facilities"]
                est_people = 10

        return {
            "status": "Completed",
            "category": cat,
            "category_confidence": cat_conf,
            "affected_area": affected_area,
            "estimated_people_affected": est_people,
            "primary_hazards": primary_hazards,
            "secondary_hazards": secondary_hazards,
            "infrastructure_affected": infrastructure,
            "classification_summary": f"Categorized as {cat} ({cat_conf}% confidence) with {len(primary_hazards)} identified primary hazards."
        }
