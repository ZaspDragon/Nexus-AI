import {
  Activity,
  AlertTriangle,
  Bot,
  Boxes,
  Clock3,
  PackageCheck,
  Truck,
  Users2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AskNexusPanel } from '../components/ui/AskNexusPanel';
import { ComparisonCard } from '../components/ui/ComparisonCard';
import { KpiTile } from '../components/ui/KpiTile';
import { PageHeader } from '../components/ui/PageHeader';
import { PredictiveInsightCard } from '../components/ui/PredictiveInsightCard';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { ReportCard } from '../components/ui/ReportCard';
import { ShiftHealthCard } from '../components/ui/ShiftHealthCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { TimelineCard } from '../components/ui/TimelineCard';
import { WarehouseMapCard } from '../components/ui/WarehouseMapCard';
import { useAppData } from '../hooks/useAppData';

export const DashboardPage = () => {
  const {
    selectedWarehouse,
    commandFeed,
    timeline,
    chatMessages,
    chatLoading,
    askNexus,
    updateRecommendationStatus,
    createTaskFromRecommendation,
  } = useAppData();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { overview } = selectedWarehouse;
  const receivingPercent = Math.round((overview.receivingProgress.completed / overview.receivingProgress.total) * 100);
  const criticalActions = commandFeed.filter((item) => item.priority === 'Critical' || item.priority === 'High').slice(0, 2);
  const delayedDocks = selectedWarehouse.receivingLanes.filter((lane) =>
    ['Needs support', 'Congested', 'Late', 'Watch'].includes(lane.status),
  );

  const handleCreateTask = (recommendationId: string) => {
    const message = createTaskFromRecommendation(recommendationId);
    setActionMessage(message ?? 'Unable to create task from this action.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${overview.shift} / ${overview.shiftWindow}`}
        title="Warehouse Command Center"
        description="Nexus AI watches live labor intelligence, receiving flow, inventory confidence, downtime, and bottlenecks so supervisors can make the next move before the shift fails."
        action={
          <div className="flex flex-wrap gap-3">
            <Link className="ghost-button" to="/reports">
              View reports
            </Link>
            <Link className="primary-button" to="/command-center">
              Open AI Command Feed
            </Link>
          </div>
        }
      />

      {actionMessage ? (
        <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {actionMessage}
        </div>
      ) : null}

      <ShiftHealthCard shiftHealth={selectedWarehouse.shiftHealth} />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard
          header={
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Critical AI Actions</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Supervisor action feed</h2>
                <p className="mt-2 text-sm text-slate-300">
                  AI recommendations with the highest expected operational impact this shift.
                </p>
              </div>
              <Bot className="h-5 w-5 text-cyan-200" />
            </div>
          }
        >
          <div className="space-y-4">
            {criticalActions.map((item) => (
              <RecommendationCard
                key={item.id}
                {...item}
                onAccept={() => updateRecommendationStatus(item.id, 'Accepted')}
                onIgnore={() => updateRecommendationStatus(item.id, 'Ignored')}
                onEscalate={() => updateRecommendationStatus(item.id, 'Escalated')}
                onCreateTask={() => handleCreateTask(item.id)}
                compact={false}
              />
            ))}
          </div>
        </SurfaceCard>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <SurfaceCard
            header={
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Delayed Docks</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{delayedDocks.length} doors need support</h2>
                </div>
                <Truck className="h-5 w-5 text-cyan-200" />
              </div>
            }
          >
            <div className="space-y-3">
              {delayedDocks.map((lane) => (
                <div key={lane.lane} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {lane.lane} / {lane.trailer}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Owner {lane.owner} / ETA {lane.eta}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100">
                      {lane.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            header={
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Downtime Alerts</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{overview.downtimeAlerts.open} open alerts</h2>
                </div>
                <AlertTriangle className="h-5 w-5 text-amber-200" />
              </div>
            }
          >
            <div className="space-y-3">
              {selectedWarehouse.downtimeEvents.slice(0, 3).map((event) => (
                <div key={event.area} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{event.area}</p>
                      <p className="mt-1 text-xs text-slate-400">{event.cause}</p>
                    </div>
                    <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100">
                      {event.duration} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Active workers"
          value={`${overview.activeWorkers.current}`}
          helper={`Target ${overview.activeWorkers.target} this shift`}
          trend={overview.activeWorkers.delta}
          tone="good"
          icon={<Users2 className="h-5 w-5" />}
        />
        <KpiTile
          label="Dock status"
          value={`${overview.dockStatus.activeDoors}/${overview.dockStatus.totalDoors}`}
          helper={overview.dockStatus.detail}
          trend={`${delayedDocks.length} delayed docks`}
          tone="warn"
          icon={<Boxes className="h-5 w-5" />}
        />
        <KpiTile
          label="Receiving progress"
          value={`${receivingPercent}%`}
          helper={`${overview.receivingProgress.completed}/${overview.receivingProgress.total} loads complete`}
          trend={overview.receivingProgress.targetMinutes}
          tone="warn"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <KpiTile
          label="Inventory confidence"
          value={`${overview.inventoryAccuracy.value}%`}
          helper={overview.inventoryAccuracy.detail}
          trend="Variance watch"
          tone="warn"
          icon={<PackageCheck className="h-5 w-5" />}
        />
        <KpiTile
          label="Picks per hour"
          value={`${overview.picksPerHour.value}`}
          helper={`Target ${overview.picksPerHour.target} this shift`}
          trend={overview.picksPerHour.trend}
          tone={overview.picksPerHour.value >= overview.picksPerHour.target ? 'good' : 'warn'}
          icon={<Activity className="h-5 w-5" />}
        />
        <KpiTile
          label="Labor utilization"
          value={`${overview.laborUtilization.value}%`}
          helper={overview.laborUtilization.detail}
          trend={`Target ${overview.laborUtilization.target}%`}
          tone="warn"
          icon={<Users2 className="h-5 w-5" />}
        />
        <KpiTile
          label="Dock-to-stock risk"
          value={selectedWarehouse.predictiveInsights[1]?.value ?? '+0 min'}
          helper="Predictive operations forecast"
          trend={selectedWarehouse.predictiveInsights[4]?.value ?? 'Stable'}
          tone="bad"
          icon={<Truck className="h-5 w-5" />}
        />
        <KpiTile
          label="AI recommendations"
          value={`${commandFeed.length}`}
          helper="Live labor intelligence and dock alerts"
          trend={`${criticalActions.length} urgent actions`}
          tone="good"
          icon={<Bot className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <WarehouseMapCard zones={selectedWarehouse.warehouseMap} />
        <AskNexusPanel
          prompts={selectedWarehouse.chatPresets}
          messages={chatMessages}
          loading={chatLoading}
          onAsk={askNexus}
        />
      </section>

      <TimelineCard events={timeline} />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard
          header={
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Predictive Intelligence</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">What Nexus AI sees next</h2>
              <p className="mt-2 text-sm text-slate-300">Forward-looking risk cards for the rest of the shift.</p>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selectedWarehouse.predictiveInsights.map((insight) => (
              <PredictiveInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          header={
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">What Changed Since Yesterday?</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Comparison insights</h2>
            </div>
          }
        >
          <div className="space-y-3">
            {selectedWarehouse.comparisonMetrics.map((item) => (
              <ComparisonCard key={item.id} item={item} />
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {selectedWarehouse.reportCards.slice(0, 3).map((report) => (
          <ReportCard key={report.id} {...report} />
        ))}
      </section>
    </div>
  );
};
