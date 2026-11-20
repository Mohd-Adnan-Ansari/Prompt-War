import re
from typing import Dict, Any
from app.agents.base import BaseAgent, AgentContext
from app.services.llm_service import llm_service

class ReportCollectionAgent(BaseAgent):
    agent_id = "report_collection"
    agent_name = "Report Collection Agent"
    role_description = "Collects, validates, and normalizes incoming emergency reports from citizen submissions, dispatch feeds, and sensor networks."

    def run(self, context: AgentContext) -> Dict[str, Any]:
        inc = context.incident_data
        
        title = inc.get("title", "").strip()
        description = inc.get("description", "").strip()
        category = inc.get("category", "Other")
        location_name = inc.get("location_name", "").strip()
        lat = float(inc.get("latitude", 0.0))
        lng = float(inc.get("longitude", 0.0))
        image_url = inc.get("image_url", None)
        source_channel = inc.get("source_channel", "Citizen Command Web Portal")
        
        # Calculate baseline completeness
        missing = []
        score = 100
        if not title:
            missing.append("title")
            score -= 20
        if not description or len(description) < 15:
            missing.append("detailed_description")
            score -= 25
        if not location_name:
            missing.append("location_name")
            score -= 15
        if lat == 0.0 and lng == 0.0:
            missing.append("gps_coordinates")
            score -= 20
        if not image_url:
            missing.append("photographic_evidence")
            score -= 10

        completeness_score = max(score, 10)

        # Gemini Agent Operation: Semantic normalization & entity extraction
        prompt = f"""
You are the Report Collection & Ingestion Agent for CrisisAI.
Analyze this raw emergency report submission and normalize it into structured telemetry:
Title: {title}
Description: {description}
Declared Category: {category}
Location: {location_name} (GPS: {lat}, {lng})
Has Image: {bool(image_url)}

Respond in valid JSON with:
{{
  "normalized_title": "Concise standardized incident title",
  "summary": "1-2 sentence factual synopsis",
  "urgency_signal": "Critical" | "High" | "Medium" | "Low",
  "extracted_entities": {{
    "landmarks": ["string"],
    "environmental_signals": ["string"],
    "casualty_mentions": boolean
  }},
  "completeness_score": integer (0-100),
  "data_quality": "High" | "Acceptable" | "Incomplete"
}}
"""
        gemini_res = llm_service.generate_json(prompt, system_prompt="You are a 911 Emergency Dispatch Ingestion Specialist.")
        
        ai_extracted = {}
        if gemini_res and "normalized_title" in gemini_res:
            ai_extracted = gemini_res
            if "completeness_score" in gemini_res:
                completeness_score = int(gemini_res["completeness_score"])
            normalized_title = gemini_res.get("normalized_title", title)
        else:
            normalized_title = title or "Untitled Emergency Report"

        normalized = {
            "title": normalized_title,
            "raw_description": description,
            "category": category,
            "location": {
                "name": location_name or "Unknown Coordinates",
                "latitude": lat,
                "longitude": lng,
                "coordinates_valid": (lat != 0.0 or lng != 0.0)
            },
            "has_media": bool(image_url),
            "media_url": image_url,
            "source": {
                "channel": source_channel,
                "ingest_timestamp": inc.get("created_at") or "now",
                "format_version": "CrisisAI-v1.0"
            },
            "completeness_score": completeness_score,
            "missing_attributes": missing,
            "gemini_telemetry": ai_extracted
        }

        return {
            "status": "Completed" if completeness_score >= 40 else "Needs Review",
            "completeness_score": completeness_score,
            "source_channel": source_channel,
            "normalized_report": normalized,
            "ai_engine": "Gemini API (Active)" if ai_extracted else "Heuristic Ingestion Engine",
            "message": f"Successfully ingested and normalized report with {completeness_score}% completeness."
        }
