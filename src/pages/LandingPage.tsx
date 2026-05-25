import { ArrowRight, BrainCircuit, Shield, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Agent orchestration',
    description: 'Compose planners, routers, tools, and memory into one repeatable runtime.',
    icon: Workflow,
  },
  {
    title: 'Model-aware routing',
    description: 'Send research to Gemini, writing to Claude, coding to GPT, and speed tasks to Groq-class models.',
    icon: BrainCircuit,
  },
  {
    title: 'Enterprise-safe foundation',
    description: 'Firebase-ready data isolation, explicit demo mode, and no client-side secrets.',
    icon: Shield,
  },
];

export const LandingPage = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.2),_transparent_32%),linear-gradient(165deg,#020617,#0f172a_45%,#020617)] px-6 py-10 text-slate-100">
    <div className="mx-auto max-w-6xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/80">NEXUS AI</p>
          <h1 className="mt-3 font-display text-2xl text-white">Agentic AI orchestration platform</h1>
        </div>
        <div className="flex gap-3">
          <Link className="ghost-button" to="/auth">
            Sign in
          </Link>
          <Link className="primary-button" to="/auth">
            Launch demo
          </Link>
        </div>
      </header>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_rgba(8,15,40,0.45)] backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Multi-model runtime</p>
          <h2 className="mt-5 font-display text-5xl leading-tight text-white md:text-7xl">
            Build, route, and demo AI agents without waiting on production keys.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            NEXUS AI lets teams create agents, simulate orchestration, persist runs, and present an
            investor-ready control plane while leaving the live model adapters safely behind the curtain.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="primary-button" to="/auth">
              Enter platform
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a className="ghost-button" href="#platform-tour">
              View platform tour
            </a>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6">
            <p className="text-sm text-cyan-100">Demo flow</p>
            <div className="mt-5 space-y-3 text-sm text-slate-100">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">1. Planning</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">2. Model routing</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">3. Tool use</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">4. Memory lookup</div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">5. Final output</div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-fuchsia-400/20 bg-fuchsia-400/10 p-6">
            <p className="text-sm text-fuchsia-100">Key promise</p>
            <h3 className="mt-4 font-display text-3xl text-white">$0 API risk in demo mode</h3>
            <p className="mt-3 text-sm text-slate-200">
              Keep the entire workflow functional for demos, onboarding, and validation before wiring backend model providers.
            </p>
          </div>
        </div>
      </section>

      <section id="platform-tour" className="mt-16 grid gap-5 md:grid-cols-3">
        {featureCards.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6">
              <div className="inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                <Icon className="h-5 w-5 text-cyan-200" />
              </div>
              <h3 className="mt-6 font-display text-2xl text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  </div>
);
