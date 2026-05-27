import type { WarehouseReportCard } from '../../types';
import { MiniBarChart } from './MiniBarChart';

export const ReportCard = ({
  title,
  description,
  metrics,
  chart,
}: WarehouseReportCard) => (
  <article className="rounded-[28px] border border-white/10 bg-panel p-5 transition duration-300 hover:border-cyan-300/20 hover:bg-slate-900/90">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <button type="button" className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300">
        Export-ready
      </button>
    </div>
    <div className="mt-4 rounded-[22px] border border-white/10 bg-white/5 p-4">
      <MiniBarChart chart={chart} />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {metrics.map((metric) => (
        <span key={metric} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
          {metric}
        </span>
      ))}
    </div>
  </article>
);
