import { Bot, LoaderCircle, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ChatMessage, ChatPreset } from '../../types';
import { SurfaceCard } from './SurfaceCard';

export const AskNexusPanel = ({
  prompts,
  messages,
  loading,
  onAsk,
}: {
  prompts: ChatPreset[];
  messages: ChatMessage[];
  loading: boolean;
  onAsk: (prompt: string) => Promise<void>;
}) => {
  const [draft, setDraft] = useState('');
  const quickPrompts = useMemo(() => prompts.slice(0, 5), [prompts]);

  const handleSubmit = async () => {
    const nextPrompt = draft.trim();
    if (!nextPrompt || loading) {
      return;
    }
    setDraft('');
    await onAsk(nextPrompt);
  };

  return (
    <SurfaceCard
      className="h-full"
      header={
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Ask Nexus AI</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Supervisor assistant</h2>
            <p className="mt-2 text-sm text-slate-300">Ask why the shift is drifting, who to move, or what risk matters most.</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-3">
            <Bot className="h-5 w-5 text-cyan-200" />
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((preset) => (
            <button
              key={preset.prompt}
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:border-cyan-400/30 hover:bg-cyan-400/10"
              onClick={() => void onAsk(preset.prompt)}
              disabled={loading}
            >
              {preset.prompt}
            </button>
          ))}
        </div>

        <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-[20px] px-4 py-3 text-sm leading-6 ${
                message.role === 'assistant'
                  ? 'border border-cyan-400/10 bg-cyan-400/8 text-slate-100'
                  : 'border border-white/10 bg-white/5 text-slate-200'
              }`}
            >
              <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                {message.role === 'assistant' ? 'Nexus AI' : 'Supervisor'}
              </p>
              {message.message}
            </div>
          ))}
          {loading ? (
            <div className="flex items-center gap-3 rounded-[20px] border border-cyan-400/10 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-100">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Thinking through the shift conditions...
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
            placeholder="Ask about receiving, labor, bottlenecks, or shift risk..."
          />
          <button type="button" className="primary-button" onClick={() => void handleSubmit()} disabled={loading}>
            <Send className="h-4 w-4" />
            Ask Nexus AI
          </button>
        </div>
      </div>
    </SurfaceCard>
  );
};
