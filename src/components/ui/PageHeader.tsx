import type { ReactNode } from 'react';

export const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(8,15,40,0.35)] backdrop-blur">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl text-white md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">{description}</p>
      </div>
      {action}
    </div>
  </div>
);
