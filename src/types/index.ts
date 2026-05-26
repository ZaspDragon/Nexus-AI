export type AppMode = 'demo' | 'supabase';

export type MemorySetting = 'none' | 'shared' | 'private' | 'hybrid';

export type PreferredModel =
  | 'auto'
  | 'gpt-4.1'
  | 'claude-3.7-sonnet'
  | 'gemini-1.5-pro'
  | 'llama-3.3-70b';

export type UserRole = 'owner' | 'admin' | 'member';

export type SubscriptionTier = 'Starter' | 'Growth' | 'Business' | 'Enterprise';

export type ToolStatus = 'ready' | 'coming-soon';

export type OrchestrationPhase =
  | 'planning'
  | 'routing'
  | 'tools'
  | 'memory'
  | 'final';

export interface UserProfile {
  uid: string;
  organizationId: string;
  displayName: string;
  email: string;
  role: UserRole;
  demoMode: boolean;
}

export interface Agent {
  id: string;
  organizationId: string;
  ownerId: string;
  name: string;
  purpose: string;
  tools: string[];
  memorySetting: MemorySetting;
  preferredModel: PreferredModel;
  status: 'draft' | 'active';
  createdAt: number;
  updatedAt: number;
  lastTaskSummary?: string;
}

export interface MemoryNote {
  id: string;
  organizationId: string;
  ownerId: string;
  title: string;
  content: string;
  tags: string[];
  accessibleAgentIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ToolDefinition {
  id: string;
  organizationId: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  status: ToolStatus;
  coverage: string;
}

export interface UsageLog {
  id: string;
  organizationId: string;
  ownerId: string;
  agentId: string;
  runId: string;
  taskType: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  estimatedCost: number;
  createdAt: number;
}

export interface Organization {
  id: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  usageLimit: number;
  teamMembers: string[];
  apiKeyPlaceholders: Array<{
    provider: string;
    status: 'Not configured' | 'Backend secret required';
  }>;
  createdAt: number;
  updatedAt: number;
}

export interface OrchestrationStep {
  id: string;
  phase: OrchestrationPhase;
  title: string;
  detail: string;
  model?: string;
  durationMs: number;
  status: 'completed' | 'simulated';
}

export interface AgentRun {
  id: string;
  organizationId: string;
  ownerId: string;
  agentId: string;
  task: string;
  taskType: string;
  status: 'completed';
  modelsUsed: string[];
  subtasks: string[];
  orchestration: OrchestrationStep[];
  estimatedTokens: number;
  estimatedCost: number;
  finalOutput: string;
  createdAt: number;
}

export interface WorkspaceSnapshot {
  organization: Organization;
  agents: Agent[];
  runs: AgentRun[];
  memories: MemoryNote[];
  tools: ToolDefinition[];
  usageLogs: UsageLog[];
}

export interface DemoDataset extends WorkspaceSnapshot {
  users: UserProfile[];
}

export interface RouteDecision {
  intent: string;
  complexity: 'simple' | 'moderate' | 'complex';
  primaryModel: string;
  backupModel: string;
  rationale: string;
}

export interface MockRunResult {
  taskType: string;
  subtasks: string[];
  modelsUsed: string[];
  orchestration: OrchestrationStep[];
  estimatedTokens: number;
  estimatedCost: number;
  finalOutput: string;
}
