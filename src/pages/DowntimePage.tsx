import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { StatusPill } from '../components/ui/StatusPill';
import { downtimeEvents, warehouseOverview } from '../data/warehouseDemo';

export const DowntimePage = () => (
  <div className="space-y-6">
    <PageHeader
      eyebrow="Downtime"
      title="Escalate stoppages before throughput slips"
      description={`Any issue above ${warehouseOverview.downtimeAlerts.threshold} should trigger supervisor action. Nexus AI groups the highest-risk stoppages in one place.`}
    />

    <SurfaceCard
      header={
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Current downtime alerts</h2>
            <p className="mt-1 text-sm text-slate-400">Sorted by likely impact to shift attainment.</p>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-200" />
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {downtimeEvents.map((event) => (
          <div key={event.area} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{event.area}</p>
                <p className="mt-2 text-sm text-slate-300">{event.cause}</p>
              </div>
              <StatusPill label={event.state} tone={event.state === 'Open' ? 'bad' : 'warn'} />
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p>Duration: {event.duration} minutes</p>
              <p>Owner: {event.owner}</p>
              <p>Threshold exceeded: {event.duration - 25} minutes</p>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  </div>
);
