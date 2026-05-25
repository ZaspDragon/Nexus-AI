import type {
  Agent,
  AgentRun,
  DemoDataset,
  MemoryNote,
  Organization,
  ToolDefinition,
  UsageLog,
  UserProfile,
} from '../types';

const now = Date.now();

const createId = (prefix: string, suffix: string) => `${prefix}_${suffix}`;

const toolCatalog = (
  organizationId: string,
  ownerId: string,
): ToolDefinition[] => [
  {
    id: 'web-search',
    organizationId,
    ownerId,
    name: 'Web Search',
    description: 'Browse external sources for research-heavy subtasks.',
    category: 'Research',
    enabled: true,
    status: 'ready',
    coverage: 'Research, competitor scans, sourcing',
  },
  {
    id: 'email',
    organizationId,
    ownerId,
    name: 'Email',
    description: 'Draft outbound messages and summarize inbox context.',
    category: 'Communications',
    enabled: true,
    status: 'ready',
    coverage: 'Outreach, summaries, follow-ups',
  },
  {
    id: 'calendar',
    organizationId,
    ownerId,
    name: 'Calendar',
    description: 'Schedule task dependencies and plan executive workflows.',
    category: 'Operations',
    enabled: false,
    status: 'ready',
    coverage: 'Scheduling, reminders, coordination',
  },
  {
    id: 'crm',
    organizationId,
    ownerId,
    name: 'CRM',
    description: 'Enrich customer records and update pipeline notes.',
    category: 'Revenue',
    enabled: false,
    status: 'ready',
    coverage: 'Deal support, account context',
  },
  {
    id: 'file-reader',
    organizationId,
    ownerId,
    name: 'File Reader',
    description: 'Parse uploaded briefs, PDFs, and internal docs.',
    category: 'Knowledge',
    enabled: true,
    status: 'ready',
    coverage: 'Docs, briefs, reports',
  },
  {
    id: 'code-executor',
    organizationId,
    ownerId,
    name: 'Code Executor',
    description: 'Run isolated code snippets for demos and analysis.',
    category: 'Engineering',
    enabled: true,
    status: 'ready',
    coverage: 'Scripts, transforms, QA checks',
  },
  {
    id: 'spreadsheet-analyzer',
    organizationId,
    ownerId,
    name: 'Spreadsheet Analyzer',
    description: 'Inspect KPI sheets and output executive summaries.',
    category: 'Analytics',
    enabled: true,
    status: 'ready',
    coverage: 'KPIs, tabular summaries, budgets',
  },
];

export const buildDemoDataset = (profile: UserProfile): DemoDataset => {
  const organization: Organization = {
    id: profile.organizationId,
    name: 'NEXUS Ventures',
    subscriptionTier: 'Business',
    usageLimit: 2500000,
    teamMembers: ['Avery Chen', 'Jordan Miller', 'Taylor Singh'],
    apiKeyPlaceholders: [
      { provider: 'OpenAI', status: 'Backend secret required' },
      { provider: 'Anthropic', status: 'Backend secret required' },
      { provider: 'Google AI', status: 'Backend secret required' },
      { provider: 'Groq', status: 'Backend secret required' },
    ],
    createdAt: now - 1000 * 60 * 60 * 24 * 30,
    updatedAt: now,
  };

  const agents: Agent[] = [
    {
      id: createId('agent', 'ops-orchestrator'),
      organizationId: profile.organizationId,
      ownerId: profile.uid,
      name: 'Ops Orchestrator',
      purpose: 'Coordinate launch plans, summarize dependencies, and keep stakeholders aligned.',
      tools: ['web-search', 'calendar', 'file-reader', 'spreadsheet-analyzer'],
      memorySetting: 'hybrid',
      preferredModel: 'claude-3.7-sonnet',
      status: 'active',
      createdAt: now - 1000 * 60 * 60 * 24 * 10,
      updatedAt: now - 1000 * 60 * 60 * 8,
      lastTaskSummary: 'Prepared a launch-readiness brief for the GTM team.',
    },
    {
      id: createId('agent', 'code-pilot'),
      organizationId: profile.organizationId,
      ownerId: profile.uid,
      name: 'Code Pilot',
      purpose: 'Break engineering asks into implementation steps, code tasks, and QA handoff notes.',
      tools: ['code-executor', 'file-reader', 'web-search'],
      memorySetting: 'shared',
      preferredModel: 'gpt-4.1',
      status: 'active',
      createdAt: now - 1000 * 60 * 60 * 24 * 20,
      updatedAt: now - 1000 * 60 * 60 * 3,
      lastTaskSummary: 'Drafted a migration plan for a billing webhook refactor.',
    },
  ];

  const memories: MemoryNote[] = [
    {
      id: createId('memory', 'investor-narrative'),
      organizationId: profile.organizationId,
      ownerId: profile.uid,
      title: 'Investor narrative',
      content:
        'Lead with orchestration intelligence, demo-mode safety, and the ability to swap mock model calls for live providers without rebuilding the product.',
      tags: ['pitch', 'positioning'],
      accessibleAgentIds: [agents[0].id, agents[1].id],
      createdAt: now - 1000 * 60 * 60 * 24 * 7,
      updatedAt: now - 1000 * 60 * 60 * 20,
    },
    {
      id: createId('memory', 'security-guardrail'),
      organizationId: profile.organizationId,
      ownerId: profile.uid,
      title: 'Security guardrail',
      content:
        'Never surface raw API keys in the client. Route live calls through a backend function or server route and keep demo mode fully deterministic.',
      tags: ['security', 'firebase'],
      accessibleAgentIds: [agents[0].id],
      createdAt: now - 1000 * 60 * 60 * 24 * 4,
      updatedAt: now - 1000 * 60 * 60 * 12,
    },
  ];

  const runs: AgentRun[] = [
    {
      id: createId('run', 'launch-readiness'),
      organizationId: profile.organizationId,
      ownerId: profile.uid,
      agentId: agents[0].id,
      task: 'Create a launch readiness brief for our investor demo next Tuesday.',
      taskType: 'Planning',
      status: 'completed',
      modelsUsed: ['Claude', 'Gemini'],
      subtasks: [
        'Map the workstream milestones.',
        'Review supporting material from memory.',
        'Draft the final readiness summary.',
      ],
      orchestration: [],
      estimatedTokens: 6280,
      estimatedCost: 0.41,
      finalOutput:
        'Launch brief delivered with milestone owners, risk log, and recommended next actions.',
      createdAt: now - 1000 * 60 * 60 * 18,
    },
  ];

  const usageLogs: UsageLog[] = [
    {
      id: createId('usage', 'launch-readiness'),
      organizationId: profile.organizationId,
      ownerId: profile.uid,
      agentId: agents[0].id,
      runId: runs[0].id,
      taskType: 'Planning',
      model: 'Claude',
      tokensIn: 2420,
      tokensOut: 3860,
      estimatedCost: 0.41,
      createdAt: runs[0].createdAt,
    },
    {
      id: createId('usage', 'code-pilot'),
      organizationId: profile.organizationId,
      ownerId: profile.uid,
      agentId: agents[1].id,
      runId: createId('run', 'billing-refactor'),
      taskType: 'Coding',
      model: 'GPT',
      tokensIn: 2140,
      tokensOut: 2900,
      estimatedCost: 0.34,
      createdAt: now - 1000 * 60 * 60 * 36,
    },
  ];

  return {
    users: [profile],
    organization,
    agents,
    runs,
    memories,
    tools: toolCatalog(profile.organizationId, profile.uid),
    usageLogs,
  };
};
