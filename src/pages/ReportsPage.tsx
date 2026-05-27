import { Download } from 'lucide-react';
import { useState } from 'react';
import { ComparisonCard } from '../components/ui/ComparisonCard';
import { PageHeader } from '../components/ui/PageHeader';
import { ReportCard } from '../components/ui/ReportCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { useAppData } from '../hooks/useAppData';

export const ReportsPage = () => {
  const { selectedWarehouse } = useAppData();
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Export-ready warehouse reporting"
        description="Daily shift summaries, downtime detail, receiving performance, inventory accuracy, labor productivity, and AI action history in a format supervisors can actually use."
        action={
          <button
            type="button"
            className="ghost-button"
            onClick={() => setExportMessage('Report export is queued for a future backend release. This MVP keeps the pack presentation-ready in-app.')}
          >
            <Download className="h-4 w-4" />
            Export pack
          </button>
        }
      />

      {exportMessage ? (
        <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {exportMessage}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {selectedWarehouse.reportCards.map((card) => (
          <ReportCard key={card.id} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard
          header={
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Included Shift Standards</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Operational baseline</h2>
              <p className="mt-2 text-sm text-slate-300">Every report references the same target thresholds and service levels.</p>
            </div>
          }
        >
          <div className="space-y-3">
            {selectedWarehouse.reportHighlights.map((highlight) => (
              <div key={highlight} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                {highlight}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          header={
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Yesterday Comparison</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">What changed since yesterday?</h2>
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            {selectedWarehouse.comparisonMetrics.map((item) => (
              <ComparisonCard key={item.id} item={item} />
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
};
