import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Bot,
  MapPin,
  Calendar,
  Users,
  ShieldAlert,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  Info,
  Flame,
  Waves,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useCrisis } from '../context/CrisisContext';
import { SeverityBadge, StatusBadge, VerificationBadge, RiskScoreGauge } from '../components/common/Badges';
import { EmergencyMap } from '../components/map/EmergencyMap';
import { AgentPipelineVisualizer } from '../components/agents/AgentPipelineVisualizer';
import { AssignResourceModal } from '../components/common/AssignResourceModal';

export function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resources, refreshData, openAssistantWithIncident, addToast } = useCrisis();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'action_plan' | 'resources' | 'map' | 'raw_json'
  const [assignModalResource, setAssignModalResource] = useState(null);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const data = await api.getIncident(id);
      setIncident(data);
    } catch (err) {
      addToast(`Error loading incident: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      addToast(`Re-running 6 AI Agents on ${id}...`, 'info');
      await api.analyzeIncident(id);
      addToast(`Multi-agent pipeline completed successfully!`, 'success');
      await fetchIncident();
      await refreshData();
    } catch (err) {
      addToast(`Pipeline failed: ${err.message}`, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateIncident(id, { status: newStatus });
      addToast(`Status updated to ${newStatus}`, 'success');
      await fetchIncident();
      await refreshData();
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  if (loading && !incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-3 border-[#C6A66B] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs text-slate-400">Loading incident telemetry from database...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-base text-red-400 font-bold">Incident Not Found</div>
        <button
          onClick={() => navigate('/incidents')}
          className="px-4 py-2 bg-[#0C1527] text-white border border-[#182E4F] rounded-xl text-xs hover:border-[#C6A66B]"
        >
          &larr; Back to Incidents
        </button>
      </div>
    );
  }

  const analysis = incident.ai_analysis || {};
  const actionPlan = incident.action_plan || analysis.action_planning?.action_plan || {};
  const repCollection = analysis.report_collection || {};
  const verification = analysis.verification || {};
  const classification = analysis.classification || {};
  const severity = analysis.severity || {};
  const resourceCoord = analysis.resource_coordination || {};
  const recommendedResources = incident.recommended_resources || resourceCoord.recommended_resources || [];

  return (
    <div className="space-y-6">
      {/* Assign Resource Modal */}
      <AssignResourceModal
        isOpen={Boolean(assignModalResource)}
        onClose={() => setAssignModalResource(null)}
        resource={assignModalResource}
        onAssigned={fetchIncident}
      />

      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate('/incidents')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#D4B77D] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incident Registry</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#0C1527] border border-[#182E4F] rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400">Status:</span>
            <select
              value={incident.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-transparent font-semibold text-[#C6A66B] focus:outline-none cursor-pointer"
            >
              <option value="Reported" className="bg-[#0C1527] text-white">Reported</option>
              <option value="Under Investigation" className="bg-[#0C1527] text-white">Under Investigation</option>
              <option value="Verified" className="bg-[#0C1527] text-white">Verified</option>
              <option value="Response in Progress" className="bg-[#0C1527] text-white">Response in Progress</option>
              <option value="Resolved" className="bg-[#0C1527] text-white">Resolved</option>
            </select>
          </div>

          {/* Trigger Re-Analysis */}
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Agents Processing...' : 'Re-run AI Analysis'}</span>
          </button>

          {/* Assistant Chat */}
          <button
            onClick={() => openAssistantWithIncident(incident)}
            className="btn-outline px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Assistant</span>
          </button>
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-[#C6A66B] bg-[#C6A66B]/15 px-2.5 py-1 rounded-lg border border-[#C6A66B]/30">
                {incident.id}
              </span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              <VerificationBadge status={incident.verification_status} score={incident.confidence_score} />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">{incident.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">{incident.location_name}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">~{incident.people_affected} People Impacted</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">Logged {new Date(incident.created_at).toLocaleString()}</span>
              </span>
            </div>
          </div>

          <RiskScoreGauge score={incident.risk_score} />
        </div>

        {/* Description & Photo Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#182E4F]">
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs text-slate-200 leading-relaxed bg-[#060B14] p-4 rounded-xl border border-[#182E4F]">
              <div className="text-[11px] font-bold text-[#C6A66B] uppercase tracking-wider mb-1 font-mono">
                Field Dispatch Description
              </div>
              {incident.description}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#060B14] border border-[#182E4F] rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Impact Radius</div>
                <div className="text-white font-semibold">{incident.affected_area || 'Local zone'}</div>
              </div>
              <div className="p-3 bg-[#060B14] border border-[#182E4F] rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Primary Hazards</div>
                <div className="text-red-300 font-semibold truncate">{incident.hazards || 'Under assessment'}</div>
              </div>
            </div>
          </div>

          {/* Photo preview */}
          <div>
            {incident.image_url ? (
              <div className="h-full min-h-[140px] rounded-xl overflow-hidden border border-[#182E4F] bg-black">
                <img
                  src={incident.image_url}
                  alt={incident.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-full min-h-[140px] rounded-xl border border-dashed border-[#182E4F] bg-[#060B14] flex items-center justify-center text-xs text-slate-500">
                No photographic evidence uploaded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#182E4F] text-xs font-semibold space-x-1">
        {[
          { key: 'pipeline', label: 'Multi-Agent Breakdown (6 Agents)' },
          { key: 'action_plan', label: 'Tactical Action Plan' },
          { key: 'resources', label: `Recommended Resources (${recommendedResources.length})` },
          { key: 'map', label: 'Tactical Scene Map' },
          { key: 'raw_json', label: 'Raw AI JSON Telemetry' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-t-xl transition ${
              activeTab === tab.key
                ? 'bg-[#0C1527] border-t-2 border-t-[#C6A66B] border-x border-[#182E4F] text-[#C6A66B] font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#0C1527]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Multi-Agent Breakdown (Detailed Agent Inspector) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <AgentPipelineVisualizer steps={analysis.step_results || []} isProcessing={analyzing} />

          {/* 6 Agent In-Depth Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Agent 1: Report Collection */}
            <div className="p-5 bg-[#0C1527] border border-[#182E4F] rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182E4F] pb-2">
                <span className="font-mono text-xs font-bold text-[#C6A66B]">AGENT 01 &bull; REPORT COLLECTION</span>
                <span className="text-[11px] font-mono text-[#D4B77D] font-semibold">
                  Completeness: {repCollection.completeness_score || 90}%
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div><strong className="text-white">Channel:</strong> {repCollection.source_channel || 'Citizen Mobile Web App'}</div>
                <div><strong className="text-white">GPS Verified:</strong> {incident.latitude}, {incident.longitude}</div>
                <div><strong className="text-white">Evidence:</strong> {incident.image_url ? 'Photographic payload attached' : 'None'}</div>
              </div>
            </div>

            {/* Agent 2: Verification */}
            <div className="p-5 bg-[#0C1527] border border-[#182E4F] rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182E4F] pb-2">
                <span className="font-mono text-xs font-bold text-[#C6A66B]">AGENT 02 &bull; VERIFICATION</span>
                <span className="text-[11px] font-mono text-[#D4B77D] font-bold">
                  Score: {verification.confidence_score || incident.confidence_score}%
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div>
                  <strong className="text-white">Status:</strong>{' '}
                  <span className="text-[#D4B77D] font-semibold">{incident.verification_status}</span>
                </div>
                <div className="text-slate-300 leading-relaxed">
                  <strong className="text-white">Rationale:</strong> {verification.verification_reason || incident.verification_reason}
                </div>
                {verification.duplicate_incidents && verification.duplicate_incidents.length > 0 && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px]">
                    ⚠️ Potential duplicate of: {verification.duplicate_incidents[0]?.id} (
                    {verification.duplicate_incidents[0]?.similarity_score}% match)
                  </div>
                )}
              </div>
            </div>

            {/* Agent 3: Classification */}
            <div className="p-5 bg-[#0C1527] border border-[#182E4F] rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182E4F] pb-2">
                <span className="font-mono text-xs font-bold text-yellow-400">AGENT 03 &bull; CLASSIFICATION</span>
                <span className="text-[11px] font-mono text-yellow-400">
                  Confidence: {classification.category_confidence || 88}%
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div><strong className="text-white">Category:</strong> {classification.category || incident.category}</div>
                <div>
                  <strong className="text-white">Hazards:</strong>{' '}
                  {(classification.primary_hazards || [incident.hazards]).join(', ')}
                </div>
                <div>
                  <strong className="text-white">Impact Sphere:</strong> {classification.affected_area || incident.affected_area} (~{classification.estimated_people_affected || incident.people_affected} civilians)
                </div>
              </div>
            </div>

            {/* Agent 4: Severity */}
            <div className="p-5 bg-[#0C1527] border border-[#182E4F] rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#182E4F] pb-2">
                <span className="font-mono text-xs font-bold text-red-400">AGENT 04 &bull; SEVERITY ASSESSMENT</span>
                <span className="text-[11px] font-mono text-red-400 font-bold">
                  Risk: {severity.risk_score || incident.risk_score}/100
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div><strong className="text-white">Severity Level:</strong> <span className="font-bold text-red-400">{severity.severity_level || incident.severity}</span></div>
                <div><strong className="text-white">Urgency:</strong> {severity.recommended_urgency || 'Immediate Code Red'}</div>
                <div className="text-slate-300 leading-relaxed">
                  <strong className="text-white">Risk Factor:</strong> {severity.severity_reason || 'Severe threat to life safety with acute escalation vector.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Action Plan */}
      {activeTab === 'action_plan' && (
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#182E4F] pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tactical Operational Playbook</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#C6A66B]/20 text-[#D4B77D] border border-[#C6A66B]/30">
                  Agent 06 Synthesis
                </span>
              </h3>
              <p className="text-xs text-slate-400">Prioritized multi-phase emergency response directives</p>
            </div>

            <div className="text-xs font-mono px-3 py-1 bg-[#C6A66B]/10 text-[#D4B77D] border border-[#C6A66B]/30 rounded-lg">
              Pending Human Incident Commander Sign-Off
            </div>
          </div>

          {/* Incident Summary */}
          <div className="p-4 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs space-y-1.5">
            <div className="font-mono font-bold text-[#C6A66B] uppercase text-[11px]">Executive Summary</div>
            <p className="text-white leading-relaxed">
              {actionPlan.incident_summary ||
                'Incident active with high life-safety risk. Immediate perimeter containment, civilian evacuation, and specialized response staging in effect.'}
            </p>
          </div>

          {/* Immediate Priorities */}
          {actionPlan.immediate_priorities && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Immediate Command Priorities:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {actionPlan.immediate_priorities.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#060B14] border border-[#C6A66B]/30 rounded-xl text-xs flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#C6A66B]/20 text-[#C6A66B] font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px] border border-[#C6A66B]/30">
                      {idx + 1}
                    </span>
                    <span className="text-white leading-snug">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phased Action Table */}
          {actionPlan.recommended_response_actions && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Phased Response Directive Checklist:
              </h4>
              <div className="space-y-2.5">
                {actionPlan.recommended_response_actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#060B14] border border-[#182E4F] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#C6A66B]">{act.phase}</span>
                        <span className="text-slate-500">&bull;</span>
                        <span className="text-[#D4B77D] font-semibold">{act.assigned_unit}</span>
                      </div>
                      <div className="text-white">{act.action}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        act.priority === 'Critical'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}
                    >
                      {act.priority || 'High'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks & Unverified Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-red-400 uppercase font-mono text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Operational Risks</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {(actionPlan.potential_risks || ['Rapid hazard escalation', 'Route blockage']).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-400 uppercase font-mono text-[11px] flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>Pending Verification Telemetry</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {(actionPlan.unverified_information || ['Exact trapped resident count', 'Basement power grid status']).map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Advisory Disclaimer */}
          <div className="p-3 bg-[#060B14] border border-[#182E4F] rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#C6A66B] flex-shrink-0 mt-0.5" />
            <span>
              {actionPlan.ai_disclaimer ||
                'CRISISAI ADVISORY NOTICE: All operational directives and resource suggestions are AI-generated decision aids. Final tactical deployment must be explicitly validated and authorized by human Incident Commanders.'}
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Recommended Resources */}
      {activeTab === 'resources' && (
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#182E4F] pb-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Recommended Response Assets & Facilities
              </h3>
              <p className="text-xs text-slate-400">
                Proximity and category-matched emergency resources recommended by Agent 05
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedResources.map((res, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#060B14] border border-[#182E4F] hover:border-[#C6A66B]/60 rounded-xl text-xs space-y-2.5 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{res.resource_name}</span>
                  <span className="font-mono text-[#C6A66B] font-bold bg-[#C6A66B]/10 px-2 py-0.5 rounded border border-[#C6A66B]/30">
                    {res.distance_km} km away
                  </span>
                </div>

                <div className="text-slate-400">
                  <span className="text-slate-200 font-semibold">{res.category}</span> &bull; Status:{' '}
                  <span className={res.status === 'Available' ? 'text-[#C6A66B] font-bold' : 'text-purple-400'}>
                    {res.status}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed italic bg-[#0C1527] p-2 rounded-lg border border-[#182E4F]">
                  &ldquo;{res.rationale}&rdquo;
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-[#182E4F]">
                  <span className="text-[11px] text-[#C6A66B] font-mono">
                    Match Score: {res.match_score}%
                  </span>
                  <button
                    onClick={() => {
                      const matched = resources.find((r) => r.id === res.resource_id);
                      if (matched) setAssignModalResource(matched);
                      else addToast('Resource selected for staging', 'info');
                    }}
                    className="btn-cta px-3 py-1 rounded-lg text-xs font-bold transition"
                  >
                    Deploy / Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Tactical Scene Map */}
      {activeTab === 'map' && (
        <div className="space-y-3">
          <EmergencyMap
            incidents={[incident]}
            resources={resources}
            height="500px"
            selectedIncident={incident}
            showFilters={false}
            onAssignResource={(r) => setAssignModalResource(r)}
          />
        </div>
      )}

      {/* Tab 5: Raw AI JSON Telemetry */}
      {activeTab === 'raw_json' && (
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-6 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white font-mono">Raw Structured Multi-Agent JSON</h3>
          <pre className="bg-[#060B14] border border-[#182E4F] p-4 rounded-xl text-[#D4B77D] font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
            {JSON.stringify(incident, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
