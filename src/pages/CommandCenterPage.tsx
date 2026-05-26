import { BellRing, BrainCircuit, Clock3, MoveRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { StatusPill } from '../components/ui/StatusPill';
import { commandRecommendations, downtimeEvents, workers } from '../data/warehouseDemo';

export const CommandCenterPage = () => (
  <div className="space-y-6">
    <PageHeader
      eyebrow="AI Command Center"
      title="Recommendations supervisors can act on this shift"
      description="Nexus AI watches labor, dock flow, inventory variance, and downtime patterns to surface the next best move before the shift falls behind."
      action={
        <Link to="/reports" className="primary-button">
          Start warehouse assessment
        </Link>
      }
    />

    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4">
        {commandRecommendations.map((item) => (
          <RecommendationCard key={item.title} {...item} />
        ))}
      </div>

      <div className="space-y-4">
        <SurfaceCard
          header={
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Live risk feed</h2>
                <p className="mt-1 text-sm text-slate-400">Alerts that can still be corrected this shift.</p>
              </div>
              <BellRing className="h-5 w-5 text-cyan-200" />
            </div>
          }
        >
          <div className="space-y-4">
            {downtimeEvents.map((event) => (
              <div key={event.area} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{event.area}</p>
                    <p className="mt-1 text-xs text-slate-400">{event.cause}</p>
                  </div>
                  <StatusPill label={`${event.duration} min`} tone={event.duration >= 30 ? 'bad' : 'warn'} />
                </div>
                <p className="mt-3 text-sm text-slate-300">{event.owner} is currently assigned to close this issue.</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          header={
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Shift manager checklist</h2>
                <p className="mt-1 text-sm text-slate-400">Three actions to stabilize flow in the next hour.</p>
              </div>
              <BrainCircuit className="h-5 w-5 text-cyan-200" />
            </div>
          }
        >
          <div className="space-y-3">
            {[
              'Send one picker to dock door 3 until transfer unload is back within SLA.',
              'Pause non-critical replenishment in aisle 14 to clear lift congestion.',
              'Audit top-20 variance SKUs in Zone B before second break.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <MoveRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          header={
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Crew pulse</h2>
                <p className="mt-1 text-sm text-slate-400">Who is on pace and who needs support.</p>
              </div>
              <Clock3 className="h-5 w-5 text-cyan-200" />
            </div>
          }
        >
          <div className="space-y-3">
            {workers.map((worker) => (
              <div key={worker.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{worker.name}</p>
                    <p className="text-xs text-slate-400">{worker.role} • {worker.zone}</p>
                  </div>
                  <StatusPill
                    label={worker.status}
                    tone={worker.status === 'On pace' ? 'good' : worker.status === 'Below pace' ? 'bad' : 'warn'}
                  />
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </section>
  </div>
);
