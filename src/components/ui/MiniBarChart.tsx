import type { ChartSeries } from '../../types';

export const MiniBarChart = ({ chart }: { chart: ChartSeries }) => {
  const maxValue = Math.max(...chart.values, chart.target ?? 0, 1);

  return (
    <div className="space-y-3">
      {chart.labels.map((label, index) => {
        const value = chart.values[index] ?? 0;
        return (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
              <span>{label}</span>
              <span>
                {value}
                {chart.suffix}
              </span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-900/85">
              {chart.target ? (
                <div
                  className="absolute inset-y-0 w-px bg-white/25"
                  style={{ left: `${Math.min((chart.target / maxValue) * 100, 100)}%` }}
                />
              ) : null}
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min((value / maxValue) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
