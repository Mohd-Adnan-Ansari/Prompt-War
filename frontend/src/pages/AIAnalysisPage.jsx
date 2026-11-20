import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Sparkles,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Truck,
  CheckSquare,
  Clock,
  Activity,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  Terminal,
  Copy
} from 'lucide-react';
import { api } from '../services/api';
import { useCrisis } from '../context/CrisisContext';
import { AgentPipelineVisualizer } from '../components/agents/AgentPipelineVisualizer';
import { SeverityBadge, VerificationBadge } from '../components/common/Badges';

export function AIAnalysisPage() {
  const navigate = useNavigate();
  const { incidents, addToast } = useCrisis();

  const [agentStatuses, setAgentStatuses] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0]?.id || '');
  const [logFilter, setLogFilter] = useState('All');

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      const [statuses, logs] = await Promise.all([
        api.getAgentsStatus(),
        api.getAgentLogs(60),
      ]);
      setAgentStatuses(statuses);
      setAgentLogs(logs);
    } catch (err) {
      addToast(`Error fetching agent telemetry: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const filteredLogs = agentLogs.filter((l) => {
    if (logFilter === 'All') return true;
    return l.agent_id === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>AI Multi-Agent Analysis Centre</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              6 Neural Agents
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisory command view for agent pipeline orchestration, telemetry logs, and explainable models
          </p>
        </div>

        <button
          onClick={fetchAgentData}
          className="px-3 py-1.5 bg-[#101D36] hover:bg-[#13213B] text-white border border-[#182E4F] hover:border-cyan-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Individual Agent Cards (Status & Latency) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentStatuses.map((agent, idx) => (
          <div
            key={agent.agent_id}
            className="p-4 bg-[#0C1527] border border-[#182E4F] rounded-xl space-y-2.5 shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                AGENT 0{idx + 1}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                {agent.status}
              </span>
            </div>

            <div className="font-bold text-white text-sm">{agent.agent_name}</div>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{agent.role}</p>

            <div className="pt-2 border-t border-[#182E4F] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Processed: <strong className="text-white">{agent.total_processed}</strong></span>
              <span className="text-cyan-400">Avg Latency: <strong className="text-cyan-300">{agent.avg_latency_ms}ms</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Visualizer for Selected Incident */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Multi-Agent Inspection:</span>
          </h2>
          <select
            value={selectedIncident?.id}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-[#0C1527] border border-[#182E4F] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                [{inc.id}] {inc.title} ({inc.category})
              </option>
            ))}
          </select>
        </div>

        {selectedIncident && (
          <AgentPipelineVisualizer
            steps={selectedIncident.ai_analysis?.step_results || []}
          />
        )}
      </div>

      {/* Real-time Agent Execution Logs Stream */}
      <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182E4F] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Agent Execution Stream</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredLogs.length} events logged)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Agent:</span>
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="bg-[#060B14] border border-[#182E4F] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Agents</option>
              <option value="report_collection">Report Collection</option>
              <option value="verification">Verification</option>
              <option value="classification">Classification</option>
              <option value="severity">Severity Assessment</option>
              <option value="resource_coordination">Resource Coordination</option>
              <option value="action_planning">Action Planning</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 font-mono text-xs">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[#060B14] border border-[#182E4F] rounded-xl space-y-1 hover:border-cyan-400 transition"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">[{log.agent_name}]</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-cyan-200 font-semibold">{log.incident_id}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-cyan-300">{log.execution_time_ms}ms</span>
                  <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="text-slate-300 text-[11px] truncate">{log.input_summary}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
