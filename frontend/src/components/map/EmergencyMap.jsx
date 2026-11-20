import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge, StatusBadge, VerificationBadge } from '../common/Badges';
import { Shield, Sparkles, Navigation, Layers, Flame, Waves, Car, Activity, Home, Truck, ShieldAlert } from 'lucide-react';

// Create custom pulsating SVG icons for Leaflet
function createIncidentIcon(severity = 'Medium', category = 'Other') {
  const colors = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#FACC15',
    Low: '#22C55E',
  };
  const color = colors[severity] || '#C6A66B';
  const isCritical = severity === 'Critical';

  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${
          isCritical
            ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.4; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #0C1527; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px ${color}80;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color};"></div>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function createResourceIcon(category, status) {
  let iconBg = '#0891B2'; // cyan/teal
  let symbol = 'H';

  if (category === 'Hospitals') {
    iconBg = '#0284C7';
    symbol = '🏥';
  } else if (category.includes('Fire')) {
    iconBg = '#DC2626';
    symbol = '🚒';
  } else if (category.includes('boat')) {
    iconBg = '#0891B2';
    symbol = '🚤';
  } else if (category === 'Ambulances') {
    iconBg = '#059669';
    symbol = '🚑';
  } else if (category.includes('shelter')) {
    iconBg = '#7C3AED';
    symbol = '⛺';
  } else if (category.includes('Police')) {
    iconBg = '#4F46E5';
    symbol = '🚓';
  } else {
    iconBg = '#D97706';
    symbol = '🛟';
  }

  const isAvailable = status === 'Available';
  const borderColor = isAvailable ? '#C6A66B' : '#64748B';

  return L.divIcon({
    className: 'custom-resource-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 24px; height: 24px; border-radius: 6px; background: ${iconBg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">
          ${symbol}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Controller to smoothly pan to coordinates when triggered
function MapViewController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export function EmergencyMap({
  incidents = [],
  resources = [],
  height = '500px',
  selectedIncident = null,
  showFilters = true,
  onIncidentSelect,
  onAssignResource,
}) {
  const navigate = useNavigate();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [activeSeverityFilter, setActiveSeverityFilter] = useState('All');
  const [showResources, setShowResources] = useState(true);
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState('All');

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (activeCategoryFilter !== 'All' && inc.category !== activeCategoryFilter) return false;
    if (activeSeverityFilter !== 'All' && inc.severity !== activeSeverityFilter) return false;
    return true;
  });

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    if (!showResources) return false;
    if (resourceCategoryFilter !== 'All' && res.category !== resourceCategoryFilter) return false;
    return true;
  });

  const defaultCenter = selectedIncident
    ? [selectedIncident.latitude, selectedIncident.longitude]
    : [37.7749, -122.4194];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#182E4F] shadow-2xl bg-[#060B14]">
      {/* Map Filter Controls Bar */}
      {showFilters && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl glass-panel pointer-events-auto">
          {/* Incidents Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#C6A66B]" />
              Incidents:
            </span>
            {['All', 'Critical', 'High', 'Flood', 'Fire', 'Accident', 'Earthquake'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (['Critical', 'High'].includes(tag)) {
                    setActiveSeverityFilter(tag);
                    setActiveCategoryFilter('All');
                  } else if (tag === 'All') {
                    setActiveSeverityFilter('All');
                    setActiveCategoryFilter('All');
                  } else {
                    setActiveCategoryFilter(tag);
                    setActiveSeverityFilter('All');
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  (activeCategoryFilter === tag || activeSeverityFilter === tag) ||
                  (tag === 'All' && activeCategoryFilter === 'All' && activeSeverityFilter === 'All')
                    ? 'bg-[#C6A66B] text-[#48151D] font-bold shadow-md shadow-[#C6A66B]/25'
                    : 'bg-[#101D36] text-slate-200 hover:text-white border border-[#182E4F] hover:border-[#C6A66B]/50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Resources Toggle & Category Filter */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowResources(!showResources)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition border flex items-center gap-1.5 ${
                showResources
                  ? 'bg-[#C6A66B]/20 text-[#D4B77D] border-[#C6A66B]/40'
                  : 'bg-[#101D36] text-slate-400 border-[#182E4F]'
              }`}
            >
              <Truck className="w-3 h-3 text-[#C6A66B]" />
              <span>Resources ({filteredResources.length})</span>
            </button>

            {showResources && (
              <select
                value={resourceCategoryFilter}
                onChange={(e) => setResourceCategoryFilter(e.target.value)}
                className="bg-[#101D36] border border-[#182E4F] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#C6A66B]"
              >
                <option value="All">All Assets</option>
                <option value="Hospitals">Hospitals</option>
                <option value="Fire stations">Fire Stations</option>
                <option value="Fire trucks">Fire Trucks</option>
                <option value="Flood rescue boats">Rescue Boats</option>
                <option value="Ambulances">Ambulances</option>
                <option value="Emergency shelters">Shelters</option>
                <option value="Police units">Police Units</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height, width: '100%' }}
      >
        <MapViewController center={defaultCenter} zoom={selectedIncident ? 14 : 13} />

        {/* Dark style tile layer (OpenStreetMap + dark CSS filters) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Incident Markers */}
        {filteredIncidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createIncidentIcon(inc.severity, inc.category)}
            eventHandlers={{
              click: () => onIncidentSelect && onIncidentSelect(inc),
            }}
          >
            <Popup className="emergency-popup">
              <div className="p-1 space-y-2 min-w-[220px]">
                <div className="flex items-center justify-between gap-2 border-b border-[#182E4F] pb-1.5">
                  <span className="font-mono text-xs font-bold text-[#C6A66B]">{inc.id}</span>
                  <SeverityBadge severity={inc.severity} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-snug">{inc.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">{inc.location_name}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-200 bg-[#060B14] p-1.5 rounded border border-[#182E4F]">
                  <span>Category: <strong className="text-white">{inc.category}</strong></span>
                  <span>Risk: <strong className="text-red-400">{inc.risk_score}/100</strong></span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => navigate(`/incidents/${inc.id}`)}
                    className="w-full text-center px-2.5 py-1.5 bg-[#C6A66B] hover:bg-[#D4B77D] text-[#48151D] rounded text-xs font-bold transition shadow-md shadow-[#C6A66B]/20"
                  >
                    View Agent Analysis &rarr;
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Resource Markers */}
        {filteredResources.map((res) => (
          <Marker
            key={res.id}
            position={[res.latitude, res.longitude]}
            icon={createResourceIcon(res.category, res.status)}
          >
            <Popup className="resource-popup">
              <div className="p-1 space-y-2 min-w-[210px]">
                <div className="flex items-center justify-between border-b border-[#182E4F] pb-1.5">
                  <span className="font-mono text-xs text-[#D4B77D]">{res.id}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      res.status === 'Available'
                        ? 'bg-[#C6A66B]/20 text-[#D4B77D] border border-[#C6A66B]/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{res.name}</h4>
                  <p className="text-[11px] text-slate-300">{res.category} &bull; {res.location_name}</p>
                  <p className="text-[11px] text-slate-300 mt-1">Cap: {res.capacity}</p>
                </div>
                {res.assigned_incident_id && (
                  <div className="text-[11px] text-[#D4B77D] bg-[#48151D]/30 p-1 rounded border border-[#C6A66B]/30">
                    Assigned: {res.assigned_incident_id}
                  </div>
                )}
                <button
                  onClick={() => onAssignResource && onAssignResource(res)}
                  className="w-full text-center px-2 py-1 bg-[#101D36] hover:bg-[#13213B] text-white border border-[#182E4F] hover:border-[#C6A66B] rounded text-xs font-semibold transition"
                >
                  Manage Deployment
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] p-2.5 rounded-xl glass-panel text-[11px] space-y-1.5 hidden sm:block">
        <div className="font-bold text-white uppercase tracking-wider text-[10px] mb-1">
          Tactical Map Legend
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-slate-200">Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-200">High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span className="text-slate-200">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-200">Low</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-[#182E4F] text-slate-300">
          <span>🏥 Hospital</span>
          <span>🚒 Fire</span>
          <span>🚤 Boat</span>
          <span>🚑 Ambulance</span>
        </div>
      </div>
    </div>
  );
}
