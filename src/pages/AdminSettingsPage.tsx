import { useEffect, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { useAppData } from '../hooks/useAppData';
import type { SubscriptionTier } from '../types';

export const AdminSettingsPage = () => {
  const { organization, updateOrganization } = useAppData();
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
      setStatus('Organization settings saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save organization');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Org Controls"
        title="Admin settings"
        description="Manage company metadata, subscription posture, and live-model placeholders without ever storing provider secrets in the browser."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="grid gap-4">
            <label className="form-field">
              <span>Company name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="form-field">
              <span>Team members placeholder</span>
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
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="font-display text-2xl text-white">API key placeholders</h2>
          <p className="mt-2 text-sm text-slate-300">
            These fields are intentionally non-secret placeholders. Wire real provider credentials through Firebase Functions, Cloud Run, or another backend secret manager.
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
                  value="••••••••••••••••"
                  disabled
                  readOnly
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
