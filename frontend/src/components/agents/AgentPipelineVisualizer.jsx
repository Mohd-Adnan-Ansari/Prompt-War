import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Tag,
  AlertTriangle,
  Truck,
  CheckSquare,
  ChevronRight,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const AGENT_ICONS = {
  report_collection: FileText,
  verification: ShieldCheck,
  classification: Tag,
  severity: AlertTriangle,
  resource_coordination: Truck,
  action_planning: CheckSquare,
};

const AGENT_DESCRIPTIONS = {
  report_collection: 'Ingests report, parses coordinates and validates evidence completeness.',
  verification: 'Calculates credibility score, detects duplicates, and checks nearby sensor feeds.',
  classification: 'Categorizes disaster type and maps primary and secondary hazard vectors.',
  severity: 'Calculates threat-to-life risk score, escalation velocity, and urgency level.',
  resource_coordination: 'Calculates spatial proximity and recommends matching response assets.',
  action_planning: 'Synthesizes playbook with immediate priorities, tactical actions, and risks.',
};

export function AgentPipelineVisualizer({
  steps = [],
  activeStepIndex = null,
  onStepSelect,
  isProcessing = false
}) {
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const defaultAgents = [
    { agent_id: 'report_collection', agent_name: 'Report Collection' },
    { agent_id: 'verification', agent_name: 'Verification' },
    { agent_id: 'classification', agent_name: 'Classification' },
    { agent_id: 'severity', agent_name: 'Severity Assessment' },
    { agent_id: 'resource_coordination', agent_name: 'Resource Coordination' },
    { agent_id: 'action_planning', agent_name: 'Action Planning' },
  ];

  const pipelineSteps = defaultAgents.map((def, idx) => {
    const existing = steps.find((s) => s.agent_id === def.agent_id);
    if (existing) return existing;
    return {
      agent_id: def.agent_id,
      agent_name: def.agent_name,
      status: isProcessing && activeStepIndex === idx ? 'Processing' : 'Completed',
      execution_time_ms: 45,
      input_summary: '',
      output: {}
    };
  });

  const activeStep = selectedAgentId
    ? pipelineSteps.find((s) => s.agent_id === selectedAgentId)
    : pipelineSteps[0];

  return (
    <div className="bg-[#0C1527] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Multi-Agent Orchestration Pipeline
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                6 Agents Active
              </span>
            </h3>
            <p className="text-xs text-slate-300">Sequential multi-agent verification and tactical response synthesis</p>
          </div>
        </div>

        <div className="text-xs text-cyan-300 font-mono bg-[#060B14] px-3 py-1.5 rounded-xl border border-cyan-500/30">
          Execution Flow: 1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5 &rarr; 6
        </div>
      </div>

      {/* Sequential Pipeline Steps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
        {pipelineSteps.map((step, idx) => {
          const Icon = AGENT_ICONS[step.agent_id] || FileText;
          const isSelected = (selectedAgentId || pipelineSteps[0]?.agent_id) === step.agent_id;
          const isCompleted = step.status === 'Completed';
          const isNeedsReview = step.status === 'Needs Review';

          return (
            <button
              key={step.agent_id}
              onClick={() => {
                setSelectedAgentId(step.agent_id);
                onStepSelect && onStepSelect(step);
              }}
              className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-[#13213B] border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                  : 'bg-[#060B14] border-[#182E4F] hover:border-cyan-500/40 hover:bg-[#0F1D38]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold font-mono text-cyan-400">
                  AGENT 0{idx + 1}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : isNeedsReview ? (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-300'}`} />
                <span className="text-xs font-bold text-white truncate">
                  {step.agent_name.replace(' Agent', '')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono mt-2 pt-2 border-t border-[#182E4F]">
                <span
                  className={
                    isCompleted
                      ? 'text-cyan-300 font-semibold'
                      : isNeedsReview
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }
                >
                  {step.status}
                </span>
                <span className="flex items-center gap-0.5 text-cyan-400">
                  <Clock className="w-2.5 h-2.5" />
                  {step.execution_time_ms}ms
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Step Inspector Box */}
      {activeStep && (
        <div className="p-4 bg-[#060B14] border border-[#182E4F] rounded-2xl text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#182E4F] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 font-bold uppercase text-[11px]">
                Active Inspector:
              </span>
              <span className="font-bold text-white text-sm">{activeStep.agent_name}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400">Latency:</span>
              <span className="text-cyan-400 font-bold">{activeStep.execution_time_ms} ms</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Status:</span>
              <span className="text-cyan-300 font-semibold">{activeStep.status}</span>
            </div>
          </div>

          <p className="text-slate-200 text-xs leading-relaxed">
            {AGENT_DESCRIPTIONS[activeStep.agent_id]}
          </p>

          {/* Structured Output Preview */}
          {activeStep.output && Object.keys(activeStep.output).length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Structured JSON Output Telemetry:
              </div>
              <pre className="bg-[#0C1527] border border-[#182E4F] p-3 rounded-xl text-white font-mono text-[11px] overflow-x-auto max-h-48 leading-tight">
                {JSON.stringify(activeStep.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
