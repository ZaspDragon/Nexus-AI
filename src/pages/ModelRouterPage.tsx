import { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { routeTask } from '../services/modelRouter';

const samplePrompts = [
  'Research three competitors in the healthcare automation market and summarize their strengths.',
  'Write a crisp follow-up email to investors after a product demo.',
  'Refactor the React dashboard card component and explain the API changes.',
  'Quickly summarize this short support request for the team.',
  'Plan a complex cross-functional product launch with engineering, sales, and finance owners.',
];

export const ModelRouterPage = () => {
  const [task, setTask] = useState(samplePrompts[0]);
  const route = routeTask(task);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Routing Logic"
        title="Model router demo"
        description="This page demonstrates the deterministic mock routing layer that can later be replaced with backend model policies and provider health checks."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <label className="form-field">
            <span>Task to route</span>
            <textarea rows={7} value={task} onChange={(event) => setTask(event.target.value)} />
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400/30 hover:bg-cyan-400/10"
                onClick={() => setTask(prompt)}
              >
                Load example
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="font-display text-2xl text-white">Routing outcome</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/10 p-5">
              <p className="text-sm text-cyan-100">Primary model</p>
              <p className="mt-3 font-display text-3xl text-white">{route.primaryModel}</p>
              <p className="mt-3 text-sm text-slate-100">{route.intent}</p>
            </div>
            <div className="rounded-3xl border border-fuchsia-400/25 bg-fuchsia-400/10 p-5">
              <p className="text-sm text-fuchsia-100">Backup model</p>
              <p className="mt-3 font-display text-3xl text-white">{route.backupModel}</p>
              <p className="mt-3 text-sm text-slate-100">Complexity: {route.complexity}</p>
            </div>
          </div>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">{route.rationale}</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-display text-xl text-white">Policy map</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Research → Gemini</li>
                <li>Writing → Claude</li>
                <li>Coding → GPT</li>
                <li>Fast/simple tasks → LLaMA/Groq</li>
                <li>Complex planning → Claude or GPT</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-display text-xl text-white">Swap-in point</h3>
              <p className="mt-4 text-sm text-slate-300">
                Replace this mock policy with a server-side router that considers model availability, rate limits, enterprise rules, and cost ceilings.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
