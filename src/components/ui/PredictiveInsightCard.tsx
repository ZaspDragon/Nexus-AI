import type { PredictiveInsight } from '../../types';
import { StatusPill } from './StatusPill';

const toneMap = {
  healthy: 'good',
  watch: 'warn',
  urgent: 'bad',
} as const;

export const PredictiveInsightCard = ({ insight }: { insight: PredictiveInsight }) => (
  <div className="rounded-[26px] border border-white/10 bg-panel p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/20">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-400">{insight.title}</p>
        <p className="mt-3 font-display text-4xl text-white">{insight.value}</p>
      </div>
      <StatusPill
        label={insight.tone === 'healthy' ? 'Stable' : insight.tone === 'watch' ? 'Watch' : 'Urgent'}
        tone={toneMap[insight.tone]}
      />
    </div>
    <p className="mt-4 text-sm leading-6 text-slate-200">{insight.detail}</p>
    <p className="mt-3 text-xs leading-5 text-slate-400">{insight.outlook}</p>
  </div>
);
