import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export function SeverityBadge({ severity, className = '' }) {
  const styles = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/50 ring-1 ring-red-500/30 animate-pulse font-bold',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/50 font-bold',
    Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-semibold',
    Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold',
  };

  const currentStyle = styles[severity] || styles.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {severity || 'Medium'}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const styles = {
    'Reported': 'bg-slate-800 text-slate-200 border-slate-600',
    'Under Investigation': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'Verified': 'bg-[#C6A66B]/15 text-[#D4B77D] border-[#C6A66B]/40 font-semibold',
    'Response in Progress': 'bg-[#C6A66B]/25 text-white border-[#C6A66B] ring-1 ring-[#C6A66B]/30 font-bold',
    'Resolved': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  };

  const currentStyle = styles[status] || styles['Reported'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${currentStyle} ${className}`}>
      {status || 'Reported'}
    </span>
  );
}

export function VerificationBadge({ status, score, className = '' }) {
  let badgeColor = 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
  let icon = <HelpCircle className="w-3.5 h-3.5" />;

  if (status === 'Verified') {
    badgeColor = 'bg-[#C6A66B]/15 text-[#D4B77D] border-[#C6A66B]/40 font-semibold';
    icon = <ShieldCheck className="w-3.5 h-3.5 text-[#C6A66B]" />;
  } else if (status === 'Unverified') {
    badgeColor = 'bg-red-500/15 text-red-300 border-red-500/30';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${badgeColor} ${className}`}>
      {icon}
      <span>{status || 'Needs Review'}</span>
      {score !== undefined && (
        <span className="opacity-90 text-[10px] bg-black/40 text-[#F2E8D9] px-1 py-0.2 rounded font-mono font-bold">
          {Math.round(score)}%
        </span>
      )}
    </span>
  );
}

export function RiskScoreGauge({ score = 50, size = 'md' }) {
  const rounded = Math.round(score);
  let color = '#C6A66B';
  if (rounded >= 75) color = '#EF4444';
  else if (rounded >= 55) color = '#F97316';
  else if (rounded >= 35) color = '#FACC15';

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rounded / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-2.5">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#182E4F"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-black font-mono text-white">
          {rounded}
        </span>
      </div>
      <div className="text-left text-xs">
        <div className="font-bold text-white">Risk Score</div>
        <div className="text-slate-300 text-[11px] font-medium">
          {rounded >= 75 ? 'Critical Risk' : rounded >= 55 ? 'High Risk' : rounded >= 35 ? 'Moderate' : 'Low Risk'}
        </div>
      </div>
    </div>
  );
}
