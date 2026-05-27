import { ProgressMeter } from '../components/ui/ProgressMeter';
import { PageHeader } from '../components/ui/PageHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { useAppData } from '../hooks/useAppData';

export const ReceivingPage = () => {
  const { selectedWarehouse } = useAppData();
  const { overview, receivingLanes, commandFeed } = selectedWarehouse;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Receiving"
        title="Dock flow, unload pace, and dock-to-stock control"
        description="Track whether the receiving team is holding the 30-minute LTL / transfer goal and the 2-hour container goal before downstream teams stall."
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <SurfaceCard
          header={
            <div>
              <h2 className="text-xl font-semibold text-white">Door performance</h2>
              <p className="mt-1 text-sm text-slate-400">{overview.receivingProgress.targetMinutes}</p>
            </div>
          }
        >
          <div className="space-y-5">
            {receivingLanes.map((lane) => (
              <div key={lane.lane} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {lane.lane} / {lane.trailer}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Owner {lane.owner} / ETA {lane.eta}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{lane.status}</span>
                </div>
                <div className="mt-4">
                  <ProgressMeter value={lane.progress} label="Unload completion" detail={`Current lane state: ${lane.status}`} />
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          header={
            <div>
              <h2 className="text-xl font-semibold text-white">AI receiving guidance</h2>
              <p className="mt-1 text-sm text-slate-400">Shift guidance supervisors can relay immediately.</p>
            </div>
          }
        >
          <div className="space-y-4 text-sm text-slate-300">
            {commandFeed
              .filter((item) => item.department === 'Receiving' || item.department === 'Dock')
              .map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 ${
                    item.priority === 'Critical'
                      ? 'border-rose-400/15 bg-rose-400/10'
                      : 'border-cyan-400/15 bg-cyan-400/10'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-2 leading-6 text-slate-200">{item.recommendation}</p>
                </div>
              ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
};
