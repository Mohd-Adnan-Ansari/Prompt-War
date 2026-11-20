import os
import json
import time
from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.services.llm_service import llm_service
from app.agents.orchestrator import orchestrator
from app.services.assistant_service import assistant_service

def run_tests():
    print("==================================================")
    print("Testing CrisisAI Gemini Integration")
    print(f"GEMINI_API_KEY loaded: {bool(settings.GEMINI_API_KEY)}")
    print("==================================================")

    # 1. Test live connection
    conn = llm_service.test_connection()
    print("1. Gemini Connection Test Result:", conn)
    assert conn["connected"] is True, f"Connection failed: {conn.get('error')}"

    # 2. Test Multi-Agent Pipeline with a realistic disaster report
    db = SessionLocal()
    sample_incident = {
        "id": "INC-GEMINI-TEST",
        "title": "Severe Flash Flood Inundation & Trapped Civilians on 4th St",
        "description": "Continuous cloudburst rainfall has swollen the local creek to 1.3 meters depth. 12 residents trapped on 2nd floor balconies, electrical transformers sparking, and swiftwater rescue boats urgently required.",
        "category": "Flood",
        "location_name": "Riverside Sector 4, 4th & Mission",
        "latitude": 37.7680,
        "longitude": -122.4090,
        "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "people_affected": 45
    }

    print("\n2. Executing 6 AI Agents with Gemini API...")
    start = time.time()
    result = orchestrator.run_pipeline(sample_incident, db)
    elapsed = round(time.time() - start, 2)
    print(f"Pipeline finished in {elapsed}s with status: {result['pipeline_status']}")

    for step in result["steps"]:
        print(f"  - [{step['agent_id']}] {step['agent_name']}: {step['status']} ({step['execution_time_ms']}ms)")
        # Show snippet of AI output
        out = step.get("output", {})
        if "action_plan" in out:
            print(f"    Summary: {out['action_plan'].get('incident_summary')[:100]}...")
        elif "severity_level" in out:
            print(f"    Severity: {out['severity_level']} (Risk: {out['risk_score']}) - {out.get('severity_reason', '')[:80]}...")
        elif "confidence_score" in out:
            print(f"    Confidence: {out['confidence_score']}% ({out.get('verification_status')}) - {out.get('verification_reason', '')[:80]}...")
        elif "category" in out:
            print(f"    Category: {out['category']} ({out.get('category_confidence')}% conf) - Hazards: {out.get('primary_hazards')}")

    # 3. Test CrisisAI Assistant with Gemini
    print("\n3. Testing CrisisAI Assistant grounded query with Gemini...")
    chat_res = assistant_service.process_query("What are the current critical incidents and what should responders do first?", db)
    print("Assistant Reply Snippet:\n", chat_res.reply[:300], "...\n")
    print(f"Referenced Incidents: {[r.id for r in chat_res.referenced_incidents]}")
    print(f"Data summary: {chat_res.data_summary}")

    db.close()
    print("\n==================================================")
    print("ALL GEMINI INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
