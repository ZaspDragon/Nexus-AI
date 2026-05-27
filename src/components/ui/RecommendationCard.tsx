import { ArrowRight, CheckCheck, CornerRightUp, FolderPlus, MinusCircle } from 'lucide-react';
import type { CommandStatus, WarehouseRecommendation } from '../../types';
import { StatusPill } from './StatusPill';

export const RecommendationCard = ({
  title,
  recommendation,
  impact,
  priority,
  confidence,
  status,
  timestamp,
  department,
  onAccept,
  onIgnore,
  onEscalate,
  onCreateTask,
  compact = false,
}: WarehouseRecommendation & {
  onAccept?: () => void;
  onIgnore?: () => void;
  onEscalate?: () => void;
  onCreateTask?: () => void;
  compact?: boolean;
}) => {
  const priorityTone = {
    Critical: 'bad',
    High: 'bad',
    Medium: 'warn',
    Low: 'good',
  } as const;

  const statusTone: Record<CommandStatus, 'neutral' | 'good' | 'warn' | 'bad'> = {
    New: 'neutral',
    Accepted: 'good',
    Ignored: 'warn',
    Escalated: 'bad',
  };

  return (
    <article className="rounded-[28px] border border-white/10 bg-panel p-5 transition duration-300 hover:border-cyan-300/20 hover:bg-slate-900/90">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
              {timestamp}
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-200">
              {department}
            </span>
            <StatusPill label={priority} tone={priorityTone[priority]} />
            <StatusPill label={status} tone={statusTone[status]} />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{title}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{recommendation}</p>
          </div>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Confidence</p>
          <p className="mt-2 font-display text-3xl text-white">{confidence}%</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{impact}</span>
      </div>

      {!compact ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="ghost-button px-4 py-2 text-xs" onClick={onAccept}>
            <CheckCheck className="h-4 w-4" />
            Accept
          </button>
          <button type="button" className="ghost-button px-4 py-2 text-xs" onClick={onIgnore}>
            <MinusCircle className="h-4 w-4" />
            Ignore
          </button>
          <button type="button" className="ghost-button px-4 py-2 text-xs" onClick={onEscalate}>
            <CornerRightUp className="h-4 w-4" />
            Escalate
          </button>
          <button type="button" className="primary-button px-4 py-2 text-xs" onClick={onCreateTask}>
            <FolderPlus className="h-4 w-4" />
            Create Task
          </button>
        </div>
      ) : null}
    </article>
  );
};
