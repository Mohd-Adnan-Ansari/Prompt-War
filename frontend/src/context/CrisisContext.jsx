import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CrisisContext = createContext(null);

export function CrisisProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assistant state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantIncidentFocus, setAssistantIncidentFocus] = useState(null);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [incData, resData, dashData] = await Promise.all([
        api.getIncidents(),
        api.getResources(),
        api.getDashboardStats(),
      ]);
      setIncidents(incData);
      setResources(resData);
      setDashboardStats(dashData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch platform state:', err);
      setError(err.message || 'Error connecting to CrisisAI backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Run Flood Demo Workflow
  const runFloodDemo = async () => {
    try {
      addToast('Launching multi-agent flood demonstration pipeline...', 'info');
      const res = await api.runDemoFlood();
      addToast('Flood Demo completed! 6 AI agents processed incident.', 'success');
      await refreshData();
      return res;
    } catch (err) {
      addToast(`Flood Demo failed: ${err.message}`, 'error');
      throw err;
    }
  };

  // Reset Demo Data
  const resetDemo = async () => {
    try {
      addToast('Resetting simulation data to default baseline...', 'info');
      await api.resetDemoData();
      addToast('Simulation data restored successfully!', 'success');
      await refreshData();
    } catch (err) {
      addToast(`Reset failed: ${err.message}`, 'error');
    }
  };

  const openAssistantWithIncident = (incident) => {
    setAssistantIncidentFocus(incident);
    setIsAssistantOpen(true);
  };

  return (
    <CrisisContext.Provider
      value={{
        incidents,
        resources,
        dashboardStats,
        loading,
        error,
        refreshData,
        runFloodDemo,
        resetDemo,
        isAssistantOpen,
        setIsAssistantOpen,
        assistantIncidentFocus,
        setAssistantIncidentFocus,
        openAssistantWithIncident,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </CrisisContext.Provider>
  );
}

export function useCrisis() {
  const context = useContext(CrisisContext);
  if (!context) {
    throw new Error('useCrisis must be used within a CrisisProvider');
  }
  return context;
}
