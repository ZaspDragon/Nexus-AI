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
  <div className="page-surface flex flex-col gap-4 p-6 md:p-7">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">{description}</p>
      </div>
      {action}
    </div>
  </div>
);
