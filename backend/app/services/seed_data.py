import datetime
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.resource import Resource
from app.agents.orchestrator import orchestrator

# Base coordinates centered in a realistic metro area (San Francisco Bay / Metro Hub)
BASE_LAT = 37.7749
BASE_LNG = -122.4194

INITIAL_RESOURCES = [
    # Ambulances
    {
        "id": "RES-AMB-01",
        "name": "Advanced Life Support Unit ALS-101",
        "category": "Ambulances",
        "status": "Available",
        "location_name": "Downtown Station 3",
        "latitude": 37.7833,
        "longitude": -122.4167,
        "contact": "Dispatch Dispatcher 4",
        "capacity": "2 Critical Patients"
    },
    {
        "id": "RES-AMB-02",
        "name": "Medic Response Unit Medic-4",
        "category": "Ambulances",
        "status": "Deployed",
        "location_name": "Mission District Bay",
        "latitude": 37.7599,
        "longitude": -122.4148,
        "contact": "Unit Leader Ramos",
        "capacity": "2 Patients"
    },
    {
        "id": "RES-AMB-03",
        "name": "LifeFlight Air Ambulance Heli-1",
        "category": "Ambulances",
        "status": "Available",
        "location_name": "Metro Heliport Pad B",
        "latitude": 37.7890,
        "longitude": -122.3990,
        "contact": "Pilot Johnson",
        "capacity": "1 ICU Patient"
    },
    # Hospitals
    {
        "id": "RES-HOSP-01",
        "name": "St. Jude Level 1 Trauma Center",
        "category": "Hospitals",
        "status": "Available",
        "location_name": "Potrero Medical Hill",
        "latitude": 37.7558,
        "longitude": -122.4042,
        "contact": "ER Coordinator - 555-0192",
        "capacity": "45 ICU Beds / Trauma Surgical Suites"
    },
    {
        "id": "RES-HOSP-02",
        "name": "Metro General Hospital",
        "category": "Hospitals",
        "status": "Busy",
        "location_name": "North Heights Medical Plaza",
        "latitude": 37.7885,
        "longitude": -122.4324,
        "contact": "Triage Reception - 555-0144",
        "capacity": "18 Available Beds"
    },
    # Fire Stations & Trucks
    {
        "id": "RES-FIRE-01",
        "name": "Central Fire Station #1",
        "category": "Fire stations",
        "status": "Available",
        "location_name": "Civic Center Precinct",
        "latitude": 37.7785,
        "longitude": -122.4172,
        "contact": "Battalion Chief Evans",
        "capacity": "3 Engine Bays / High Volume Pumps"
    },
    {
        "id": "RES-TRK-01",
        "name": "Heavy Ladder & Pumper Truck 7",
        "category": "Fire trucks",
        "status": "Available",
        "location_name": "Station #1 Bay 2",
        "latitude": 37.7788,
        "longitude": -122.4175,
        "contact": "Captain O'Connor",
        "capacity": "100ft Aerial Platform / 2000 GPM"
    },
    {
        "id": "RES-TRK-02",
        "name": "Engine Company 3 - Rapid Attack",
        "category": "Fire trucks",
        "status": "Deployed",
        "location_name": "SoMa Industrial Zone",
        "latitude": 37.7712,
        "longitude": -122.4035,
        "contact": "Lt. Vance",
        "capacity": "1500 Gal Foam / Extrication Jaws"
    },
    # Rescue Teams & Flood Rescue Boats
    {
        "id": "RES-RESC-01",
        "name": "Urban Search & Rescue Task Force Alpha",
        "category": "Rescue teams",
        "status": "Available",
        "location_name": "Emergency Operations Reserve",
        "latitude": 37.7650,
        "longitude": -122.4200,
        "contact": "Commander Martinez",
        "capacity": "24 Certified Rescue Specialists + Canine"
    },
    {
        "id": "RES-BOAT-01",
        "name": "Swiftwater Flood Rescue Zodiac Fleet (Boat-1)",
        "category": "Flood rescue boats",
        "status": "Available",
        "location_name": "Marina Coastal Basin",
        "latitude": 37.8050,
        "longitude": -122.4380,
        "contact": "Coast Guard Liaison Petty Officer Chen",
        "capacity": "12 Passengers Evac / Shallow Draft"
    },
    {
        "id": "RES-BOAT-02",
        "name": "Riverine Flood Catamaran Rescue Craft 2",
        "category": "Flood rescue boats",
        "status": "Available",
        "location_name": "Mission Bay Pier 52",
        "latitude": 37.7705,
        "longitude": -122.3870,
        "contact": "Harbor Patrol Unit",
        "capacity": "18 Evacuees / Flood Obstacle Protected"
    },
    # Medical Teams & Emergency Shelters
    {
        "id": "RES-MED-01",
        "name": "Mobile Disaster Medical Team DMAT-3",
        "category": "Medical teams",
        "status": "Available",
        "location_name": "Presidio Field Deployment Hub",
        "latitude": 37.7980,
        "longitude": -122.4600,
        "contact": "Dr. Aris Thorne",
        "capacity": "Field Triage Tent / Advanced Resuscitation"
    },
    {
        "id": "RES-SHEL-01",
        "name": "Civic Auditorium Emergency Shelter",
        "category": "Emergency shelters",
        "status": "Available",
        "location_name": "Grove St Community Complex",
        "latitude": 37.7790,
        "longitude": -122.4180,
        "contact": "Red Cross Site Supervisor",
        "capacity": "350 Cots / Food & Clean Water"
    },
    {
        "id": "RES-SHEL-02",
        "name": "High School Gymnasium Shelter",
        "category": "Emergency shelters",
        "status": "Available",
        "location_name": "Sunset District Boulevard",
        "latitude": 37.7540,
        "longitude": -122.4760,
        "contact": "Municipal Shelter Admin",
        "capacity": "200 Persons"
    },
    # Police Units
    {
        "id": "RES-POL-01",
        "name": "Metro Police Tactical Traffic Squad 12",
        "category": "Police units",
        "status": "Available",
        "location_name": "Central Police Headquarters",
        "latitude": 37.7750,
        "longitude": -122.4010,
        "contact": "Sgt. Miller",
        "capacity": "Perimeter Cordon & Highway Divert"
    },
    {
        "id": "RES-POL-02",
        "name": "Rapid Crowd & Evacuation Patrol Squad 5",
        "category": "Police units",
        "status": "Busy",
        "location_name": "South Market Precinct",
        "latitude": 37.7810,
        "longitude": -122.4080,
        "contact": "Officer Morales",
        "capacity": "8 Officers / 4 Interceptors"
    }
]

INITIAL_INCIDENTS = [
    {
        "id": "INC-2026-001",
        "title": "Severe Urban Flooding & Blocked Access Arteries",
        "description": "Continuous heavy torrential rainfall has caused flash flooding and severe water accumulation in a low-lying residential neighborhood. Water levels have reached 1.2 meters. Multiple reports of residents stranded in second-floor buildings, submerged passenger vehicles, and blocked arterial roadways preventing conventional vehicle passage.",
        "category": "Flood",
        "status": "Response in Progress",
        "location_name": "Riverside Lowland Residential District, Sector 4",
        "latitude": 37.7680,
        "longitude": -122.4090,
        "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
        "people_affected": 85,
        "affected_area": "4 square blocks around Riverside Ave & 7th St",
        "hazards": "Rising water, submerged electrical boxes, trapped citizens",
        "severity": "Critical",
        "risk_score": 92.0,
        "confidence_score": 94.0,
        "verification_status": "Verified",
        "verification_reason": "Multiple cross-corroborated eyewitness reports, verified drone imagery, and hydrological sensor telemetry."
    },
    {
        "id": "INC-2026-002",
        "title": "Multi-Story Commercial Complex 3-Alarm Fire",
        "description": "Intense smoke and heavy flames reported emerging from the 3rd and 4th floors of a commercial office and retail building. High wind gusts present serious risk of radiant heat and ember spread to adjacent densely packed buildings.",
        "category": "Fire",
        "status": "Response in Progress",
        "location_name": "Metro Commercial Plaza, 450 Market Corridor",
        "latitude": 37.7910,
        "longitude": -122.4005,
        "image_url": "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80",
        "people_affected": 50,
        "affected_area": "450 Market St & 150m perimeter zone",
        "hazards": "Active flame front, toxic smoke, structural roof degradation",
        "severity": "High",
        "risk_score": 84.0,
        "confidence_score": 90.0,
        "verification_status": "Verified",
        "verification_reason": "Corroborated by city CCTV cameras, 911 dispatch calls, and automated fire suppression alarm trigger."
    },
    {
        "id": "INC-2026-003",
        "title": "Multi-Vehicle Pileup with Fuel Spill on Highway",
        "description": "Severe highway collision involving an overturned commercial tractor-trailer and four passenger sedans. Multiple trapped occupants with suspected serious trauma. Tanker diesel fuel leak spreading across lanes 1-3 causing total traffic shutdown.",
        "category": "Accident",
        "status": "Under Investigation",
        "location_name": "Interstate 880 Westbound Interchange at Milepost 14",
        "latitude": 37.7610,
        "longitude": -122.3920,
        "image_url": "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
        "people_affected": 14,
        "affected_area": "Highway westbound corridor, 2km traffic queue",
        "hazards": "Flammable diesel fuel, entangled vehicular wreckage, high-speed approach risk",
        "severity": "High",
        "risk_score": 79.0,
        "confidence_score": 86.0,
        "verification_status": "Verified",
        "verification_reason": "Highway patrol camera feed confirmation and emergency telemetry transponders."
    },
    {
        "id": "INC-2026-004",
        "title": "Seismic Tremor Structural Damage & Gas Fissure",
        "description": "A magnitude 5.2 seismic tremor caused visible structural masonry cracking in older multi-family apartment buildings. Residents evacuated to sidewalks. Odor of natural gas reported near basement metering stations.",
        "category": "Earthquake",
        "status": "Under Investigation",
        "location_name": "South Hills District, 24th & Mission Sector",
        "latitude": 37.7520,
        "longitude": -122.4180,
        "image_url": "https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80",
        "people_affected": 120,
        "affected_area": "District-wide 1km radius zone",
        "hazards": "Gas leak ignition risk, masonry facade spalling, aftershocks",
        "severity": "Medium",
        "risk_score": 58.0,
        "confidence_score": 76.0,
        "verification_status": "Needs Review",
        "verification_reason": "Seismic station alert confirmed; on-site building inspectors dispatched to evaluate structural integrity."
    },
    {
        "id": "INC-2026-005",
        "title": "Hillside Mudslide Blocking Mountain Access Road",
        "description": "Unstable saturated hillside gave way, spilling mud, fallen timber and boulders across the primary access road. 25 isolated rural households cut off from standard vehicular access.",
        "category": "Landslide",
        "status": "Reported",
        "location_name": "Twin Peaks Ridge Pass, Scenic Route 3",
        "latitude": 37.7544,
        "longitude": -122.4477,
        "image_url": "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
        "people_affected": 30,
        "affected_area": "Mountain road section 500 meters",
        "hazards": "Secondary slope failure, power line collapse",
        "severity": "Medium",
        "risk_score": 52.0,
        "confidence_score": 62.0,
        "verification_status": "Needs Review",
        "verification_reason": "Single eyewitness report with photos; geotechnical surveying team en route."
    },
    {
        "id": "INC-2026-006",
        "title": "Industrial Warehouse Chemical Vapor Irritation",
        "description": "Forklift incident punctured two drums of industrial solvent inside warehouse. Fumes venting into street. 6 workers receiving field respiratory treatment.",
        "category": "Medical",
        "status": "Resolved",
        "location_name": "Bayview Industrial Park, Building C",
        "latitude": 37.7310,
        "longitude": -122.3890,
        "image_url": "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=800&q=80",
        "people_affected": 8,
        "affected_area": "Single warehouse facility",
        "hazards": "Chemical vapors neutralized",
        "severity": "Low",
        "risk_score": 28.0,
        "confidence_score": 96.0,
        "verification_status": "Verified",
        "verification_reason": "HazMat team neutralized spill; air quality monitors indicate normal baseline levels."
    }
]

def seed_database(db: Session, force_reset: bool = False):
    """Populates database with realistic emergency scenarios and resources."""
    if force_reset:
        db.query(Incident).delete()
        db.query(Resource).delete()
        db.commit()

    # Seed resources if empty
    if db.query(Resource).count() == 0:
        for r_data in INITIAL_RESOURCES:
            res = Resource(**r_data)
            db.add(res)
        db.commit()

    # Seed incidents if empty
    if db.query(Incident).count() == 0:
        for inc_data in INITIAL_INCIDENTS:
            inc = Incident(
                id=inc_data["id"],
                title=inc_data["title"],
                description=inc_data["description"],
                category=inc_data["category"],
                status=inc_data["status"],
                location_name=inc_data["location_name"],
                latitude=inc_data["latitude"],
                longitude=inc_data["longitude"],
                image_url=inc_data.get("image_url"),
                people_affected=inc_data.get("people_affected", 0),
                affected_area=inc_data.get("affected_area", "Local sector"),
                hazards=inc_data.get("hazards", "Under assessment"),
                severity=inc_data.get("severity", "Medium"),
                risk_score=inc_data.get("risk_score", 50.0),
                confidence_score=inc_data.get("confidence_score", 70.0),
                verification_status=inc_data.get("verification_status", "Needs Review"),
                verification_reason=inc_data.get("verification_reason", ""),
                pipeline_status="Completed"
            )
            db.add(inc)
            db.commit()

            # Run full agent pipeline on each seeded incident to generate realistic agent outputs
            orchestrator.run_pipeline(inc_data, db)

    # Assign resources to active incidents for realism
    res_amb_02 = db.query(Resource).filter(Resource.id == "RES-AMB-02").first()
    if res_amb_02 and not res_amb_02.assigned_incident_id:
        res_amb_02.assigned_incident_id = "INC-2026-001"
        res_amb_02.status = "Deployed"

    res_trk_02 = db.query(Resource).filter(Resource.id == "RES-TRK-02").first()
    if res_trk_02 and not res_trk_02.assigned_incident_id:
        res_trk_02.assigned_incident_id = "INC-2026-002"
        res_trk_02.status = "Deployed"

    db.commit()
