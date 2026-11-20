import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Download,
  Sparkles,
  RefreshCw,
  Layers,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../services/api';
import { useCrisis } from '../context/CrisisContext';

export function AnalyticsPage() {
  const { incidents, addToast } = useCrisis();

  const [analytics, setAnalytics] = useState(null);
  const [sitrep, setSitrep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSitrep, setGeneratingSitrep] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryData, sitrepData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getSituationReport(),
      ]);
      setAnalytics(summaryData);
      setSitrep(sitrepData);
    } catch (err) {
      addToast(`Error loading analytics: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateSitrep = async () => {
    try {
      setGeneratingSitrep(true);
      addToast('Synthesizing fresh AI Situation Report...', 'info');
      const res = await api.getSituationReport();
      setSitrep(res);
      addToast('Situation Report updated!', 'success');
    } catch (err) {
      addToast(`Sitrep failed: ${err.message}`, 'error');
    } finally {
      setGeneratingSitrep(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Reports & Disaster Analytics</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#C6A66B]/15 text-[#C6A66B] border border-[#C6A66B]/30">
              Operational Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical incident metrics, verification efficacy, resource throughput, and automated SITREP generation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateSitrep}
            disabled={generatingSitrep}
            className="btn-cta px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generatingSitrep ? 'animate-spin' : ''}`} />
            <span>Generate Live SITREP</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-outline px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0C1527] border border-[#182E4F] rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase font-mono">Total Recorded Emergencies</div>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {analytics?.total_incidents || incidents.length}
            </div>
            <div className="text-[11px] text-[#C6A66B] mt-0.5">&bull; 100% processed by 6 AI agents</div>
          </div>
          <div className="p-3 bg-[#C6A66B]/15 text-[#C6A66B] rounded-xl border border-[#C6A66B]/30">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#0C1527] border border-[#182E4F] rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase font-mono">Simulated Response Time</div>
            <div className="text-3xl font-extrabold text-[#D4B77D] font-mono mt-1">
              {analytics?.avg_response_time_min || 11.2} <span className="text-sm font-normal text-slate-400">mins</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">&bull; 34% faster than manual routing</div>
          </div>
          <div className="p-3 bg-[#C6A66B]/15 text-[#D4B77D] rounded-xl border border-[#C6A66B]/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-[#0C1527] border border-[#182E4F] rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase font-mono">Resolved Incidents</div>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {analytics?.resolved_incidents || 1}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">&bull; Triage to de-escalation complete</div>
          </div>
          <div className="p-3 bg-[#C6A66B]/15 text-[#C6A66B] rounded-xl border border-[#C6A66B]/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Incident Activity & Response Time */}
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Incident Frequency</h3>
              <p className="text-xs text-slate-400">Total volume logged vs. closed cases</p>
            </div>
            <span className="text-xs font-mono text-[#C6A66B]">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.daily_trends || []}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A66B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C6A66B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0C1527', borderColor: '#182E4F', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#C6A66B" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="resolved" stroke="#22C55E" fillOpacity={0.15} fill="#22C55E" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Distribution */}
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Verification Reliability Statistics</h3>
              <p className="text-xs text-slate-400">Agent 02 automated credibility breakdown</p>
            </div>
            <span className="text-xs font-mono text-[#C6A66B]">Telemetry</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.verification_stats || []}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0C1527', borderColor: '#182E4F', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#C6A66B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI-Powered Situation Report (SITREP) Document */}
      {sitrep && (
        <div className="bg-[#0C1527] border border-[#C6A66B]/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Sitrep Document Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#182E4F] pb-4">
            <div>
              <div className="text-[11px] font-mono font-bold text-[#C6A66B] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>OFFICIAL SITUATION REPORT (SITREP)</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 font-mono">{sitrep.report_id}</h2>
              <div className="text-xs text-slate-400">
                Timestamp: {new Date(sitrep.timestamp).toUTCString()} &bull; Classification: {sitrep.classification}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#C6A66B]/15 text-[#D4B77D] border border-[#C6A66B]/30 font-bold">
                MULTI-AGENT SYNTHESIS
              </span>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              1. Executive Operational Overview
            </h3>
            <p className="text-xs sm:text-sm text-white leading-relaxed bg-[#060B14] p-4 rounded-xl border border-[#182E4F]">
              {sitrep.executive_summary}
            </p>
          </div>

          {/* Highest Priority Emergencies */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 font-mono">
              2. Highest-Priority Emergencies Requiring Urgent Command Attention
            </h3>
            <div className="space-y-2">
              {sitrep.highest_priority_emergencies?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Hotspots */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              3. Geographic Threat Hotspots
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sitrep.geographic_hotspots?.map((hot, idx) => (
                <div key={idx} className="p-3 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{hot.name}</span>
                    <span className="font-mono text-[#C6A66B]">{hot.incident_count} events</span>
                  </div>
                  <div className="text-[11px] text-[#D4B77D]">{hot.threat_level}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Command Priorities */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              4. Recommended Command Priorities & Deployment Directives
            </h3>
            <div className="space-y-2">
              {sitrep.recommended_priorities?.map((p, idx) => (
                <div key={idx} className="p-3 bg-[#060B14] border border-[#C6A66B]/30 rounded-xl text-xs text-white flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#C6A66B]/20 text-[#C6A66B] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px] border border-[#C6A66B]/30">
                    {idx + 1}
                  </span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Disclaimer */}
          <div className="p-3 bg-[#060B14] border border-[#182E4F] rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C6A66B] flex-shrink-0 mt-0.5" />
            <span>{sitrep.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
