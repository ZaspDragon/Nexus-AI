export const StatusPill = ({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
}) => {
  const classes = {
    neutral: 'border-white/10 bg-white/5 text-slate-200',
    good: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    warn: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    bad: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  }[tone];

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${classes}`}>{label}</span>;
};
