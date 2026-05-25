import { useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAppData } from '../hooks/useAppData';

export const MemoryCenterPage = () => {
  const { memories, agents, createMemory } = useAppData();
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('New operating note');
  const [content, setContent] = useState('Capture a reusable note for future agent runs.');
  const [tags, setTags] = useState('ops, priority');
  const [accessibleAgentIds, setAccessibleAgentIds] = useState<string[]>(agents.slice(0, 1).map((agent) => agent.id));
  const [status, setStatus] = useState<string | null>(null);

  const filteredMemories = memories.filter((memory) => {
    const haystack = `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const toggleAgent = (agentId: string) => {
    setAccessibleAgentIds((previous) =>
      previous.includes(agentId) ? previous.filter((id) => id !== agentId) : [...previous, agentId],
    );
  };

  const handleCreate = async () => {
    try {
      const saved = await createMemory({
        title,
        content,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        accessibleAgentIds,
      });
      setStatus(`Saved "${saved.title}" to memory.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save memory');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Long-Term Context"
        title="Memory center"
        description="Create persistent notes, search historical context, and control which agents can read each memory item."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="font-display text-2xl text-white">Create memory note</h2>
          <div className="mt-5 grid gap-4">
            <label className="form-field">
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="form-field">
              <span>Content</span>
              <textarea rows={5} value={content} onChange={(event) => setContent(event.target.value)} />
            </label>
            <label className="form-field">
              <span>Tags</span>
              <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="roadmap, pitch, security" />
            </label>
            <div>
              <p className="text-sm text-slate-200">Agents with access</p>
              <div className="mt-3 grid gap-3">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    className={`rounded-2xl border p-4 text-left ${
                      accessibleAgentIds.includes(agent.id)
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300'
                    }`}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <p className="font-medium">{agent.name}</p>
                    <p className="mt-2 text-xs text-slate-400">{agent.purpose}</p>
                  </button>
                ))}
              </div>
            </div>
            <button className="primary-button w-full justify-center" type="button" onClick={() => void handleCreate()}>
              Save memory
            </button>
            {status ? <p className="text-sm text-cyan-200">{status}</p> : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-2xl text-white">Saved memories</h2>
              <p className="mt-2 text-sm text-slate-300">Search and inspect persistent notes available to your workspace.</p>
            </div>
            <label className="form-field w-full md:max-w-xs">
              <span>Search</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by title, content, or tag" />
            </label>
          </div>

          <div className="mt-6 space-y-4">
            {filteredMemories.length ? (
              filteredMemories.map((memory) => (
                <article key={memory.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-display text-xl text-white">{memory.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{memory.content}</p>
                    </div>
                    <div className="text-xs text-slate-400">
                      Agents: {memory.accessibleAgentIds.length}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="No matching memories" description="Try a broader search or create the first reusable memory note for this workspace." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
