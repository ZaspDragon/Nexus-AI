export const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) => (
  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_15px_60px_rgba(2,6,23,0.4)]">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-3 font-display text-3xl text-white">{value}</p>
    <p className="mt-2 text-sm text-slate-300">{helper}</p>
  </div>
);
