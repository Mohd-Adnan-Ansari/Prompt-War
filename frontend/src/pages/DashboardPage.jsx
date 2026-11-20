import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Truck,
  Activity,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Waves
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCrisis } from '../context/CrisisContext';
import { KPIStatCard } from '../components/common/KPIStatCard';
import { SeverityBadge, StatusBadge, VerificationBadge, RiskScoreGauge } from '../components/common/Badges';
import { EmergencyMap } from '../components/map/EmergencyMap';
import { AgentPipelineVisualizer } from '../components/agents/AgentPipelineVisualizer';
import { AssignResourceModal } from '../components/common/AssignResourceModal';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    incidents,
    resources,
    dashboardStats,
    loading,
    refreshData,
    runFloodDemo,
    openAssistantWithIncident,
  } = useCrisis();

  const [selectedIncidentForMap, setSelectedIncidentForMap] = useState(null);
  const [assignModalResource, setAssignModalResource] = useState(null);
  const [runningDemo, setRunningDemo] = useState(false);

  const kpis = dashboardStats?.kpis || {
    total_active_incidents: incidents.filter((i) => i.status !== 'Resolved').length,
    critical_incidents: incidents.filter((i) => i.severity === 'Critical').length,
    verified_reports: incidents.filter((i) => i.verification_status === 'Verified').length,
    available_resources: resources.filter((r) => r.status === 'Available').length,
    deployed_resources: resources.filter((r) => r.status === 'Deployed').length,
    reports_requiring_review: incidents.filter((i) =>
      ['Needs Review', 'Unverified'].includes(i.verification_status)
    ).length,
  };

  const severityData = dashboardStats?.severity_distribution || [
    { name: 'Critical', value: 2, color: '#EF4444' },
    { name: 'High', value: 2, color: '#F97316' },
    { name: 'Medium', value: 2, color: '#FACC15' },
    { name: 'Low', value: 1, color: '#22C55E' },
  ];

  const categoryData = dashboardStats?.category_distribution || [
    { name: 'Flood', count: 2 },
    { name: 'Fire', count: 1 },
    { name: 'Accident', count: 1 },
    { name: 'Earthquake', count: 1 },
    { name: 'Landslide', count: 1 },
    { name: 'Medical', count: 1 },
  ];

  const criticalFeed = dashboardStats?.critical_feed || incidents.slice(0, 5);

  const handleRunFlood = async () => {
    try {
      setRunningDemo(true);
      await runFloodDemo();
    } finally {
      setRunningDemo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Assign Resource Modal */}
      <AssignResourceModal
        isOpen={Boolean(assignModalResource)}
        onClose={() => setAssignModalResource(null)}
        resource={assignModalResource}
        onAssigned={refreshData}
      />

      {/* Top Banner / AI Situation Summary */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0C1527] via-[#101D36] to-[#0C1527] border border-cyan-500/40 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                AI Situation Telemetry
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                Live Analysis
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-4xl leading-relaxed">
              {dashboardStats?.situation_summary ||
                'Multi-agent neural network monitoring active sectors. High-risk flood and structural fire emergencies prioritized for immediate multi-agency response.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-auto">
          <button
            onClick={handleRunFlood}
            disabled={runningDemo}
            className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{runningDemo ? 'Simulating...' : 'Flood Demo Scenario'}</span>
          </button>
          <button
            onClick={refreshData}
            className="p-2 bg-[#101D36] hover:bg-[#13213B] text-slate-200 rounded-xl border border-[#182E4F] hover:border-cyan-400 transition"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards (6 dynamic cards as specified in Section 4) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KPIStatCard
          title="Active Incidents"
          value={kpis.total_active_incidents}
          icon={Activity}
          color="cyan"
          subtitle="Monitored emergencies"
          onClick={() => navigate('/incidents')}
        />
        <KPIStatCard
          title="Critical Emergencies"
          value={kpis.critical_incidents}
          icon={AlertTriangle}
          color="red"
          subtitle="Life safety priority"
          onClick={() => navigate('/incidents?severity=Critical')}
        />
        <KPIStatCard
          title="Verified Reports"
          value={kpis.verified_reports}
          icon={ShieldCheck}
          color="green"
          subtitle="Multi-sensor corroborated"
          onClick={() => navigate('/incidents?verification_status=Verified')}
        />
        <KPIStatCard
          title="Available Fleet"
          value={kpis.available_resources}
          icon={Truck}
          color="purple"
          subtitle="Ready for staging"
          onClick={() => navigate('/resources?status=Available')}
        />
        <KPIStatCard
          title="Deployed Units"
          value={kpis.deployed_resources}
          icon={Flame}
          color="orange"
          subtitle="Engaged on scene"
          onClick={() => navigate('/resources?status=Deployed')}
        />
        <KPIStatCard
          title="Needs Review"
          value={kpis.reports_requiring_review}
          icon={HelpCircle}
          color="yellow"
          subtitle="Pending human dispatch"
          onClick={() => navigate('/incidents?verification_status=Needs Review')}
        />
      </div>

      {/* Main Grid: Interactive Map + Critical Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Incident Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Live Incident & Tactical Map</h3>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Full Screen Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <EmergencyMap
            incidents={incidents}
            resources={resources}
            height="460px"
            selectedIncident={selectedIncidentForMap}
            onIncidentSelect={(inc) => setSelectedIncidentForMap(inc)}
            onAssignResource={(res) => setAssignModalResource(res)}
          />
        </div>

        {/* Critical Incident Feed */}
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-[#182E4F] pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white">Critical Priority Feed</h3>
            </div>
            <span className="text-[11px] font-mono text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/30">
              Live Priority
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[420px] pr-1">
            {criticalFeed.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate(`/incidents/${inc.id}`)}
                className="p-3 bg-[#060B14] border border-[#182E4F] hover:border-cyan-400 rounded-xl transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                    {inc.id}
                  </span>
                  <SeverityBadge severity={inc.severity} />
                </div>

                <h4 className="text-xs font-bold text-white leading-snug group-hover:text-cyan-300 transition line-clamp-2">
                  {inc.title}
                </h4>

                <div className="text-[11px] text-slate-300 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{inc.location_name}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#182E4F] text-[11px]">
                  <VerificationBadge status={inc.verification_status} />
                  <span className="font-mono font-bold text-red-400">
                    Risk {Math.round(inc.risk_score || 0)}/100
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/incidents')}
            className="w-full mt-3 py-2 bg-[#101D36] hover:bg-[#13213B] text-white border border-[#182E4F] hover:border-cyan-400/50 rounded-xl text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
          >
            <span>View All {incidents.length} Incident Reports</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Multi-Agent Orchestration Visualizer */}
      <AgentPipelineVisualizer steps={incidents[0]?.ai_analysis?.step_results || []} />

      {/* Distribution Analytics: Severity & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Severity Distribution Donut */}
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Severity Distribution</h3>
          <p className="text-xs text-slate-400 mb-3">Breakdown by calibrated threat level</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0C1527', borderColor: '#182E4F', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#182E4F] text-xs">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                  <span className="text-white">{s.name}</span>
                </span>
                <span className="font-mono font-bold text-cyan-300">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Type Distribution Bar */}
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Incidents by Disaster Type</h3>
          <p className="text-xs text-slate-400 mb-3">Live classification taxonomy breakdown</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0C1527', borderColor: '#182E4F', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-[#182E4F]">
            Automated categorization via Agent 03 &bull; Natural Language Classifier
          </div>
        </div>

        {/* Emergency Resource Overview */}
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white">Tactical Resource Fleet</h3>
              <button
                onClick={() => navigate('/resources')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Manage &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Availability status across 9 asset categories</p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs">
                <span className="text-slate-200 font-medium">Ambulances & Medevac</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {resources.filter((r) => r.category === 'Ambulances' && r.status === 'Available').length} /{' '}
                  {resources.filter((r) => r.category === 'Ambulances').length} Available
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs">
                <span className="text-slate-200 font-medium">Fire Engines & Ladders</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {resources.filter((r) => r.category.includes('Fire') && r.status === 'Available').length} /{' '}
                  {resources.filter((r) => r.category.includes('Fire')).length} Available
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs">
                <span className="text-slate-200 font-medium">Flood Rescue Boats</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {resources.filter((r) => r.category.includes('boat') && r.status === 'Available').length} /{' '}
                  {resources.filter((r) => r.category.includes('boat')).length} Available
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs">
                <span className="text-slate-200 font-medium">Emergency Shelters</span>
                <span className="font-mono text-white font-bold">
                  {resources.filter((r) => r.category.includes('shelter')).length} Active Sites
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#182E4F] mt-4">
            <button
              onClick={() => navigate('/resources')}
              className="w-full py-2 bg-[#101D36] hover:bg-[#13213B] text-white border border-[#182E4F] hover:border-cyan-400/50 rounded-xl text-xs font-semibold text-center transition"
            >
              View Full Asset Fleet &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
