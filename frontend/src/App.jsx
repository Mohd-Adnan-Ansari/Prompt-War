import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CrisisProvider } from './context/CrisisContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { EmergencyMapPage } from './pages/EmergencyMapPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export function App() {
  return (
    <CrisisProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Command Centre Operations (inside MainLayout) */}
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/incidents"
            element={
              <MainLayout>
                <IncidentsPage />
              </MainLayout>
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <MainLayout>
                <IncidentDetailPage />
              </MainLayout>
            }
          />
          <Route
            path="/map"
            element={
              <MainLayout>
                <EmergencyMapPage />
              </MainLayout>
            }
          />
          <Route
            path="/analysis"
            element={
              <MainLayout>
                <AIAnalysisPage />
              </MainLayout>
            }
          />
          <Route
            path="/resources"
            element={
              <MainLayout>
                <ResourcesPage />
              </MainLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <MainLayout>
                <AnalyticsPage />
              </MainLayout>
            }
          />

          {/* Catch all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CrisisProvider>
  );
}

export default App;
