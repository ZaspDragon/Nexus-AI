export const ProgressMeter = ({
  value,
  label,
  detail,
}: {
  value: number;
  label: string;
  detail: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-white">{label}</p>
      <p className="text-sm text-slate-300">{value}%</p>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 transition-all duration-700"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
    <p className="text-xs text-slate-400">{detail}</p>
  </div>
);
