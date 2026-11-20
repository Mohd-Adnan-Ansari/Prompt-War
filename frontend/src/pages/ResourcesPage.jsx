import React, { useState } from 'react';
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Waves,
  Shield,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Map,
  List
} from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';
import { api } from '../services/api';
import { AssignResourceModal } from '../components/common/AssignResourceModal';
import { EmergencyMap } from '../components/map/EmergencyMap';

export function ResourcesPage() {
  const { resources, incidents, refreshData, addToast } = useCrisis();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'map'
  const [selectedResourceForAssign, setSelectedResourceForAssign] = useState(null);

  const categories = [
    'All',
    'Ambulances',
    'Hospitals',
    'Fire stations',
    'Fire trucks',
    'Rescue teams',
    'Flood rescue boats',
    'Medical teams',
    'Emergency shelters',
    'Police units',
  ];

  const statuses = ['All', 'Available', 'Deployed', 'Busy', 'Offline'];

  const filteredResources = resources.filter((res) => {
    if (categoryFilter !== 'All' && res.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && res.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        res.name?.toLowerCase().includes(q) ||
        res.location_name?.toLowerCase().includes(q) ||
        res.category?.toLowerCase().includes(q) ||
        res.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.updateResource(id, { status: newStatus });
      addToast(`Resource status changed to ${newStatus}`, 'success');
      await refreshData();
    } catch (err) {
      addToast(`Failed to update resource: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Assign Modal */}
      <AssignResourceModal
        isOpen={Boolean(selectedResourceForAssign)}
        onClose={() => setSelectedResourceForAssign(null)}
        resource={selectedResourceForAssign}
        onAssigned={refreshData}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Emergency Resource Management</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              {filteredResources.length} Assets
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tactical asset tracking, readiness matrix, and simulated deployment coordination
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#0C1527] p-1 rounded-xl border border-[#182E4F]">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
                viewMode === 'table' ? 'bg-[#13213B] text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table Roster</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
                viewMode === 'map' ? 'bg-[#13213B] text-cyan-400 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prototype Disclaimer */}
      <div className="p-3 bg-[#0C1527] border border-cyan-500/30 rounded-xl text-xs text-slate-300 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0" />
        <span>
          <strong>Simulated Fleet:</strong> All emergency fleet and hospital telemetry is generated for the CrisisAI prototype demonstration and does not connect to live 911 dispatch networks.
        </span>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-[#0C1527] border border-[#182E4F] rounded-2xl shadow-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset name, ID, base station..."
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101D36] border-b border-[#182E4F] text-slate-300 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="px-4 py-3">Resource ID</th>
                  <th className="px-4 py-3">Name & Category</th>
                  <th className="px-4 py-3">Base Location</th>
                  <th className="px-4 py-3">Capacity & Contact</th>
                  <th className="px-4 py-3">Availability Status</th>
                  <th className="px-4 py-3">Assigned Incident</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182E4F] text-slate-200">
                {filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-[#13213B]/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {res.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{res.name}</div>
                      <div className="text-[11px] text-slate-400">{res.category}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      <div>{res.location_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {res.latitude}, {res.longitude}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      <div>{res.capacity}</div>
                      <div className="text-[11px] text-slate-400">{res.contact}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={res.status}
                        onChange={(e) => handleStatusUpdate(res.id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                          res.status === 'Available'
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : res.status === 'Deployed'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="Available" className="bg-[#0C1527] text-white">Available</option>
                        <option value="Deployed" className="bg-[#0C1527] text-white">Deployed</option>
                        <option value="Busy" className="bg-[#0C1527] text-white">Busy</option>
                        <option value="Offline" className="bg-[#0C1527] text-white">Offline</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {res.assigned_incident_id ? (
                        <span className="font-mono text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                          {res.assigned_incident_id}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedResourceForAssign(res)}
                        className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold rounded-lg text-xs transition border border-cyan-500/30"
                      >
                        Assign / Deploy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          <EmergencyMap
            incidents={incidents}
            resources={filteredResources}
            height="650px"
            onAssignResource={(r) => setSelectedResourceForAssign(r)}
          />
        </div>
      )}
    </div>
  );
}
