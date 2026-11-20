import React from 'react';

export function KPIStatCard({ title, value, icon: Icon, changeText, color = 'cyan', subtitle, onClick }) {
  const colorMap = {
    red: {
      border: 'border-red-500/40 hover:border-red-500/70',
      iconBg: 'bg-red-500/15 text-red-400',
      glow: 'shadow-red-500/10',
      text: 'text-red-400',
    },
    orange: {
      border: 'border-orange-500/40 hover:border-orange-500/70',
      iconBg: 'bg-orange-500/15 text-orange-400',
      glow: 'shadow-orange-500/10',
      text: 'text-orange-400',
    },
    yellow: {
      border: 'border-yellow-500/40 hover:border-yellow-500/70',
      iconBg: 'bg-yellow-500/15 text-yellow-400',
      glow: 'shadow-yellow-500/10',
      text: 'text-yellow-400',
    },
    green: {
      border: 'border-emerald-500/40 hover:border-emerald-500/70',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      glow: 'shadow-emerald-500/10',
      text: 'text-emerald-400',
    },
    cyan: {
      border: 'border-cyan-500/40 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      text: 'text-cyan-400',
    },
    sky: {
      border: 'border-cyan-500/40 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
      text: 'text-cyan-400',
    },
    purple: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.12)]',
      text: 'text-cyan-300',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div
      onClick={onClick}
      className={`bg-[#0C1527] border ${c.border} rounded-2xl p-4 shadow-xl ${c.glow} transition-all duration-200 hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border border-cyan-500/20 ${c.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        {changeText && <span className="text-xs text-cyan-300 font-semibold">{changeText}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-300 font-medium truncate">{subtitle}</p>}
    </div>
  );
}
