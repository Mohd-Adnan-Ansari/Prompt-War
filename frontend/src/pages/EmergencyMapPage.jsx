import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Layers,
  Search,
  Filter,
  AlertTriangle,
  Flame,
  Waves,
  Truck,
  Activity,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';
import { EmergencyMap } from '../components/map/EmergencyMap';
import { SeverityBadge, VerificationBadge } from '../components/common/Badges';
import { AssignResourceModal } from '../components/common/AssignResourceModal';

export function EmergencyMapPage() {
  const navigate = useNavigate();
  const { incidents, resources, refreshData } = useCrisis();

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [assignModalResource, setAssignModalResource] = useState(null);
  const [search, setSearch] = useState('');

  const filteredIncidents = incidents.filter((inc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inc.title?.toLowerCase().includes(q) ||
      inc.location_name?.toLowerCase().includes(q) ||
      inc.category?.toLowerCase().includes(q) ||
      inc.id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Assign Resource Modal */}
      <AssignResourceModal
        isOpen={Boolean(assignModalResource)}
        onClose={() => setAssignModalResource(null)}
        resource={assignModalResource}
        onAssigned={refreshData}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Live Emergency GIS Map</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              OpenStreetMap + Leaflet
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Geographic spatial intelligence tracking incidents, hospitals, fire stations, and rescue assets
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-3 px-3 py-1.5 bg-[#0C1527] border border-[#182E4F] rounded-xl text-slate-300">
            <span className="flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <strong className="text-white">{incidents.filter((i) => i.severity === 'Critical').length}</strong> Critical
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <strong className="text-white">{resources.filter((r) => r.status === 'Available').length}</strong> Available Fleet
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Incident Quick Selector Drawer + Large Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Incident Quick Selector Drawer */}
        <div className="bg-[#0C1527] border border-[#182E4F] rounded-2xl p-4 shadow-xl flex flex-col space-y-3 h-[600px] lg:h-[700px]">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Incident Radar List ({filteredIncidents.length})
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by title, sector..."
                className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-[#13213B] border-cyan-400 ring-1 ring-cyan-400/50'
                      : 'bg-[#060B14] border-[#182E4F] hover:border-cyan-400/40 hover:bg-[#101D36]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{inc.id}</span>
                    <SeverityBadge severity={inc.severity} />
                  </div>
                  <div className="font-bold text-white leading-snug line-clamp-2">
                    {inc.title}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{inc.location_name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#182E4F] text-[10px]">
                    <span className="text-slate-400">{inc.category}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/incidents/${inc.id}`);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                    >
                      View Report &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Interactive Map */}
        <div className="lg:col-span-3">
          <EmergencyMap
            incidents={filteredIncidents}
            resources={resources}
            height="700px"
            selectedIncident={selectedIncident}
            showFilters={true}
            onIncidentSelect={(inc) => setSelectedIncident(inc)}
            onAssignResource={(res) => setAssignModalResource(res)}
          />
        </div>
      </div>
    </div>
  );
}
