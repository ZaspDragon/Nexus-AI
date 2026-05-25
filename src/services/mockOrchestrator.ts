import { routeTask } from './modelRouter';
import type { Agent, MemoryNote, MockRunResult, OrchestrationStep, ToolDefinition } from '../types';

const createStep = (
  phase: OrchestrationStep['phase'],
  title: string,
  detail: string,
  model?: string,
): OrchestrationStep => ({
  id: `${phase}-${crypto.randomUUID().slice(0, 8)}`,
  phase,
  title,
  detail,
  model,
  durationMs: Math.floor(240 + Math.random() * 820),
  status: 'completed',
});

const sentenceCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const buildSubtasks = (task: string, agent: Agent) => {
  const route = routeTask(task);
  const baseSubtasks = [
    `Clarify the success criteria for ${agent.name}.`,
    `Route the ${route.intent.toLowerCase()} work to the best-fit model path.`,
    `Assemble the response with tool context and memory signals.`,
  ];

  if (route.intent === 'Coding') {
    return [
      'Inspect the requested engineering scope and identify dependencies.',
      'Draft the implementation or code plan for the requested change.',
      'Summarize QA checks, release notes, and rollout risks.',
    ];
  }

  if (route.intent === 'Research') {
    return [
      'Break the question into research themes and source categories.',
      'Collect findings using the most relevant tool path.',
      'Synthesize the findings into an executive-ready recommendation.',
    ];
  }

  if (route.intent === 'Writing') {
    return [
      'Capture audience, objective, and tone requirements.',
      'Draft the content outline and supporting proof points.',
      'Polish the final copy for clarity and actionability.',
    ];
  }

  return baseSubtasks;
};

const estimateTokens = (task: string, subtasks: string[], memoryCount: number) => {
  const inputBase = task.length * 2 + subtasks.join(' ').length;
  const outputBase = 1800 + subtasks.length * 320 + memoryCount * 80;
  return Math.max(2200, inputBase + outputBase);
};

export const runMockOrchestration = ({
  agent,
  task,
  memories,
  tools,
}: {
  agent: Agent;
  task: string;
  memories: MemoryNote[];
  tools: ToolDefinition[];
}): MockRunResult => {
  const accessibleMemories = memories.filter(
    (memory) => memory.accessibleAgentIds.includes(agent.id) || memory.accessibleAgentIds.length === 0,
  );
  const enabledTools = tools.filter((tool) => agent.tools.includes(tool.id) && tool.enabled);
  const primaryRoute = routeTask(task);
  const subtasks = buildSubtasks(task, agent);
  const routedModels = subtasks.map((subtask) => routeTask(subtask).primaryModel);
  const modelsUsed = Array.from(new Set([primaryRoute.primaryModel, ...routedModels]));
  const tokens = estimateTokens(task, subtasks, accessibleMemories.length);
  const cost = Number((tokens / 1000 * 0.065).toFixed(2));

  const orchestration: OrchestrationStep[] = [
    createStep(
      'planning',
      'Task planner split the work',
      `${agent.name} created ${subtasks.length} subtasks around ${sentenceCase(primaryRoute.intent.toLowerCase())}.`,
      'Planner',
    ),
    createStep(
      'routing',
      'Model router assigned the primary path',
      `${primaryRoute.primaryModel} selected first, with ${primaryRoute.backupModel} on standby. ${primaryRoute.rationale}`,
      primaryRoute.primaryModel,
    ),
    createStep(
      'tools',
      'Tool registry resolved available actions',
      enabledTools.length
        ? `Enabled tools for this run: ${enabledTools.map((tool) => tool.name).join(', ')}.`
        : 'No enabled tools were required, so the run stayed in pure orchestration mode.',
      enabledTools[0]?.name,
    ),
    createStep(
      'memory',
      'Memory center surfaced reusable context',
      accessibleMemories.length
        ? `${accessibleMemories.length} memory note(s) were considered, including "${accessibleMemories[0].title}".`
        : 'No matching memories were available, so the run used only the current task context.',
      'Memory lookup',
    ),
    createStep(
      'final',
      'Response pack assembled',
      'Planner output, routed subtask context, tool results, and memory notes were merged into a final answer.',
      primaryRoute.primaryModel,
    ),
  ];

  // Real API calls would be inserted here by replacing this deterministic
  // composer with backend model adapters for OpenAI, Anthropic, Gemini, etc.
  const finalOutput = [
    `Objective: ${task}`,
    '',
    'Execution plan:',
    ...subtasks.map((subtask, index) => `${index + 1}. ${subtask}`),
    '',
    `Primary route: ${primaryRoute.primaryModel} for ${primaryRoute.intent.toLowerCase()} work.`,
    enabledTools.length
      ? `Tool posture: ${enabledTools.map((tool) => tool.name).join(', ')} are available for follow-up actions.`
      : 'Tool posture: No active tools were needed for this pass.',
    accessibleMemories.length
      ? `Memory signal: Reused ${accessibleMemories.length} note(s) to keep the response aligned with prior context.`
      : 'Memory signal: The agent used fresh context only.',
    '',
    'Recommended next step: approve this plan, then swap the mock orchestration adapters for live provider calls when backend keys and server routes are ready.',
  ].join('\n');

  return {
    taskType: primaryRoute.intent,
    subtasks,
    modelsUsed,
    orchestration,
    estimatedTokens: tokens,
    estimatedCost: cost,
    finalOutput,
  };
};
