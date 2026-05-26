import { Download } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { ReportCard } from '../components/ui/ReportCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { reportCards, reportHighlights } from '../data/warehouseDemo';

export const ReportsPage = () => (
  <div className="space-y-6">
    <PageHeader
      eyebrow="Reports"
      title="Export-ready warehouse reporting"
      description="Daily summaries, receiving performance, downtime, inventory accuracy, and AI action logs that managers can review, share, or use in customer meetings."
      action={
        <button type="button" className="ghost-button">
          <Download className="h-4 w-4" />
          Export pack coming soon
        </button>
      }
    />

    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-4 md:grid-cols-2">
        {reportCards.map((card) => (
          <ReportCard key={card.title} {...card} />
        ))}
      </div>

      <SurfaceCard
        header={
          <div>
            <h2 className="text-xl font-semibold text-white">Included shift targets</h2>
            <p className="mt-1 text-sm text-slate-400">Every report references the same operational baseline.</p>
          </div>
        }
      >
        <div className="space-y-3">
          {reportHighlights.map((highlight) => (
            <div key={highlight} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {highlight}
            </div>
          ))}
        </div>
      </SurfaceCard>
    </section>
  </div>
);
