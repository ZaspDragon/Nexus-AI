export const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
    <div className="w-full max-w-md rounded-[32px] border border-cyan-400/20 bg-slate-900/80 p-8 text-center shadow-[0_20px_80px_rgba(0,194,255,0.18)]">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">NEXUS AI</p>
      <h1 className="mt-4 font-display text-3xl text-white">Loading warehouse command center</h1>
      <p className="mt-3 text-sm text-slate-300">
        Hydrating labor, dock, receiving, inventory, and downtime signals for this shift.
      </p>
    </div>
  </div>
);
