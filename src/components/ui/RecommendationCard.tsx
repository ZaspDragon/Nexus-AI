import { ArrowRight } from 'lucide-react';
import { StatusPill } from './StatusPill';

export const RecommendationCard = ({
  title,
  recommendation,
  impact,
  severity,
}: {
  title: string;
  recommendation: string;
  impact: string;
  severity: 'high' | 'medium' | 'low';
}) => (
  <article className="rounded-[28px] border border-white/10 bg-panel p-5 transition duration-300 hover:border-cyan-300/20 hover:bg-slate-900/90">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{recommendation}</p>
      </div>
      <StatusPill
        label={severity === 'high' ? 'High priority' : severity === 'medium' ? 'Monitor' : 'Stable'}
        tone={severity === 'high' ? 'bad' : severity === 'medium' ? 'warn' : 'good'}
      />
    </div>
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{impact}</span>
    </div>
  </article>
);
