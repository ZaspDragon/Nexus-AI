import type { ReactNode } from 'react';
import { StatusPill } from './StatusPill';

export const KpiTile = ({
  label,
  value,
  helper,
  trend,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  helper: string;
  trend?: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
}) => (
  <div className="group rounded-[28px] border border-white/10 bg-panel px-5 py-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20 hover:bg-slate-900/90">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-3 font-display text-3xl tracking-tight text-white">{value}</p>
      </div>
      {icon ? <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">{icon}</div> : null}
    </div>
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-slate-300">{helper}</p>
      {trend ? <StatusPill label={trend} tone={tone} /> : null}
    </div>
  </div>
);
