import { ShieldCheck } from 'lucide-react';
import type { ShiftHealthScore } from '../../types';
import { StatusPill } from './StatusPill';
import { SurfaceCard } from './SurfaceCard';

const toneMap = {
  Healthy: 'good',
  Watch: 'warn',
  Urgent: 'bad',
} as const;

export const ShiftHealthCard = ({ shiftHealth }: { shiftHealth: ShiftHealthScore }) => (
  <SurfaceCard
    className="overflow-hidden"
    header={
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Shift Health Score</p>
          <div className="mt-3 flex items-end gap-3">
            <h2 className="font-display text-5xl text-white md:text-6xl">{shiftHealth.score}/100</h2>
            <StatusPill
              label={shiftHealth.score >= 85 ? 'Healthy shift' : shiftHealth.score >= 75 ? 'Recoverable' : 'Needs action'}
              tone={shiftHealth.score >= 85 ? 'good' : shiftHealth.score >= 75 ? 'warn' : 'bad'}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-3xl border border-cyan-400/15 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-100">
          <ShieldCheck className="h-5 w-5 text-cyan-200" />
          <span>{shiftHealth.summary}</span>
        </div>
      </div>
    }
  >
    <div className="grid gap-4 xl:grid-cols-5">
      {shiftHealth.factors.map((factor) => (
        <div key={factor.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">{factor.label}</p>
              <p className="mt-2 font-display text-3xl text-white">{factor.score}</p>
            </div>
            <StatusPill label={factor.status} tone={toneMap[factor.status]} />
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-900/90">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                factor.status === 'Healthy'
                  ? 'bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500'
                  : factor.status === 'Watch'
                    ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-rose-300 via-rose-400 to-fuchsia-500'
              }`}
              style={{ width: `${factor.score}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">{factor.detail}</p>
        </div>
      ))}
    </div>
  </SurfaceCard>
);
