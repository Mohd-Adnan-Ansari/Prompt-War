from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.incident import Incident
from app.models.resource import Resource
from app.models.agent_log import AgentLog

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    all_incidents = db.query(Incident).all()
    all_resources = db.query(Resource).all()
    recent_logs = db.query(AgentLog).order_by(AgentLog.created_at.desc()).limit(8).all()

    active_incidents = [i for i in all_incidents if i.status != "Resolved"]
    critical_incidents = [i for i in all_incidents if i.severity == "Critical"]
    verified_reports = [i for i in all_incidents if i.verification_status == "Verified"]
    needs_review_reports = [i for i in all_incidents if i.verification_status in ["Needs Review", "Unverified"]]

    available_resources = [r for r in all_resources if r.status == "Available"]
    deployed_resources = [r for r in all_resources if r.status == "Deployed"]

    # Severity distribution
    sev_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for i in all_incidents:
        if i.severity in sev_counts:
            sev_counts[i.severity] += 1
    severity_distribution = [
        {"name": "Critical", "value": sev_counts["Critical"], "color": "#EF4444"},
        {"name": "High", "value": sev_counts["High"], "color": "#F97316"},
        {"name": "Medium", "value": sev_counts["Medium"], "color": "#FACC15"},
        {"name": "Low", "value": sev_counts["Low"], "color": "#22C55E"},
    ]

    # Category distribution
    cat_counts = {}
    for i in all_incidents:
        cat_counts[i.category] = cat_counts.get(i.category, 0) + 1
    category_distribution = [{"name": k, "count": v} for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)]

    # Resource category breakdown
    resource_breakdown = {}
    for r in all_resources:
        resource_breakdown.setdefault(r.category, {"total": 0, "available": 0, "deployed": 0})
        resource_breakdown[r.category]["total"] += 1
        if r.status == "Available":
            resource_breakdown[r.category]["available"] += 1
        elif r.status == "Deployed":
            resource_breakdown[r.category]["deployed"] += 1

    # AI Situation Summary
    situation_summary = (
        f"Multi-agent command network is monitoring {len(all_incidents)} total incidents, "
        f"with {len(critical_incidents)} Critical level emergencies requiring immediate tactical triage. "
        f"{len(verified_reports)} reports have achieved multi-sensor verification ({round(len(verified_reports)/max(len(all_incidents),1)*100)}%). "
        f"Tactical fleet readiness stands at {len(available_resources)} available units ready for staging."
    )

    # Recent critical feed
    critical_feed = [
        {
            "id": i.id,
            "title": i.title,
            "category": i.category,
            "severity": i.severity,
            "risk_score": i.risk_score,
            "location_name": i.location_name,
            "status": i.status,
            "verification_status": i.verification_status,
            "created_at": i.created_at.isoformat()
        }
        for i in sorted(all_incidents, key=lambda x: (x.severity == "Critical", x.risk_score or 0), reverse=True)[:5]
    ]

    # Agent activity preview
    agent_activity = [
        {
            "id": l.id,
            "incident_id": l.incident_id,
            "agent_id": l.agent_id,
            "agent_name": l.agent_name,
            "status": l.status,
            "execution_time_ms": l.execution_time_ms,
            "created_at": l.created_at.isoformat()
        }
        for l in recent_logs
    ]

    return {
        "kpis": {
            "total_active_incidents": len(active_incidents),
            "critical_incidents": len(critical_incidents),
            "verified_reports": len(verified_reports),
            "available_resources": len(available_resources),
            "deployed_resources": len(deployed_resources),
            "reports_requiring_review": len(needs_review_reports),
        },
        "severity_distribution": severity_distribution,
        "category_distribution": category_distribution,
        "resource_breakdown": resource_breakdown,
        "situation_summary": situation_summary,
        "critical_feed": critical_feed,
        "agent_activity": agent_activity
    }
