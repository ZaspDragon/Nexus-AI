import type { PropsWithChildren } from 'react';

export const Badge = ({
  children,
  tone = 'default',
}: PropsWithChildren<{ tone?: 'default' | 'accent' | 'success' | 'warning' }>) => {
  const toneClass = {
    default: 'border-white/10 bg-white/5 text-slate-200',
    accent: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
    success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    warning: 'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200',
  }[tone];

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}>
      {children}
    </span>
  );
};
