# CrisisAI – Multi-Agent Crisis Command Centre

An intelligent disaster management platform where six specialized AI agents collaborate in real time to collect, verify, classify, analyze, and prioritize emergency incidents while helping human responders coordinate critical resources and response playbooks.

---

## 🚀 Key Features

1. **6 Modular AI Agents Pipeline**
   - **Agent 1: Report Collection Agent**: Ingests citizen reports, 911 dispatch feeds, and sensor networks; validates coordinates and photographic evidence.
   - **Agent 2: Verification Agent**: Computes 0–100 credibility scores, detects duplicate/nearby incidents within regional sectors, and flags suspicious reports.
   - **Agent 3: Incident Classification Agent**: Natural language classification into Flood, Fire, Accident, Earthquake, Landslide, or Medical; extracts primary/secondary hazards and impact spheres.
   - **Agent 4: Severity Assessment Agent**: Evaluates life-safety risks, affected population metrics, and escalation velocity to assign Critical, High, Medium, or Low urgency.
   - **Agent 5: Resource Coordination Agent**: Calculates spatial proximity across ambulances, fire stations, rescue boats, trauma centers, and shelters to recommend optimal staging.
   - **Agent 6: Action Planning Agent**: Synthesizes multi-agent telemetry into prioritized response action plans with phased tactical directives and human authorization disclaimers.

2. **Main Command Centre Dashboard**
   - Dynamic KPIs: Total Active, Critical, Verified Reports, Available Fleet, Deployed Fleet, Needs Review.
   - Embedded interactive GIS incident map.
   - Critical priority incident feed with instant navigation.
   - Multi-agent orchestration visualizer with millisecond latency metrics.
   - Recharts severity donut and disaster category distribution charts.

3. **Incident Management & Dedicated Flood Demo Workflow**
   - Submit new emergency reports with GPS picker, photo upload, and 1-click test presets.
   - Instant or background multi-agent execution pipeline.
   - Complete Flood Demonstration Workflow (Section 17) runnable in 1 click.

4. **Interactive GIS Emergency Map**
   - OpenStreetMap + Leaflet with color-coded markers (Red Critical, Orange High, Yellow Medium, Green Low).
   - Custom icons for hospitals, fire stations, rescue boats, ambulances, shelters, and police units.
   - Dynamic layer toggling and popup detail inspection.

5. **CrisisAI Assistant**
   - Real-time conversational AI grounded in live database telemetry.
   - Clickable incident chips in chat responses navigating directly to the corresponding incident.
   - Explainable AI answers with no hallucinated data.

6. **Resource Management & Dispatch**
   - Table and map views across 9 emergency asset categories.
   - Assign / unassign resources to active incidents in demo mode.
   - Fleet readiness matrix (Available, Deployed, Busy, Offline).

7. **Reports & Situation Analytics**
   - Weekly incident trends and simulated response times.
   - Automated AI-Powered Situation Report (SITREP) generator with print/export support.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: FastAPI (Python), SQLAlchemy ORM (SQLite / PostgreSQL), Pydantic schemas, modular 6-agent system with dual-mode heuristic/LLM engine.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet, React-Leaflet, React Router DOM.
- **Database**: SQLite / PostgreSQL (pre-seeded with realistic scenarios across Floods, Fires, Accidents, Earthquakes, and Landslides).

---

## ⚡ Quick Start

### 1. Run Backend Server

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI backend will automatically initialize the database, create tables, and seed realistic demo incidents and resources.
API Docs: `http://127.0.0.1:8000/docs`

### 2. Run Frontend Web App

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌊 Testing the Flood Demonstration Workflow

1. Navigate to the **Command Centre Dashboard** (`/dashboard`) or **Incidents Page** (`/incidents`).
2. Click the **"Run Flood Demo"** button in the header.
3. The platform will:
   - Ingest a severe urban flash flood report with coordinates and imagery.
   - Pass the payload sequentially through Agent 1 &rarr; Agent 2 &rarr; Agent 3 &rarr; Agent 4 &rarr; Agent 5 &rarr; Agent 6.
   - Display real-time progress on the Multi-Agent Activity Monitor.
   - Automatically update KPIs, map markers, severity risk score, and recommended rescue boats.
