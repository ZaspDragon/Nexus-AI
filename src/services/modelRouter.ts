import type { RouteDecision } from '../types';

const includesOneOf = (value: string, words: string[]) =>
  words.some((word) => value.includes(word));

export const routeTask = (task: string): RouteDecision => {
  const normalized = task.toLowerCase();
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  let complexity: RouteDecision['complexity'] = 'moderate';
  if (wordCount < 10) complexity = 'simple';
  if (wordCount > 40 || includesOneOf(normalized, ['strategy', 'multi-step', 'roadmap', 'architecture'])) {
    complexity = 'complex';
  }

  if (includesOneOf(normalized, ['research', 'analyze market', 'compare vendors', 'competitor'])) {
    return {
      intent: 'Research',
      complexity,
      primaryModel: 'Gemini',
      backupModel: 'Claude',
      rationale: 'Long-context research tasks benefit from Gemini-style synthesis and source-heavy summarization.',
    };
  }

  if (includesOneOf(normalized, ['write', 'draft', 'email', 'proposal', 'copy', 'narrative'])) {
    return {
      intent: 'Writing',
      complexity,
      primaryModel: 'Claude',
      backupModel: 'GPT',
      rationale: 'Writing tasks prefer Claude for tone control, editing quality, and structured prose.',
    };
  }

  if (includesOneOf(normalized, ['code', 'bug', 'refactor', 'function', 'component', 'api'])) {
    return {
      intent: 'Coding',
      complexity,
      primaryModel: 'GPT',
      backupModel: 'Claude',
      rationale: 'Coding tasks route to GPT first for implementation fluency, with Claude as a strong fallback.',
    };
  }

  if (complexity === 'simple' || includesOneOf(normalized, ['quick', 'fast', 'simple', 'short'])) {
    return {
      intent: 'Fast task',
      complexity: 'simple',
      primaryModel: 'LLaMA / Groq',
      backupModel: 'GPT',
      rationale: 'Low-latency requests go to a fast open-weight route to keep response time and cost low.',
    };
  }

  if (complexity === 'complex' || includesOneOf(normalized, ['plan', 'orchestrate', 'strategy', 'roadmap'])) {
    return {
      intent: 'Complex planning',
      complexity: 'complex',
      primaryModel: 'Claude',
      backupModel: 'GPT',
      rationale: 'Multi-step planning benefits from stronger reasoning, decomposition, and checkpointing.',
    };
  }

  return {
    intent: 'General reasoning',
    complexity,
    primaryModel: 'Claude',
    backupModel: 'GPT',
    rationale: 'General-purpose coordination defaults to a reasoning-first orchestration path.',
  };
};
