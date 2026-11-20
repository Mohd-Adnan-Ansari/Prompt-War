import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.incident import Incident
from app.models.resource import Resource

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    resources = db.query(Resource).all()

    total = len(incidents)
    resolved_count = sum(1 for i in incidents if i.status == "Resolved")
    in_progress_count = sum(1 for i in incidents if i.status == "Response in Progress")
    under_investigation = sum(1 for i in incidents if i.status == "Under Investigation")
    reported_count = sum(1 for i in incidents if i.status == "Reported")

    # Categories
    cats = {}
    for i in incidents:
        cats[i.category] = cats.get(i.category, 0) + 1
    type_data = [{"name": k, "count": v} for k, v in sorted(cats.items(), key=lambda x: x[1], reverse=True)]

    # Severities
    sev_map = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for i in incidents:
        if i.severity in sev_map:
            sev_map[i.severity] += 1
    severity_data = [{"name": k, "count": v} for k, v in sev_map.items()]

    # Verification stats
    ver_map = {"Verified": 0, "Needs Review": 0, "Unverified": 0}
    for i in incidents:
        if i.verification_status in ver_map:
            ver_map[i.verification_status] += 1
    verification_data = [{"name": k, "count": v} for k, v in ver_map.items()]

    # Resolution stats
    resolution_data = [
        {"name": "Resolved", "count": resolved_count, "color": "#22C55E"},
        {"name": "In Progress", "count": in_progress_count, "color": "#38BDF8"},
        {"name": "Under Investigation", "count": under_investigation, "color": "#FACC15"},
        {"name": "Reported", "count": reported_count, "color": "#94A3B8"},
    ]

    # Resource utilization
    res_status = {"Available": 0, "Deployed": 0, "Busy": 0, "Offline": 0}
    for r in resources:
        res_status[r.status] = res_status.get(r.status, 0) + 1
    resource_utilization = [{"status": k, "units": v} for k, v in res_status.items()]

    # Simulated daily activity trend
    daily_trends = [
        {"day": "Mon", "incidents": 4, "resolved": 3, "avg_response_min": 14},
        {"day": "Tue", "incidents": 6, "resolved": 5, "avg_response_min": 12},
        {"day": "Wed", "incidents": 3, "resolved": 3, "avg_response_min": 15},
        {"day": "Thu", "incidents": 8, "resolved": 6, "avg_response_min": 11},
        {"day": "Fri", "incidents": 7, "resolved": 4, "avg_response_min": 13},
        {"day": "Sat", "incidents": 11, "resolved": 8, "avg_response_min": 10},
        {"day": "Sun (Today)", "incidents": max(total, 6), "resolved": resolved_count, "avg_response_min": 9.4},
    ]

    avg_response_time = 11.2  # minutes

    return {
        "total_incidents": total,
        "resolved_incidents": resolved_count,
        "avg_response_time_min": avg_response_time,
        "incident_types": type_data,
        "incident_severities": severity_data,
        "verification_stats": verification_data,
        "resolution_stats": resolution_data,
        "resource_utilization": resource_utilization,
        "daily_trends": daily_trends
    }

@router.get("/situation-report")
def generate_ai_situation_report(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    resources = db.query(Resource).all()

    criticals = [i for i in incidents if i.severity == "Critical"]
    highs = [i for i in incidents if i.severity == "High"]
    available_res = [r for r in resources if r.status == "Available"]

    # Major incident descriptions
    major_summaries = []
    for inc in criticals + highs:
        major_summaries.append({
            "id": inc.id,
            "title": inc.title,
            "category": inc.category,
            "severity": inc.severity,
            "risk_score": inc.risk_score,
            "location": inc.location_name,
            "status": inc.status,
            "people_affected": inc.people_affected,
            "hazards": inc.hazards
        })

    # Geographic hotspots
    hotspots = [
        {"name": "Riverside Lowland Basin", "incident_count": 2, "threat_level": "Severe (Flood / Inundation)"},
        {"name": "Metro Commercial Core (Market St)", "incident_count": 1, "threat_level": "High (Multi-Alarm Fire)"},
        {"name": "Interstate 880 Corridor", "incident_count": 1, "threat_level": "High (Traffic Hazardous Spill)"},
        {"name": "South Hills / Mission Fault Line", "incident_count": 1, "threat_level": "Moderate (Seismic Structural)"}
    ]

    report = {
        "report_id": f"SITREP-{datetime.datetime.utcnow().strftime('%Y%m%d-%H%M')}",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "classification": "UNCLASSIFIED // CRISISAI OPERATIONAL DEMO",
        "executive_summary": (
            f"As of {datetime.datetime.utcnow().strftime('%B %d, %Y')}, the CrisisAI Command Centre is actively managing "
            f"{len(incidents)} simulated emergency incidents across metropolitan sectors. "
            f"There are currently {len(criticals)} Critical incidents requiring priority resource coordination and "
            f"{len(highs)} High severity incidents. Total regional fleet readiness stands at "
            f"{round(len(available_res)/max(len(resources),1)*100)}% ({len(available_res)} available units)."
        ),
        "major_incidents": major_summaries,
        "highest_priority_emergencies": [
            f"[{c.id}] {c.title} — Immediate life-safety triage in effect ({c.location_name})"
            for c in criticals
        ],
        "geographic_hotspots": hotspots,
        "resource_readiness_status": {
            "total_units": len(resources),
            "available": len(available_res),
            "deployed": sum(1 for r in resources if r.status == "Deployed"),
            "busy_or_offline": sum(1 for r in resources if r.status in ["Busy", "Offline"]),
            "key_shortages": "Heavy water rescue crafts at 65% capacity; trauma surgical beds adequate."
        },
        "recommended_priorities": [
            "Maintain Swiftwater Boat staging at Riverside Lowlands sector to ensure civilian rooftop evacuation.",
            "Enforce 2-block safety perimeter around Commercial Plaza fire to prevent radiant heat combustion.",
            "Reroute interstate traffic around MP 14 fuel spill before evening commute peak.",
            "Verify all pending social feeds and eyewitness reports for secondary seismic damage reports."
        ],
        "disclaimer": "CRISISAI PROTOTYPE ADVISORY: This situation report is compiled by automated multi-agent AI intelligence modules for simulation purposes. Operational decisions require human dispatch approval."
    }
    return report
