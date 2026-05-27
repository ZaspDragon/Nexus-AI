import {
  Activity,
  ArrowRight,
  BrainCircuit,
  PackageSearch,
  Truck,
  Users2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { defaultWarehouseFacility, heroBenefits } from '../data/warehouseDemo';

const capabilities = [
  {
    title: 'Live Labor Intelligence',
    description: 'See labor utilization, flex opportunities, and staffing pressure before supervisors have to guess who to move.',
    icon: Users2,
  },
  {
    title: 'Dock-to-Stock Risk',
    description: 'Track receiving targets, delayed doors, unload pace, and dock-to-stock drag from one command center.',
    icon: Truck,
  },
  {
    title: 'Predictive Operations',
    description: 'Catch downtime, congestion, and bottlenecks before they spread into missed service levels.',
    icon: Activity,
  },
  {
    title: 'Inventory Confidence',
    description: 'Surface variance risk, cycle count exposure, and replenishment issues before they turn into short picks.',
    icon: PackageSearch,
  },
];

export const LandingPage = () => {
  const { overview, shiftHealth, commandFeed, comparisonMetrics, reportHighlights } = defaultWarehouseFacility;

  return (
    <div className="min-h-screen bg-warehouse-shell px-5 py-6 text-slate-100 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="page-surface flex flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/75">NEXUS AI</p>
            <h1 className="mt-3 font-display text-2xl text-white">AI Shift Manager for warehouse operations</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="ghost-button" to="/auth">
              Sign in
            </Link>
            <Link className="primary-button" to="/auth">
              View Demo Dashboard
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="overflow-hidden bg-[linear-gradient(135deg,rgba(8,47,73,0.88),rgba(15,23,42,0.94)_55%,rgba(10,20,40,0.98))] p-7 md:p-9">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Warehouse Command Center</p>
            <h2 className="mt-5 max-w-4xl font-display text-5xl leading-[1.02] text-white md:text-7xl">
              The AI Shift Manager for Modern Warehouses
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              Nexus AI helps supervisors track labor, downtime, receiving, inventory, and bottlenecks from one
              command center.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="primary-button" to="/auth">
                View Demo Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className="ghost-button" to="/auth">
                Start Warehouse Assessment
              </Link>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {heroBenefits.map((benefit) => (
                <div key={benefit} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200">
                  {benefit}
                </div>
              ))}
            </div>
          </SurfaceCard>

          <div className="grid gap-6">
            <SurfaceCard
              header={
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/75">Live snapshot</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{overview.siteName}</h3>
                  </div>
                  <BrainCircuit className="h-5 w-5 text-cyan-200" />
                </div>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Shift Health Score</p>
                  <p className="mt-2 font-display text-4xl text-white">{shiftHealth.score}/100</p>
                  <p className="mt-2 text-sm text-slate-300">{shiftHealth.summary}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Active workers</p>
                  <p className="mt-2 font-display text-4xl text-white">{overview.activeWorkers.current}</p>
                  <p className="mt-2 text-sm text-slate-300">{overview.activeWorkers.delta}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Receiving progress</p>
                  <p className="mt-2 font-display text-4xl text-white">
                    {Math.round((overview.receivingProgress.completed / overview.receivingProgress.total) * 100)}%
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{overview.receivingProgress.targetMinutes}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Downtime alerts</p>
                  <p className="mt-2 font-display text-4xl text-white">{overview.downtimeAlerts.open}</p>
                  <p className="mt-2 text-sm text-slate-300">Threshold: {overview.downtimeAlerts.threshold}</p>
                </div>
              </div>
            </SurfaceCard>

            <RecommendationCard {...commandFeed[0]} compact />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <SurfaceCard key={item.title} className="p-6">
                <div className="inline-flex rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3">
                  <Icon className="h-5 w-5 text-cyan-200" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
              </SurfaceCard>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <SurfaceCard
            header={
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/75">What managers see fast</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Why warehouse teams buy this</h3>
              </div>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Nexus AI watches receiving, inventory, labor, downtime, and dock flow.',
                'It tracks labor, downtime, receiving, inventory, picking, and staffing in one place.',
                'It gives AI recommendations to supervisors before the shift slips.',
                'It helps managers see bottlenecks before the shift fails.',
                'It creates a live supervisor action feed instead of a static dashboard.',
                'It turns warehouse data into clear next moves for the floor.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            header={
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/75">Operational standards</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Targets warehouse supervisors understand</h3>
              </div>
            }
          >
            <div className="space-y-3">
              {reportHighlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {comparisonMetrics.map((item) => (
            <SurfaceCard key={item.id} className="p-5">
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className={`mt-3 font-display text-3xl ${item.direction === 'up' ? 'text-emerald-300' : 'text-amber-300'}`}>
                {item.delta}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
            </SurfaceCard>
          ))}
        </section>
      </div>
    </div>
  );
};
