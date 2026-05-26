import {
  Activity,
  AlertTriangle,
  Boxes,
  Bot,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Users2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { KpiTile } from '../components/ui/KpiTile';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { receivingLanes, warehouseOverview, commandRecommendations, workers } from '../data/warehouseDemo';

export const DashboardPage = () => {
  const receivingPercent = Math.round((warehouseOverview.receivingProgress.completed / warehouseOverview.receivingProgress.total) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${warehouseOverview.shift} • ${warehouseOverview.shiftWindow}`}
        title="Warehouse command dashboard"
        description="Nexus AI watches warehouse operations across labor, downtime, receiving, inventory, and picking so supervisors can fix bottlenecks before the shift slips."
        action={
          <Link className="primary-button" to="/command-center">
            Open AI Command Center
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Active workers"
          value={`${warehouseOverview.activeWorkers.current}`}
          helper={`Target ${warehouseOverview.activeWorkers.target} this shift`}
          trend={warehouseOverview.activeWorkers.delta}
          tone="good"
          icon={<Users2 className="h-5 w-5" />}
        />
        <KpiTile
          label="Dock status"
          value={`${warehouseOverview.dockStatus.activeDoors}/${warehouseOverview.dockStatus.totalDoors}`}
          helper={warehouseOverview.dockStatus.detail}
          trend="Dock watch"
          tone="warn"
          icon={<Boxes className="h-5 w-5" />}
        />
        <KpiTile
          label="Receiving progress"
          value={`${receivingPercent}%`}
          helper={`${warehouseOverview.receivingProgress.completed}/${warehouseOverview.receivingProgress.total} loads complete`}
          trend="18% behind target"
          tone="bad"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <KpiTile
          label="Inventory accuracy"
          value={`${warehouseOverview.inventoryAccuracy.value}%`}
          helper={warehouseOverview.inventoryAccuracy.detail}
          trend="Zone B watch"
          tone="warn"
          icon={<PackageCheck className="h-5 w-5" />}
        />
        <KpiTile
          label="Downtime alerts"
          value={`${warehouseOverview.downtimeAlerts.open}`}
          helper={warehouseOverview.downtimeAlerts.detail}
          trend={warehouseOverview.downtimeAlerts.threshold}
          tone="bad"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KpiTile
          label="Picks per hour"
          value={`${warehouseOverview.picksPerHour.value}`}
          helper={`Target ${warehouseOverview.picksPerHour.target} this shift`}
          trend={warehouseOverview.picksPerHour.trend}
          tone="warn"
          icon={<Activity className="h-5 w-5" />}
        />
        <KpiTile
          label="Labor utilization"
          value={`${warehouseOverview.laborUtilization.value}%`}
          helper={warehouseOverview.laborUtilization.detail}
          trend={`Target ${warehouseOverview.laborUtilization.target}%`}
          tone="warn"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiTile
          label="AI recommendations"
          value={`${warehouseOverview.aiRecommendations}`}
          helper="Live actions ready for supervisors"
          trend="2 high priority"
          tone="good"
          icon={<Bot className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard
          header={
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Shift overview</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Fast visibility into the workstreams most likely to affect service levels this shift.
                </p>
              </div>
              <Link className="ghost-button" to="/reports">
                View reports
              </Link>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <ProgressMeter
                value={receivingPercent}
                label="Receiving target attainment"
                detail={warehouseOverview.receivingProgress.targetMinutes}
              />
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <ProgressMeter
                value={warehouseOverview.inventoryAccuracy.value}
                label="Inventory confidence"
                detail="Higher variance risk is concentrated in Zone B today."
              />
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-medium text-white">Supervisors on duty</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {warehouseOverview.supervisors.map((person) => (
                  <span key={person} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200">
                    {person}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-medium text-white">Highest-risk lane</h3>
              <p className="mt-4 font-display text-3xl text-white">{receivingLanes[1].lane}</p>
              <p className="mt-2 text-sm text-slate-300">{receivingLanes[1].trailer} • ETA {receivingLanes[1].eta}</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          header={
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">AI recommendations</h2>
                <p className="mt-2 text-sm text-slate-300">Recommended actions generated from live warehouse conditions.</p>
              </div>
              <Link className="ghost-button" to="/command-center">
                Open full feed
              </Link>
            </div>
          }
        >
          <div className="space-y-4">
            {commandRecommendations.slice(0, 2).map((item) => (
              <RecommendationCard key={item.title} {...item} />
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard
          header={
            <div>
              <h2 className="text-2xl font-semibold text-white">Crew focus</h2>
              <p className="mt-2 text-sm text-slate-300">Critical operators and where attention should go next.</p>
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            {workers.map((worker) => (
              <div key={worker.name} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">{worker.name}</p>
                <p className="mt-1 text-xs text-slate-400">{worker.role} • {worker.zone}</p>
                <p className="mt-3 text-sm text-slate-300">{worker.throughput}</p>
                <p className="mt-1 text-sm text-slate-300">{worker.status}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          header={
            <div>
              <h2 className="text-2xl font-semibold text-white">Dock board</h2>
              <p className="mt-2 text-sm text-slate-300">Live view of receiving activity by door.</p>
            </div>
          }
        >
          <div className="space-y-3">
            {receivingLanes.map((lane) => (
              <div key={lane.lane} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{lane.lane}</p>
                    <p className="text-xs text-slate-400">{lane.trailer}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{lane.status}</span>
                </div>
                <div className="mt-4">
                  <ProgressMeter value={lane.progress} label="Completion" detail={`Owner: ${lane.owner} • ETA ${lane.eta}`} />
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
};
