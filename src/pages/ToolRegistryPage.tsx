import { PageHeader } from '../components/ui/PageHeader';
import { useAppData } from '../hooks/useAppData';

export const ToolRegistryPage = () => {
  const { tools, updateTool } = useAppData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integrations"
        title="Tool registry"
        description="Enable or disable the tools your agents can invoke during orchestration runs. Every card is interactive and safe in demo mode."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <article key={tool.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/75">{tool.category}</p>
                <h2 className="mt-3 font-display text-2xl text-white">{tool.name}</h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  tool.enabled ? 'bg-emerald-400/15 text-emerald-200' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tool.enabled ? 'Enabled' : tool.status === 'coming-soon' ? 'Coming soon' : 'Disabled'}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-300">{tool.description}</p>
            <p className="mt-3 text-xs text-slate-400">{tool.coverage}</p>
            <button
              type="button"
              disabled={tool.status === 'coming-soon'}
              className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm ${
                tool.status === 'coming-soon'
                  ? 'cursor-not-allowed border border-white/10 bg-white/5 text-slate-400'
                  : tool.enabled
                    ? 'border border-fuchsia-400/25 bg-fuchsia-400/10 text-white'
                    : 'border border-cyan-400/25 bg-cyan-400/10 text-white'
              }`}
              onClick={() => void updateTool({ ...tool, enabled: !tool.enabled })}
            >
              {tool.status === 'coming-soon'
                ? 'Coming soon'
                : tool.enabled
                  ? 'Disable tool'
                  : 'Enable tool'}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};
