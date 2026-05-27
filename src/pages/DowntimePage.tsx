import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { StatusPill } from '../components/ui/StatusPill';
import { TimelineCard } from '../components/ui/TimelineCard';
import { useAppData } from '../hooks/useAppData';

export const DowntimePage = () => {
  const { selectedWarehouse, timeline } = useAppData();
  const { overview } = selectedWarehouse;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Downtime"
        title="Escalate stoppages before throughput slips"
        description={`Any issue above ${overview.downtimeAlerts.threshold} should trigger supervisor action. Nexus AI groups the highest-risk stoppages in one place.`}
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
          {selectedWarehouse.downtimeEvents.map((event) => (
            <div key={event.area} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{event.area}</p>
                  <p className="mt-2 text-sm text-slate-300">{event.cause}</p>
                </div>
                <StatusPill label={event.state} tone={event.state === 'Open' ? 'bad' : event.state === 'Monitoring' ? 'warn' : 'good'} />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Duration: {event.duration} minutes</p>
                <p>Owner: {event.owner}</p>
                <p>Threshold exceeded: {Math.max(event.duration - 25, 0)} minutes</p>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <TimelineCard
        events={timeline.filter((event) => ['Downtime', 'AI Action', 'Supervisor Action'].includes(event.department)).slice(0, 6)}
      />
    </div>
  );
};
