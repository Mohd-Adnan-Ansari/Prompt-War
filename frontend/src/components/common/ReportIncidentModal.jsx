import React, { useState } from 'react';
import { X, Upload, Sparkles, MapPin, AlertTriangle, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useCrisis } from '../../context/CrisisContext';

const PRESETS = [
  {
    label: '🌊 Urban Flash Flood',
    category: 'Flood',
    title: 'Flash Flood Inundation & Trapped Civilians on 14th Ave',
    description: 'Rapidly rising flood waters measuring 1.3 meters following intense storm. Multiple vehicles submerged and water entering residential ground floors. Evacuation boats urgently requested.',
    location_name: 'Riverside Lowland Basin, 14th Avenue',
    latitude: 37.7695,
    longitude: -122.4110,
    people_affected: 60,
    hazards: 'Rising water, submerged electrical mains, trapped residents',
    image_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🔥 High-Rise Structure Fire',
    category: 'Fire',
    title: 'Commercial Office Tower 4th Floor Fire',
    description: 'Heavy smoke and active flames venting from 4th floor windows. Automated sprinklers failed. Rapid spread toward neighboring multi-family dwelling.',
    location_name: 'Metro Center Plaza, 220 5th Street',
    latitude: 37.7845,
    longitude: -122.4040,
    people_affected: 45,
    hazards: 'Extreme radiant heat, dense toxic smoke, structural weakness',
    image_url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '💥 Highway Multi-Car Pileup',
    category: 'Accident',
    title: 'Overturned Fuel Tanker & 4-Car Collision',
    description: 'Tractor trailer carrying diesel fuel overturned across Interstate 880 lanes with 3 passenger sedans entangled. Heavy diesel spill and multiple trapped occupants.',
    location_name: 'Interstate 880 Westbound at Exit 9',
    latitude: 37.7630,
    longitude: -122.3950,
    people_affected: 12,
    hazards: 'Flammable fuel vapor, trapped motorists, highway gridlock',
    image_url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🏚️ Earthquake Structural Failure',
    category: 'Earthquake',
    title: 'Post-Seismic Masonry Collapse & Gas Leak',
    description: 'Major facade shear fracture in pre-1980 apartment block. Strong smell of natural gas and street water main rupture.',
    location_name: 'Mission Cultural District, 20th & Valencia',
    latitude: 37.7580,
    longitude: -122.4215,
    people_affected: 90,
    hazards: 'Gas explosion risk, structural aftershock vulnerability',
    image_url: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80',
  },
];

export function ReportIncidentModal({ isOpen, onClose, onCreated }) {
  const { addToast } = useCrisis();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Flood',
    description: '',
    location_name: '',
    latitude: 37.7749,
    longitude: -122.4194,
    image_url: '',
    people_affected: 10,
    hazards: '',
  });
  const [triggerAi, setTriggerAi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setFormData({
      title: preset.title,
      category: preset.category,
      description: preset.description,
      location_name: preset.location_name,
      latitude: preset.latitude,
      longitude: preset.longitude,
      image_url: preset.image_url,
      people_affected: preset.people_affected,
      hazards: preset.hazards,
    });
    addToast(`Loaded preset scenario: ${preset.label}`, 'info');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const res = await api.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: res.url }));
      addToast('Image uploaded successfully', 'success');
    } catch (err) {
      addToast(`Image upload failed: ${err.message}`, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location_name) {
      addToast('Please complete title, description, and location', 'error');
      return;
    }

    try {
      setLoading(true);
      addToast(
        triggerAi
          ? 'Submitting incident & orchestrating 6 AI agents...'
          : 'Submitting incident report...',
        'info'
      );
      const created = await api.createIncident(
        {
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          people_affected: parseInt(formData.people_affected) || 0,
        },
        triggerAi
      );
      addToast(`Incident ${created.id} logged successfully!`, 'success');
      onCreated && onCreated(created);
      onClose();
    } catch (err) {
      addToast(`Submission failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0C1527] border border-[#C6A66B]/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#182E4F] bg-[#101D36]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#C6A66B]/15 text-[#C6A66B] rounded-xl border border-[#C6A66B]/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Submit Emergency Report</h3>
              <p className="text-xs text-slate-300">Ingest new disaster event into Multi-Agent Command Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#13213B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-4 pb-2 border-b border-[#182E4F] bg-[#060B14]/60">
          <div className="text-[11px] font-bold text-[#D4B77D] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#C6A66B]" />
            1-Click Test Scenarios (Demo Presets):
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#13213B] border border-[#182E4F] text-slate-200 hover:text-[#D4B77D] hover:border-[#C6A66B] hover:bg-[#1A2D50] transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-white mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Flash Flood Inundation & Trapped Civilians"
                className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C6A66B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Disaster Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A66B]"
              >
                <option value="Flood">Flood</option>
                <option value="Fire">Fire</option>
                <option value="Accident">Accident</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Landslide">Landslide</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide exact observations: water depth, smoke color, trapped individuals, collapsed elements..."
              className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C6A66B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Location Name *
              </label>
              <input
                type="text"
                required
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                placeholder="e.g. Riverside District, Sector 4"
                className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#C6A66B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Latitude Coordinates
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A66B] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Longitude Coordinates
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A66B] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Est. People Affected
              </label>
              <input
                type="number"
                min="0"
                value={formData.people_affected}
                onChange={(e) => setFormData({ ...formData, people_affected: e.target.value })}
                className="w-full bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A66B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white mb-1">
                Photographic Evidence (URL or Upload)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://... or upload"
                  className="flex-1 bg-[#060B14] border border-[#182E4F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A66B] text-xs truncate"
                />
                <label className="px-3 py-2 bg-[#13213B] hover:bg-[#1A2D50] text-[#D4B77D] rounded-xl cursor-pointer flex items-center gap-1 text-xs border border-[#182E4F] transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? '...' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* AI Trigger Option */}
          <div className="p-3.5 bg-[#48151D]/20 border border-[#C6A66B]/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C6A66B] flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#D4B77D]">Multi-Agent AI Pipeline Auto-Execution</div>
                <div className="text-[11px] text-slate-300">
                  Runs Collection &rarr; Verification &rarr; Classification &rarr; Severity &rarr; Resources &rarr; Action Plan
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={triggerAi}
                onChange={(e) => setTriggerAi(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6A66B]"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#182E4F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#13213B] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-cta px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#48151D] border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Multi-Agent Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit & Dispatch to Agents</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
