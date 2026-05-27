import { Clock3 } from 'lucide-react';
import type { TimelineEvent } from '../../types';
import { StatusPill } from './StatusPill';
import { SurfaceCard } from './SurfaceCard';

const severityTone = {
  Critical: 'bad',
  High: 'bad',
  Medium: 'warn',
  Low: 'good',
} as const;

export const TimelineCard = ({ events }: { events: TimelineEvent[] }) => (
  <SurfaceCard
    header={
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Operational Timeline</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Live shift events</h2>
          <p className="mt-2 text-sm text-slate-300">What changed across the floor, in time order.</p>
        </div>
        <Clock3 className="h-5 w-5 text-cyan-200" />
      </div>
    }
  >
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                {event.time}
              </span>
              <span className="text-sm text-cyan-200">{event.department}</span>
            </div>
            <StatusPill label={event.severity} tone={severityTone[event.severity]} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-200">{event.description}</p>
        </div>
      ))}
    </div>
  </SurfaceCard>
);
