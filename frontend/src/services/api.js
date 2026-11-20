const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Incidents
  getIncidents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.severity && params.severity !== 'All') query.append('severity', params.severity);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.verification_status && params.verification_status !== 'All') query.append('verification_status', params.verification_status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/incidents${qs}`);
  },

  getIncident: (id) => request(`/incidents/${id}`),

  createIncident: (data, triggerAi = true) =>
    request(`/incidents?trigger_ai=${triggerAi}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateIncident: (id, data) =>
    request(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  analyzeIncident: (id) =>
    request(`/incidents/${id}/analyze`, {
      method: 'POST',
    }),

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/incidents/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Image upload failed');
    return await res.json();
  },

  // Resources
  getResources: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/resources${qs}`);
  },

  getAvailableResources: (category) => {
    const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/resources/available${qs}`);
  },

  updateResource: (id, data) =>
    request(`/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  assignResource: (resourceId, incidentId) =>
    request('/resources/assign', {
      method: 'POST',
      body: JSON.stringify({ resource_id: resourceId, incident_id: incidentId }),
    }),

  unassignResource: (resourceId) =>
    request(`/resources/unassign/${resourceId}`, {
      method: 'POST',
    }),

  // Agents
  getAgentsStatus: () => request('/agents/status'),
  getAgentLogs: (limit = 50) => request(`/agents/logs?limit=${limit}`),
  runDemoFlood: () => request('/agents/run-demo-flood', { method: 'POST' }),

  // Dashboard & Analytics
  getDashboardStats: () => request('/dashboard/stats'),
  getAnalyticsSummary: () => request('/analytics/summary'),
  getSituationReport: () => request('/analytics/situation-report'),

  // Assistant
  chatAssistant: (message, selectedIncidentId = null, history = []) =>
    request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, selected_incident_id: selectedIncidentId, history }),
    }),
  getAssistantSuggestions: () => request('/assistant/suggestions'),

  // System
  resetDemoData: () => request('/system/reset-demo-data', { method: 'POST' }),
  testGeminiConnection: () => request('/system/test-gemini'),
  getHealth: () => request('/health'),
};
