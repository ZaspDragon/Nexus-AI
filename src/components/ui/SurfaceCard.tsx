import type { PropsWithChildren, ReactNode } from 'react';

export const SurfaceCard = ({
  children,
  className = '',
  header,
}: PropsWithChildren<{ className?: string; header?: ReactNode }>) => (
  <section className={`rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-panel backdrop-blur md:p-6 ${className}`}>
    {header ? <div className="mb-5">{header}</div> : null}
    {children}
  </section>
);
