import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Cpu,
  Truck,
  BarChart3,
  Bot,
  PlusCircle,
  Play,
  RotateCcw,
  Menu,
  X,
  ExternalLink,
  Flame,
  Waves,
  Sparkles
} from 'lucide-react';
import { useCrisis } from '../context/CrisisContext';
import { CrisisAIAssistantDrawer } from '../components/assistant/CrisisAIAssistantDrawer';
import { ToastContainer } from '../components/common/ToastContainer';
import { ReportIncidentModal } from '../components/common/ReportIncidentModal';

export function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    runFloodDemo,
    resetDemo,
    setIsAssistantOpen,
    refreshData,
  } = useCrisis();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [runningFloodDemo, setRunningFloodDemo] = useState(false);

  const navItems = [
    { label: 'Command Centre', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Incidents', path: '/incidents', icon: AlertTriangle },
    { label: 'Live Map', path: '/map', icon: MapPin },
    { label: 'AI Analysis', path: '/analysis', icon: Cpu },
    { label: 'Resources', path: '/resources', icon: Truck },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const handleRunFlood = async () => {
    try {
      setRunningFloodDemo(true);
      await runFloodDemo();
      navigate('/dashboard');
    } finally {
      setRunningFloodDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B14] text-white flex flex-col lg:flex-row">
      {/* Toast Notifications container */}
      <ToastContainer />

      {/* Report Incident Modal */}
      <ReportIncidentModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onCreated={() => {
          refreshData();
          navigate('/incidents');
        }}
      />

      {/* Global AI Assistant Drawer */}
      <CrisisAIAssistantDrawer />

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0C1527] border-b border-[#182E4F] sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-1.5 bg-[#48151D] text-[#C6A66B] rounded-lg border border-[#C6A66B]/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-base tracking-wider text-white">
            CRISIS<span className="text-[#C6A66B]">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="p-2 rounded-lg bg-[#48151D] text-[#C6A66B] border border-[#C6A66B]/40 hover:bg-[#D4B77D] hover:text-[#48151D] transition"
            title="Open Assistant"
          >
            <Bot className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#C6A66B] transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:flex lg:flex-col w-full lg:w-64 bg-[#0C1527] border-r border-[#182E4F] p-4 flex-shrink-0 z-30 sticky top-0 h-auto lg:h-screen overflow-y-auto`}
      >
        {/* Brand */}
        <div
          onClick={() => {
            navigate('/');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 px-2 py-3 mb-6 cursor-pointer group"
        >
          <div className="relative p-2.5 bg-[#48151D] border border-[#C6A66B]/50 text-[#C6A66B] rounded-xl group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(198,166,107,0.35)] transition">
            <ShieldAlert className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C6A66B] animate-ping"></div>
          </div>
          <div>
            <div className="font-black text-lg tracking-wider text-white flex items-center gap-1">
              CRISIS<span className="text-[#C6A66B]">AI</span>
            </div>
            <div className="text-[10px] text-[#C6A66B]/80 font-mono tracking-tight font-medium">
              CRISIS COMMAND SUITE
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => {
            setReportModalOpen(true);
            setMobileMenuOpen(false);
          }}
          className="w-full mb-6 py-2.5 px-3 btn-primary rounded-xl text-xs flex items-center justify-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4 text-[#C6A66B]" />
          <span>Report Emergency</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
            Command Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-[#48151D] text-[#F2E8D9] border border-[#C6A66B] shadow-md shadow-[#C6A66B]/15 font-bold'
                    : 'text-slate-300 hover:text-[#48151D] hover:bg-[#D4B77D] font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C6A66B]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 border-t border-[#182E4F] my-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-[#48151D] hover:bg-[#D4B77D] transition"
            >
              <ExternalLink className="w-4 h-4 text-[#C6A66B]" />
              <span>Public Landing Page</span>
            </NavLink>
          </div>
        </nav>

        {/* Multi-Agent System Health Widget in Sidebar */}
        <div className="mt-auto pt-4 border-t border-[#182E4F]">
          <div className="p-3 bg-[#060B14] border border-[#C6A66B]/30 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white">Agent Network</span>
              <span className="flex items-center gap-1 text-[10px] text-[#C6A66B] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6A66B] animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-300 leading-snug">
              6 Agents orchestrating verification, severity, resources & action plans.
            </div>
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="w-full mt-1 py-1.5 btn-outline rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Ask CrisisAI Assistant</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Command Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#0C1527]/90 backdrop-blur-md border-b border-[#182E4F] sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">OPERATIONAL STATUS:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#48151D] text-[#C6A66B] border border-[#C6A66B]/50 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C6A66B] animate-pulse"></span>
                COMMAND NETWORK ACTIVE
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono hidden xl:block">
              &bull; Sector: Metropolitan Emergency Grid
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Flood Demo Button - Secondary button style */}
            <button
              onClick={handleRunFlood}
              disabled={runningFloodDemo}
              className="px-3.5 py-1.5 rounded-lg text-xs btn-secondary flex items-center gap-1.5 transition shadow-sm"
              title="Runs Section 17 Flood Demonstration Workflow"
            >
              <Waves className="w-3.5 h-3.5 text-[#48151D]" />
              <span>{runningFloodDemo ? 'Orchestrating Agents...' : 'Run Flood Demo'}</span>
            </button>

            {/* Reset Simulation Data - Icon button */}
            <button
              onClick={resetDemo}
              className="p-1.5 rounded-lg btn-icon transition"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* CrisisAI Assistant trigger - Outline button */}
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs btn-outline flex items-center gap-1.5 transition"
            >
              <Bot className="w-4 h-4" />
              <span>Assistant</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
