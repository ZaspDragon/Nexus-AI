import { PageHeader } from '../components/ui/PageHeader';
import { useAppData } from '../hooks/useAppData';

export const UsageBillingPage = () => {
  const { usageLogs, organization, dashboardStats } = useAppData();
  const recentLogs = usageLogs.slice(0, 6);
  const peakCost = Math.max(...recentLogs.map((log) => log.estimatedCost), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Economics"
        title="Usage and billing"
        description="Track task volume, estimated token consumption, cost posture, and the current subscription frame for your workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="font-display text-2xl text-white">Estimated spend profile</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Tasks run</p>
              <p className="mt-3 font-display text-3xl text-white">{dashboardStats.tasksCompleted}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Estimated monthly cost</p>
              <p className="mt-3 font-display text-3xl text-white">${dashboardStats.estimatedMonthlyCost}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-300">Subscription tier</p>
              <p className="mt-3 font-display text-3xl text-white">{organization.subscriptionTier}</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-slate-300">Recent run cost histogram</p>
            <div className="mt-5 flex h-64 items-end gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-cyan-400 to-fuchsia-400"
                    style={{ height: `${Math.max((log.estimatedCost / peakCost) * 180, 18)}px` }}
                  />
                  <p className="text-center text-xs text-slate-400">${log.estimatedCost}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="font-display text-2xl text-white">Recent usage logs</h2>
          <div className="mt-6 space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white">{log.taskType}</p>
                    <p className="mt-1 text-xs text-slate-400">{log.model}</p>
                  </div>
                  <p className="text-sm text-cyan-200">${log.estimatedCost}</p>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {log.tokensIn} in / {log.tokensOut} out tokens
                </p>
              </div>
            ))}
          </div>
          <button type="button" className="ghost-button mt-6 w-full justify-center">
            Billing automation coming soon
          </button>
        </section>
      </div>
    </div>
  );
};
