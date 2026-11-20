import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  LayoutGrid,
  List,
  MapPin,
  Clock,
  ArrowRight,
  Bot,
  RefreshCw,
  Waves,
  ShieldCheck,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge, VerificationBadge, RiskScoreGauge } from '../components/common/Badges';
import { ReportIncidentModal } from '../components/common/ReportIncidentModal';

export function IncidentsPage() {
  const navigate = useNavigate();
  const { incidents, refreshData, openAssistantWithIncident, addToast, runFloodDemo } = useCrisis();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);

  const filteredIncidents = incidents.filter((inc) => {
    if (categoryFilter !== 'All' && inc.category !== categoryFilter) return false;
    if (severityFilter !== 'All' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
    if (verificationFilter !== 'All' && inc.verification_status !== verificationFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = inc.title?.toLowerCase().includes(q);
      const matchDesc = inc.description?.toLowerCase().includes(q);
      const matchLoc = inc.location_name?.toLowerCase().includes(q);
      const matchId = inc.id?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchId) return false;
    }
    return true;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateIncident(id, { status: newStatus });
      addToast(`Updated ${id} status to ${newStatus}`, 'success');
      await refreshData();
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  const handleTriggerAnalysis = async (e, id) => {
    e.stopPropagation();
    try {
      setAnalyzingId(id);
      addToast(`Orchestrating 6 AI Agents on ${id}...`, 'info');
      await api.analyzeIncident(id);
      addToast(`Multi-agent analysis completed for ${id}!`, 'success');
      await refreshData();
    } catch (err) {
      addToast(`Analysis error: ${err.message}`, 'error');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onCreated={() => {
          refreshData();
        }}
      />

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Incident Management</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#48151D] text-[#C6A66B] border border-[#C6A66B]/40 font-bold">
              {filteredIncidents.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time emergency incident triage, multi-agent classification, and status tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Flood Demo Workflow: Secondary button */}
          <button
            onClick={() => runFloodDemo()}
            className="px-3.5 py-2 btn-secondary rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Waves className="w-3.5 h-3.5 text-[#48151D]" />
            <span>Flood Demo Workflow</span>
          </button>
          {/* Submit Emergency Report: CTA button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2.5 btn-cta rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-[#48151D]" />
            <span>Submit Emergency Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#0C1527] border border-[#182E4F] rounded-2xl shadow-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, description, or location..."
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C6A66B] focus:ring-1 focus:ring-[#C6A66B]"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C6A66B] focus:ring-1 focus:ring-[#C6A66B]"
            >
              <option value="All">All Categories</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Accident">Accident</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Landslide">Landslide</option>
              <option value="Medical">Medical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C6A66B] focus:ring-1 focus:ring-[#C6A66B]"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#182E4F] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#060B14] border border-[#182E4F] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#C6A66B]"
              >
                <option value="All">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Verified">Verified</option>
                <option value="Response in Progress">Response in Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Verification */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Verification:</span>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="bg-[#060B14] border border-[#182E4F] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#C6A66B]"
              >
                <option value="All">All Verification</option>
                <option value="Verified">Verified</option>
                <option value="Needs Review">Needs Review</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-lg border border-[#182E4F]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'table' ? 'bg-[#48151D] text-[#C6A66B] border border-[#C6A66B]/50' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'cards' ? 'bg-[#48151D] text-[#C6A66B] border border-[#C6A66B]/50' : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Incidents Table View */}
      {viewMode === 'table' && (
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101D36] border-b border-[#182E4F] text-slate-300 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Severity & Risk</th>
                  <th className="px-4 py-3">Location & Affected</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182E4F] text-slate-200">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No incidents match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      className="hover:bg-[#13213B]/70 cursor-pointer transition"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#C6A66B] whitespace-nowrap">
                        {inc.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{inc.title}</div>
                        <div className="text-[11px] text-slate-400">{inc.category}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={inc.severity} />
                          <span className="font-mono text-red-400 font-bold">
                            {Math.round(inc.risk_score || 0)}/100
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="truncate max-w-[200px] text-slate-200">{inc.location_name}</div>
                        <div className="text-[11px] text-slate-400">~{inc.people_affected} people</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <VerificationBadge status={inc.verification_status} score={inc.confidence_score} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inc.status}
                          onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                          className="bg-[#060B14] border border-[#182E4F] rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-[#C6A66B]"
                        >
                          <option value="Reported">Reported</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Verified">Verified</option>
                          <option value="Response in Progress">Response in Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Re-run button: Icon button */}
                          <button
                            onClick={(e) => handleTriggerAnalysis(e, inc.id)}
                            disabled={analyzingId === inc.id}
                            className="p-1.5 rounded-lg btn-icon transition"
                            title="Re-run 6 AI Agents"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${analyzingId === inc.id ? 'animate-spin' : ''}`} />
                          </button>
                          {/* Assistant button: Icon button */}
                          <button
                            onClick={() => openAssistantWithIncident(inc)}
                            className="p-1.5 rounded-lg btn-icon transition"
                            title="Analyze in Assistant"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>
                          {/* Details button: Primary button */}
                          <button
                            onClick={() => navigate(`/incidents/${inc.id}`)}
                            className="px-2.5 py-1 text-xs btn-primary rounded-lg transition"
                          >
                            Details &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incidents Card Grid View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => navigate(`/incidents/${inc.id}`)}
              className="bg-[#0C1527] border border-[#182E4F] hover:border-[#C6A66B]/60 rounded-2xl p-5 shadow-xl transition cursor-pointer flex flex-col justify-between space-y-4 group hover:shadow-[#C6A66B]/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#C6A66B]">{inc.id}</span>
                  <SeverityBadge severity={inc.severity} />
                </div>

                {inc.image_url && (
                  <div className="h-36 w-full rounded-xl overflow-hidden border border-[#182E4F] bg-black">
                    <img
                      src={inc.image_url}
                      alt={inc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#D4B77D] transition line-clamp-2">
                    {inc.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{inc.description}</p>
                </div>

                <div className="p-2.5 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-200 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{inc.location_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Est. Impact: ~{inc.people_affected} people</span>
                    <span className="font-mono text-red-400 font-bold">
                      Risk {Math.round(inc.risk_score || 0)}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#182E4F] flex items-center justify-between text-xs">
                <VerificationBadge status={inc.verification_status} score={inc.confidence_score} />
                <span className="text-[#C6A66B] font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C6A66B]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
