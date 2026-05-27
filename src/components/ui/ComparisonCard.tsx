import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ComparisonMetric } from '../../types';

export const ComparisonCard = ({ item }: { item: ComparisonMetric }) => (
  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-white">{item.label}</p>
        <p className={`mt-2 inline-flex items-center gap-2 text-lg font-semibold ${item.direction === 'up' ? 'text-emerald-300' : 'text-amber-300'}`}>
          {item.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {item.delta}
        </p>
      </div>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
  </div>
);
