import { useEffect, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAppData } from '../hooks/useAppData';
import type { Agent, MemorySetting, PreferredModel } from '../types';

const defaultForm = {
  name: '',
  purpose: '',
  tools: [] as string[],
  memorySetting: 'shared' as MemorySetting,
  preferredModel: 'auto' as PreferredModel,
  status: 'active' as Agent['status'],
  lastTaskSummary: '',
};

export const AgentWorkspacePage = () => {
  const { agents, tools, runs, upsertAgent, runTask } = useAppData();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [form, setForm] = useState(defaultForm);
  const [task, setTask] = useState('Build an investor-demo launch brief with product, GTM, and technical milestones.');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const fallbackId = agents[0]?.id ?? '';
    if (!selectedAgentId && fallbackId) {
      setSelectedAgentId(fallbackId);
    }
  }, [agents, selectedAgentId]);

  useEffect(() => {
    const selected = agents.find((agent) => agent.id === selectedAgentId);
    if (!selected) {
      setForm(defaultForm);
      return;
    }

    setForm({
      name: selected.name,
      purpose: selected.purpose,
      tools: selected.tools,
      memorySetting: selected.memorySetting,
      preferredModel: selected.preferredModel,
      status: selected.status,
      lastTaskSummary: selected.lastTaskSummary ?? '',
    });
  }, [agents, selectedAgentId]);

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);
  const relatedRuns = runs.filter((run) => run.agentId === selectedAgentId);

  const toggleTool = (toolId: string) => {
    setForm((previous) => ({
      ...previous,
      tools: previous.tools.includes(toolId)
        ? previous.tools.filter((item) => item !== toolId)
        : [...previous.tools, toolId],
    }));
  };

  const saveCurrentAgent = async () => {
    try {
      setBusy(true);
      const saved = await upsertAgent({
        id: selectedAgent?.id,
        name: form.name,
        purpose: form.purpose,
        tools: form.tools,
        memorySetting: form.memorySetting,
        preferredModel: form.preferredModel,
        status: form.status,
        lastTaskSummary: form.lastTaskSummary,
      });
      setSelectedAgentId(saved.id);
      setStatus(`Saved ${saved.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save agent');
    } finally {
      setBusy(false);
    }
  };

  const handleRun = async () => {
    const agentId = selectedAgent?.id;
    if (!agentId) {
      setStatus('Save an agent first so the run can be attached to it.');
      return;
    }

    try {
      setBusy(true);
      await runTask(agentId, task);
      setStatus('Task completed and saved to the run log.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to run task');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Agent Builder"
        title="Create agents and run simulated orchestration"
        description="Define an agent, choose tools and memory behavior, then execute a realistic mock flow that can later swap to live provider adapters."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="form-field flex-1">
              <span>Load existing agent</span>
              <select
                value={selectedAgentId}
                onChange={(event) => setSelectedAgentId(event.target.value)}
              >
                <option value="">New agent draft</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="ghost-button mt-6" onClick={() => {
              setSelectedAgentId('');
              setForm(defaultForm);
              setStatus('Started a fresh agent draft.');
            }}>
              New draft
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="form-field">
              <span>Agent name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Revenue Intelligence Agent" />
            </label>
            <label className="form-field">
              <span>Purpose</span>
              <textarea
                rows={4}
                value={form.purpose}
                onChange={(event) => setForm({ ...form, purpose: event.target.value })}
                placeholder="Describe what this agent should own and optimize."
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="form-field">
                <span>Memory setting</span>
                <select
                  value={form.memorySetting}
                  onChange={(event) => setForm({ ...form, memorySetting: event.target.value as MemorySetting })}
                >
                  <option value="none">None</option>
                  <option value="shared">Shared</option>
                  <option value="private">Private</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>
              <label className="form-field">
                <span>Preferred model</span>
                <select
                  value={form.preferredModel}
                  onChange={(event) => setForm({ ...form, preferredModel: event.target.value as PreferredModel })}
                >
                  <option value="auto">Auto route</option>
                  <option value="gpt-4.1">GPT</option>
                  <option value="claude-3.7-sonnet">Claude</option>
                  <option value="gemini-1.5-pro">Gemini</option>
                  <option value="llama-3.3-70b">LLaMA / Groq</option>
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm text-slate-200">Tool access</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    className={`rounded-2xl border p-4 text-left text-sm transition ${
                      form.tools.includes(tool.id)
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                    onClick={() => toggleTool(tool.id)}
                  >
                    <p className="font-medium">{tool.name}</p>
                    <p className="mt-2 text-xs text-slate-400">{tool.coverage}</p>
                  </button>
                ))}
              </div>
            </div>

            <button className="primary-button w-full justify-center" type="button" onClick={() => void saveCurrentAgent()} disabled={busy}>
              {busy ? 'Working...' : 'Save agent'}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <h2 className="font-display text-2xl text-white">Task runner</h2>
            <p className="mt-2 text-sm text-slate-300">
              Submit a task and the platform will simulate planning, routing, tools, memory lookup, and final output.
            </p>
            <label className="form-field mt-5">
              <span>Task</span>
              <textarea rows={6} value={task} onChange={(event) => setTask(event.target.value)} />
            </label>
            <button className="primary-button mt-4" type="button" onClick={() => void handleRun()} disabled={busy}>
              {busy ? 'Running orchestration...' : 'Run agent task'}
            </button>
            {status ? <p className="mt-4 text-sm text-cyan-200">{status}</p> : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">Run history</h2>
              <span className="text-sm text-slate-400">{selectedAgent ? selectedAgent.name : 'No agent selected'}</span>
            </div>
            <div className="mt-5 space-y-4">
              {relatedRuns.length ? (
                relatedRuns.map((run) => (
                  <article key={run.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">{run.taskType}</p>
                    <p className="mt-2 text-sm text-white">{run.task}</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {run.orchestration.length ? (
                        run.orchestration.map((step) => (
                          <div key={step.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                            <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-200">{step.phase}</p>
                            <p className="mt-2 text-sm text-white">{step.title}</p>
                            <p className="mt-2 text-xs text-slate-400">{step.detail}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-300 md:col-span-2">
                          {run.finalOutput}
                        </div>
                      )}
                    </div>
                    {run.orchestration.length ? (
                      <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200 whitespace-pre-wrap">
                        {run.finalOutput}
                      </pre>
                    ) : null}
                  </article>
                ))
              ) : (
                <EmptyState title="No runs for this agent yet" description="Save an agent and execute a task to populate the orchestration timeline." />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
