import { BellRing, BrainCircuit, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AskNexusPanel } from '../components/ui/AskNexusPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { RecommendationCard } from '../components/ui/RecommendationCard';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { TimelineCard } from '../components/ui/TimelineCard';
import { useAppData } from '../hooks/useAppData';

export const CommandCenterPage = () => {
  const {
    selectedWarehouse,
    commandFeed,
    timeline,
    chatMessages,
    chatLoading,
    askNexus,
    updateRecommendationStatus,
    createTaskFromRecommendation,
  } = useAppData();
  const [message, setMessage] = useState<string | null>(null);

  const handleCreateTask = (recommendationId: string) => {
    const nextMessage = createTaskFromRecommendation(recommendationId);
    setMessage(nextMessage ?? 'Task creation was unavailable for this recommendation.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Command Center"
        title="Supervisor action feed with live operational context"
        description="Nexus AI is actively watching dock-to-stock risk, labor balance, downtime, and inventory confidence, then surfacing the next best move with confidence and expected impact."
        action={
          <Link to="/dashboard" className="primary-button">
            Back to command dashboard
          </Link>
        }
      />

      {message ? (
        <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <SurfaceCard
          header={
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Live Command Feed</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">AI recommendations by priority</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Accept, ignore, escalate, or create tasks directly from the feed.
                </p>
              </div>
              <BellRing className="h-5 w-5 text-cyan-200" />
            </div>
          }
        >
          <div className="space-y-4">
            {commandFeed.map((item) => (
              <RecommendationCard
                key={item.id}
                {...item}
                onAccept={() => updateRecommendationStatus(item.id, 'Accepted')}
                onIgnore={() => updateRecommendationStatus(item.id, 'Ignored')}
                onEscalate={() => updateRecommendationStatus(item.id, 'Escalated')}
                onCreateTask={() => handleCreateTask(item.id)}
              />
            ))}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <AskNexusPanel
            prompts={selectedWarehouse.chatPresets}
            messages={chatMessages}
            loading={chatLoading}
            onAsk={askNexus}
          />

          <SurfaceCard
            header={
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">AI Shift Manager</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Recommended supervisor moves</h2>
                </div>
                <BrainCircuit className="h-5 w-5 text-cyan-200" />
              </div>
            }
          >
            <div className="space-y-3">
              {selectedWarehouse.heroSnapshot.map((item) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            header={
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Command Center Checklist</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Run these next</h2>
                </div>
                <ClipboardList className="h-5 w-5 text-cyan-200" />
              </div>
            }
          >
            <div className="space-y-3">
              {[
                'Review all new and escalated AI actions before the next dock wave.',
                'Check whether live labor intelligence still supports the current staffing split.',
                'Confirm the highest-risk door and the highest-risk inventory zone are both covered.',
              ].map((item) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </section>

      <TimelineCard events={timeline.slice(0, 8)} />
    </div>
  );
};
