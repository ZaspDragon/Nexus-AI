import { ProgressMeter } from '../components/ui/ProgressMeter';
import { PageHeader } from '../components/ui/PageHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { receivingLanes, warehouseOverview } from '../data/warehouseDemo';

export const ReceivingPage = () => (
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
            <p className="mt-1 text-sm text-slate-400">{warehouseOverview.receivingProgress.targetMinutes}</p>
          </div>
        }
      >
        <div className="space-y-5">
          {receivingLanes.map((lane) => (
            <div key={lane.lane} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{lane.lane} • {lane.trailer}</p>
                  <p className="mt-1 text-xs text-slate-400">Owner: {lane.owner} • ETA: {lane.eta}</p>
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
            <h2 className="text-xl font-semibold text-white">Receiving notes</h2>
            <p className="mt-1 text-sm text-slate-400">Shift guidance supervisors can relay immediately.</p>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
            Door 3 is the highest-risk lane. Reassign one picker there until the transfer trailer is back above 70% complete.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            Dock door 5 staging is creating extra dock-to-stock delay. Clear overflow pallets before the next import wave spots.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            Use Henry as the receiving escalation point. He is the current best-positioned lead for cross-functional calls.
          </div>
        </div>
      </SurfaceCard>
    </section>
  </div>
);
