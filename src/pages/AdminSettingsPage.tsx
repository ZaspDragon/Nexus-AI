import { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { useAppData } from '../hooks/useAppData';
import type { SubscriptionTier } from '../types';

export const AdminSettingsPage = () => {
  const {
    organization,
    updateOrganization,
    liveOpsConfigured,
    liveOpsMode,
    liveConnectionStatus,
    liveConnectors,
    lastLiveUpdate,
    runLiveSimulation,
  } = useAppData();
  const [name, setName] = useState(organization.name);
  const [teamMembers, setTeamMembers] = useState(organization.teamMembers.join('\n'));
  const [usageLimit, setUsageLimit] = useState(String(organization.usageLimit));
  const [tier, setTier] = useState<SubscriptionTier>(organization.subscriptionTier);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setName(organization.name);
    setTeamMembers(organization.teamMembers.join('\n'));
    setUsageLimit(String(organization.usageLimit));
    setTier(organization.subscriptionTier);
  }, [organization]);

  const handleSave = async () => {
    try {
      await updateOrganization({
        ...organization,
        name,
        subscriptionTier: tier,
        usageLimit: Number(usageLimit),
        teamMembers: teamMembers
          .split('\n')
          .map((member) => member.trim())
          .filter(Boolean),
      });
      setStatus('Settings saved for this demo warehouse.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save settings');
    }
  };

  const handleSimulation = async (scenario: Parameters<typeof runLiveSimulation>[0]) => {
    const result = await runLiveSimulation(scenario);
    if (result) {
      setStatus(result);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Operational settings"
        description="Manage company details, subscription posture, and environment placeholders without exposing provider secrets in the browser."
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <SurfaceCard>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Live Ops API</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {liveOpsConfigured ? 'Configured' : 'Not configured'}
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            {liveOpsConfigured
              ? `Current signal state: ${liveConnectionStatus}. Nexus is ready to ingest live WMS, LMS, YMS, telemetry, and ERP events.`
              : 'Add VITE_NEXUS_LIVE_OPS_URL to connect the app to the live operations backend.'}
          </p>
        </SurfaceCard>

        <SurfaceCard>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Mode</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {liveOpsMode === 'live' ? 'Live Warehouse Signals' : 'Demo Signal Layer'}
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            {lastLiveUpdate
              ? `Last live update received at ${new Date(lastLiveUpdate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}.`
              : 'No live signal has been received for this facility in the current session.'}
          </p>
        </SurfaceCard>

        <SurfaceCard>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Simulation</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Test the pipeline</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['mixed', 'receiving-delay', 'downtime-spike'] as const).map((scenario) => (
              <button
                key={scenario}
                type="button"
                className="ghost-button px-4 py-2 text-xs"
                disabled={!liveOpsConfigured}
                onClick={() => void handleSimulation(scenario)}
              >
                {scenario}
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard>
          <div className="grid gap-4">
            <label className="form-field">
              <span>Company name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="form-field">
              <span>Team members</span>
              <textarea rows={5} value={teamMembers} onChange={(event) => setTeamMembers(event.target.value)} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-field">
                <span>Usage limit</span>
                <input value={usageLimit} onChange={(event) => setUsageLimit(event.target.value)} type="number" />
              </label>
              <label className="form-field">
                <span>Subscription tier</span>
                <select value={tier} onChange={(event) => setTier(event.target.value as SubscriptionTier)}>
                  <option value="Starter">Starter</option>
                  <option value="Growth">Growth</option>
                  <option value="Business">Business</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </label>
            </div>
            <button className="primary-button w-full justify-center" type="button" onClick={() => void handleSave()}>
              Save settings
            </button>
            {status ? <p className="text-sm text-cyan-200">{status}</p> : null}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="font-display text-2xl text-white">Environment placeholders</h2>
          <p className="mt-2 text-sm text-slate-300">
            These fields stay non-secret in the app. Wire live credentials through Vercel environment variables, Supabase project settings, Cloud Run, or another backend secret manager.
          </p>
          <div className="mt-6 space-y-4">
            {organization.apiKeyPlaceholders.map((placeholder) => (
              <div key={placeholder.provider} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white">{placeholder.provider}</p>
                    <p className="mt-1 text-xs text-slate-400">{placeholder.status}</p>
                  </div>
                  <button type="button" className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300">
                    Coming soon
                  </button>
                </div>
                <input
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-400"
                  value="****************"
                  disabled
                  readOnly
                />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-400/15 bg-cyan-400/8 p-5">
            <h3 className="text-lg font-semibold text-white">Live connector status</h3>
            <div className="mt-4 space-y-3">
              {liveConnectors.length ? (
                liveConnectors.map((connector) => (
                  <div key={connector.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-white">{connector.label}</p>
                        <p className="mt-1 text-xs text-slate-400">{connector.detail}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                        {connector.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-300">
                  Connector telemetry will appear here once the live backend is configured and starts receiving events.
                </p>
              )}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
};
