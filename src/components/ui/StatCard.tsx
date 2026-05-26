export const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) => (
  <div className="rounded-[28px] border border-white/10 bg-panel p-5 shadow-panel">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-3 font-display text-3xl text-white">{value}</p>
    <p className="mt-2 text-sm text-slate-300">{helper}</p>
  </div>
);
