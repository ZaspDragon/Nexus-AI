export const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
    <h3 className="font-display text-xl text-white">{title}</h3>
    <p className="mt-3 text-sm text-slate-300">{description}</p>
  </div>
);
