from fastapi.testclient import TestClient
from app.main import app

def test_api_suite():
    with TestClient(app) as client:
        # 1. Health
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["agents_available"] == 6

        # 2. Get Incidents
        res = client.get("/api/incidents")
        assert res.status_code == 200
        incidents = res.json()
        assert len(incidents) >= 4
        print(f"Total incidents: {len(incidents)}")

        # 3. Incident Detail
        res = client.get("/api/incidents/INC-2026-001")
        assert res.status_code == 200
        detail = res.json()
        assert detail["id"] == "INC-2026-001"
        assert detail["category"] == "Flood"
        assert "ai_analysis" in detail
        assert "action_plan" in detail

        # 4. Create and Analyze Incident
        payload = {
            "title": "Severe Flash Flood Water Surge on Elm St",
            "category": "Flood",
            "description": "Rising river waters have inundated residential basements. Multiple vehicles stalled and residents stranded.",
            "location_name": "Elm Street Riverbank Sector",
            "latitude": 37.7710,
            "longitude": -122.4120,
            "people_affected": 30
        }
        res = client.post("/api/incidents?trigger_ai=true", json=payload)
        assert res.status_code == 200
        created = res.json()
        assert created["category"] == "Flood"
        assert created["risk_score"] > 0
        assert len(created["recommended_resources"]) > 0

        # 5. Resources and Assignment
        res = client.get("/api/resources")
        assert res.status_code == 200
        resources = res.json()
        assert len(resources) >= 10

        available = [r for r in resources if r["status"] == "Available"]
        assert len(available) > 0
        target_res = available[0]

        assign_res = client.post("/api/resources/assign", json={
            "resource_id": target_res["id"],
            "incident_id": "INC-2026-001"
        })
        assert assign_res.status_code == 200
        assert assign_res.json()["status"] == "Deployed"

        unassign_res = client.post(f"/api/resources/unassign/{target_res['id']}")
        assert unassign_res.status_code == 200
        assert unassign_res.json()["status"] == "Available"

        # 6. Dashboard Stats
        res = client.get("/api/dashboard/stats")
        assert res.status_code == 200
        stats = res.json()
        assert stats["kpis"]["total_active_incidents"] > 0

        # 7. Analytics and Sitrep
        res1 = client.get("/api/analytics/summary")
        assert res1.status_code == 200
        assert res1.json()["total_incidents"] > 0

        res2 = client.get("/api/analytics/situation-report")
        assert res2.status_code == 200
        assert "report_id" in res2.json()

        # 8. Assistant Chat
        res = client.post("/api/assistant/chat", json={
            "message": "What are the current critical incidents?"
        })
        assert res.status_code == 200
        chat = res.json()
        assert len(chat["reply"]) > 20

        # 9. Flood Demo Workflow
        res = client.post("/api/agents/run-demo-flood")
        assert res.status_code == 200
        demo = res.json()
        assert demo["pipeline_result"]["pipeline_status"] in ["Completed", "Needs Review"]
        assert len(demo["pipeline_result"]["steps"]) == 6

        print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api_suite()
