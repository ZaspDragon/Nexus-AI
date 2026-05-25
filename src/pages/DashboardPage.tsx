import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { useAppData } from '../hooks/useAppData';

export const DashboardPage = () => {
  const { dashboardStats, agents, runs, memories, tools } = useAppData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="NEXUS mission control"
        description="Monitor your orchestration stack, recent runs, memory footprint, and model operating costs from one dashboard."
        action={
          <Link className="primary-button" to="/workspace">
            Create or run an agent
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total agents" value={String(dashboardStats.totalAgents)} helper="Configured across your org" />
        <StatCard label="Tasks completed" value={String(dashboardStats.tasksCompleted)} helper="Saved mock runs" />
        <StatCard label="Estimated monthly cost" value={`$${dashboardStats.estimatedMonthlyCost}`} helper="Based on simulated usage" />
        <StatCard label="Saved memories" value={String(dashboardStats.savedMemories)} helper="Persistent notes available to agents" />
        <StatCard label="Active tools" value={String(dashboardStats.activeTools)} helper="Enabled registry integrations" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl text-white">Active agents</h2>
              <p className="mt-2 text-sm text-slate-300">Each agent keeps its own purpose, memory posture, tools, and preferred model.</p>
            </div>
            <Link className="ghost-button" to="/workspace">
              Manage agents
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {agents.length ? (
              agents.map((agent) => (
                <article key={agent.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-display text-xl text-white">{agent.name}</h3>
                      <p className="mt-2 text-sm text-slate-300">{agent.purpose}</p>
                    </div>
                    <div className="text-sm text-slate-300">
                      <p>Model: {agent.preferredModel}</p>
                      <p className="mt-1">Memory: {agent.memorySetting}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {agent.tools.map((toolId) => {
                      const tool = tools.find((item) => item.id === toolId);
                      return (
                        <span key={toolId} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                          {tool?.name ?? toolId}
                        </span>
                      );
                    })}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No agents yet" description="Create your first AI agent in the workspace to populate orchestration metrics." />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <h2 className="font-display text-2xl text-white">Recent orchestration runs</h2>
            <div className="mt-5 space-y-4">
              {runs.length ? (
                runs.slice(0, 4).map((run) => (
                  <div key={run.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/75">{run.taskType}</p>
                    <p className="mt-2 text-sm text-white">{run.task}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      {run.modelsUsed.join(' + ')} • {run.subtasks.length} subtasks • ${run.estimatedCost}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState title="No runs yet" description="Run a task from the Agent Workspace to see orchestration history here." />
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <h2 className="font-display text-2xl text-white">Memory pulse</h2>
            <div className="mt-5 space-y-4">
              {memories.slice(0, 3).map((memory) => (
                <div key={memory.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white">{memory.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{memory.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
