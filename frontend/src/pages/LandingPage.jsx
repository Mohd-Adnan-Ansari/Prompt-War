import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Bot,
  Truck,
  Activity,
  FileText,
  ShieldCheck,
  Tag,
  AlertTriangle,
  CheckSquare,
  Waves,
  Flame,
  Car
} from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { runFloodDemo } = useCrisis();

  const agents = [
    {
      id: '01',
      name: 'Report Collection Agent',
      icon: FileText,
      role: 'Multi-Source Ingestion',
      description:
        'Collects and normalizes raw reports from citizen mobile submissions, simulated 911 dispatch, sensor networks, and emergency news feeds.',
    },
    {
      id: '02',
      name: 'Verification Agent',
      icon: ShieldCheck,
      role: 'Credibility & Duplicate Engine',
      description:
        'Calculates 0–100 confidence scores, performs spatial duplicate detection within regional sectors, and flags suspicious or unverified reports.',
    },
    {
      id: '03',
      name: 'Incident Classification Agent',
      icon: Tag,
      role: 'Disaster Taxonomy & Hazards',
      description:
        'Classifies events into Floods, Fires, Accidents, Earthquakes, Landslides, or Medical, mapping primary and secondary hazard vectors.',
    },
    {
      id: '04',
      name: 'Severity Assessment Agent',
      icon: AlertTriangle,
      role: 'Life-Safety Risk Calibration',
      description:
        'Evaluates threat-to-life, affected populations, infrastructure vulnerability, and escalation velocity to assign Critical, High, Medium, or Low urgency.',
    },
    {
      id: '05',
      name: 'Resource Coordination Agent',
      icon: Truck,
      role: 'Fleet Proximity & Matching',
      description:
        'Calculates spatial proximity matrices across ambulances, fire stations, rescue boats, trauma hospitals, and shelters to recommend optimal staging.',
    },
    {
      id: '06',
      name: 'Action Planning Agent',
      icon: CheckSquare,
      role: 'Tactical Playbook Synthesis',
      description:
        'Synthesizes multi-agent telemetry into prioritized response action plans, risk matrices, and decision aids requiring human authorization.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060B14] text-white flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Banner */}
      <div className="bg-cyan-950/40 border-b border-cyan-500/30 px-4 py-2 text-center text-xs text-cyan-300 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>
          <strong>CrisisAI Demonstration Prototype:</strong> Autonomous Multi-Agent Command & Disaster Response Coordination
        </span>
      </div>

      {/* Navigation */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black tracking-wider text-white">
              CRISIS<span className="text-cyan-400">AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              MULTI-AGENT CRISIS COMMAND CENTRE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition"
          >
            <span>Launch Command Centre</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 sm:py-24 max-w-5xl mx-auto text-center">
        {/* Background ambient radial glow */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C1527] border border-cyan-500/40 text-cyan-400 text-xs font-mono mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Disaster Response Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Intelligent Multi-Agent{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-200 to-white bg-clip-text text-transparent">
            Crisis Command Centre
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          An automated emergency orchestration platform where six specialized AI agents collaborate to
          ingest, verify, classify, evaluate severity, coordinate critical resources, and synthesize
          actionable tactical playbooks for human incident commanders.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition transform hover:-translate-y-0.5"
          >
            <span>Open Command Centre</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={async () => {
              await runFloodDemo();
              navigate('/dashboard');
            }}
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-[#0C1527] hover:bg-[#13213B] text-white border border-[#182E4F] hover:border-cyan-400 flex items-center gap-2.5 transition"
          >
            <Waves className="w-4 h-4 text-cyan-400" />
            <span>Run Flood Demo Scenario</span>
          </button>
        </div>

        {/* Live Simulation Indicators */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3 bg-[#0C1527] border border-[#182E4F] rounded-xl text-center">
            <div className="text-xl font-bold font-mono text-cyan-400">6 Specialized</div>
            <div className="text-[11px] text-slate-400">Collaborative AI Agents</div>
          </div>
          <div className="p-3 bg-[#0C1527] border border-[#182E4F] rounded-xl text-center">
            <div className="text-xl font-bold font-mono text-white">&lt; 100ms</div>
            <div className="text-[11px] text-slate-400">Multi-Agent Latency</div>
          </div>
          <div className="p-3 bg-[#0C1527] border border-[#182E4F] rounded-xl text-center">
            <div className="text-xl font-bold font-mono text-cyan-300">0–100%</div>
            <div className="text-[11px] text-slate-400">Confidence Calibration</div>
          </div>
          <div className="p-3 bg-[#0C1527] border border-[#182E4F] rounded-xl text-center">
            <div className="text-xl font-bold font-mono text-white">100%</div>
            <div className="text-[11px] text-slate-400">Human-In-The-Loop</div>
          </div>
        </div>
      </section>

      {/* 6 AI Agents Showcase Section */}
      <section className="px-6 py-16 bg-[#0C1527] border-y border-[#182E4F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              Architecture & Collaboration
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The 6 Specialized Disaster Response Agents
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
              Each agent fulfills a distinct tactical responsibility, communicating via structured JSON
              telemetry to ensure complete explainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.id}
                  className="bg-[#060B14] border border-[#182E4F] hover:border-cyan-400/60 rounded-2xl p-6 transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-cyan-500/10 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      AGENT {agent.id}
                    </span>
                    <div className="p-2.5 bg-[#101D36] text-cyan-400 rounded-xl border border-[#182E4F] group-hover:border-cyan-400 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{agent.name}</h3>
                  <div className="text-xs text-cyan-300 font-semibold mb-3">{agent.role}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{agent.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Platform Capabilities */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            End-to-End Command Centre Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#0C1527] border border-[#182E4F] hover:border-cyan-400/50 rounded-2xl space-y-3 transition">
            <div className="p-3 bg-red-500/15 text-red-400 rounded-xl w-fit border border-red-500/30">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">GIS Emergency Mapping</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              OpenStreetMap and Leaflet visualization with color-coded severity markers (Red Critical,
              Orange High, Yellow Medium, Green Low) and resource clustering.
            </p>
          </div>

          <div className="p-6 bg-[#0C1527] border border-[#182E4F] hover:border-cyan-400/50 rounded-2xl space-y-3 transition">
            <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl w-fit border border-cyan-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Grounded AI Assistant</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CrisisAI Assistant answers complex operational queries grounded in live database telemetry,
              with direct clickable incident references.
            </p>
          </div>

          <div className="p-6 bg-[#0C1527] border border-[#182E4F] hover:border-cyan-400/50 rounded-2xl space-y-3 transition">
            <div className="p-3 bg-cyan-500/15 text-cyan-300 rounded-xl w-fit border border-cyan-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Tactical Resource Dispatch</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tracks ambulances, hospitals, fire trucks, rescue boats, and shelters with simulated
              haversine proximity matching and deployment control.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#182E4F] bg-[#0C1527] py-8 px-6 text-center text-xs text-slate-400 space-y-2">
        <div className="font-bold text-white">
          CrisisAI &bull; Multi-Agent Crisis Command Centre Prototype
        </div>
        <div>
          Designed for emergency disaster intelligence innovation. All resource dispatch and action plans are AI-assisted decision aids requiring human authorization.
        </div>
      </footer>
    </div>
  );
}
