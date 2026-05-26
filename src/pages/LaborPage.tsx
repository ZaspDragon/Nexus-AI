import { Users2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { workers, laborSegments } from '../data/warehouseDemo';

export const LaborPage = () => (
  <div className="space-y-6">
    <PageHeader
      eyebrow="Labor"
      title="Staffing balance, utilization, and cross-training opportunities"
      description="Give supervisors a simple view of who is staffed, where labor is under pressure, and which workstream can flex without harming the rest of the shift."
    />

    <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <SurfaceCard
        header={
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Labor by workstream</h2>
              <p className="mt-1 text-sm text-slate-400">Labor utilization should stay near 88% without starving any team.</p>
            </div>
            <Users2 className="h-5 w-5 text-cyan-200" />
          </div>
        }
      >
        <div className="space-y-5">
          {laborSegments.map((segment) => (
            <div key={segment.team} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{segment.team}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Staffed {segment.staffed} / Planned {segment.planned}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                  {segment.utilization}% utilized
                </span>
              </div>
              <div className="mt-4">
                <ProgressMeter value={segment.utilization} label="Team utilization" detail={segment.note} />
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard
        header={
          <div>
            <h2 className="text-xl font-semibold text-white">Crew detail</h2>
            <p className="mt-1 text-sm text-slate-400">Key operators and shift-critical signals.</p>
          </div>
        }
      >
        <div className="space-y-3">
          {workers.map((worker) => (
            <div key={worker.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{worker.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{worker.role} • {worker.zone}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{worker.status}</span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300">
                <p>{worker.throughput}</p>
                <p>{worker.utilization} utilization</p>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </section>
  </div>
);
