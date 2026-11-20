import React, { useState } from 'react';
import { X, Check, Truck, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useCrisis } from '../../context/CrisisContext';

export function AssignResourceModal({ isOpen, onClose, resource, onAssigned }) {
  const { incidents, addToast, refreshData } = useCrisis();
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !resource) return null;

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedIncidentId) {
      addToast('Please select a target emergency incident', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.assignResource(resource.id, selectedIncidentId);
      addToast(`Assigned ${resource.name} to ${selectedIncidentId}`, 'success');
      await refreshData();
      onAssigned && onAssigned();
      onClose();
    } catch (err) {
      addToast(`Assignment failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setLoading(true);
      await api.unassignResource(resource.id);
      addToast(`Unassigned ${resource.name} (returned to Available)`, 'success');
      await refreshData();
      onAssigned && onAssigned();
      onClose();
    } catch (err) {
      addToast(`Unassignment failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0C1527] border border-cyan-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#182E4F] bg-[#101D36]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Coordinate Resource Deployment</h3>
              <p className="text-xs text-slate-300">Simulation Dispatch Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#13213B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-4">
          <div className="p-3.5 bg-[#060B14] border border-[#182E4F] rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-white text-sm">{resource.name}</div>
            <div className="text-slate-300">
              <span className="text-cyan-300 font-semibold">Category:</span> {resource.category} |{' '}
              <span className="text-cyan-300 font-semibold">Current Status:</span>{' '}
              <span className={resource.status === 'Available' ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                {resource.status}
              </span>
            </div>
            <div className="text-slate-400">
              <span className="text-slate-300 font-medium">Station:</span> {resource.location_name}
            </div>
            {resource.assigned_incident_id && (
              <div className="text-cyan-300 font-semibold pt-1">
                Currently Assigned to: {resource.assigned_incident_id}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-2">
              Select Target Emergency Incident:
            </label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="">-- Choose an active incident --</option>
              {activeIncidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  [{inc.id}] {inc.title} ({inc.severity} - {inc.category})
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Simulation Safeguard:</strong> This prototype demonstration simulates tactical resource assignment. No live 911 dispatch will be triggered.
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#182E4F]">
            {resource.assigned_incident_id ? (
              <button
                type="button"
                onClick={handleUnassign}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 border border-red-500/40 hover:bg-red-500/15 transition"
              >
                Recall Asset (Unassign)
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#13213B] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedIncidentId}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-cyan-500/20"
              >
                {loading ? 'Updating...' : 'Assign to Incident'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
