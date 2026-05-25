import { createContext, useEffect, useState, type PropsWithChildren } from 'react';
import { calculateDashboardStats } from '../services/analytics';
import { runMockOrchestration } from '../services/mockOrchestrator';
import {
  bootstrapWorkspace,
  loadWorkspace,
  saveAgent,
  saveMemory,
  saveOrganization,
  saveRun,
  saveTool,
  saveUsageLog,
} from '../services/repository';
import { useAuth } from '../hooks/useAuth';
import type {
  Agent,
  MemoryNote,
  Organization,
  ToolDefinition,
  WorkspaceSnapshot,
} from '../types';

interface AppDataContextValue extends WorkspaceSnapshot {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upsertAgent: (
    agent: Omit<Agent, 'id' | 'organizationId' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string },
  ) => Promise<Agent>;
  createMemory: (
    memory: Omit<MemoryNote, 'id' | 'organizationId' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string },
  ) => Promise<MemoryNote>;
  updateTool: (tool: ToolDefinition) => Promise<ToolDefinition>;
  updateOrganization: (organization: Organization) => Promise<Organization>;
  runTask: (agentId: string, task: string) => Promise<void>;
  dashboardStats: ReturnType<typeof calculateDashboardStats>;
}

const emptySnapshot: WorkspaceSnapshot = {
  organization: {
    id: 'org_empty',
    name: 'NEXUS AI',
    subscriptionTier: 'Starter',
    usageLimit: 0,
    teamMembers: [],
    apiKeyPlaceholders: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  agents: [],
  runs: [],
  memories: [],
  tools: [],
  usageLogs: [],
};

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider = ({ children }: PropsWithChildren) => {
  const { currentUser, mode } = useAuth();
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!currentUser) {
      setSnapshot(emptySnapshot);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await bootstrapWorkspace(currentUser, mode);
      const nextSnapshot = await loadWorkspace(currentUser, mode);
      setSnapshot(nextSnapshot);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [currentUser, mode]);

  const upsertAgent = async (
    agent: Omit<Agent, 'id' | 'organizationId' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string },
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    const saved = await saveAgent(currentUser, mode, agent);
    setSnapshot((previous) => ({
      ...previous,
      agents: [saved, ...previous.agents.filter((item) => item.id !== saved.id)].sort(
        (a, b) => b.updatedAt - a.updatedAt,
      ),
    }));
    return saved;
  };

  const createMemory = async (
    memory: Omit<MemoryNote, 'id' | 'organizationId' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string },
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    const saved = await saveMemory(currentUser, mode, memory);
    setSnapshot((previous) => ({
      ...previous,
      memories: [saved, ...previous.memories.filter((item) => item.id !== saved.id)].sort(
        (a, b) => b.createdAt - a.createdAt,
      ),
    }));
    return saved;
  };

  const updateTool = async (tool: ToolDefinition) => {
    if (!currentUser) throw new Error('User not authenticated');
    const saved = await saveTool(currentUser, mode, tool);
    setSnapshot((previous) => ({
      ...previous,
      tools: previous.tools.map((item) => (item.id === saved.id ? saved : item)),
    }));
    return saved;
  };

  const updateOrganization = async (organization: Organization) => {
    if (!currentUser) throw new Error('User not authenticated');
    const saved = await saveOrganization(currentUser, mode, organization);
    setSnapshot((previous) => ({
      ...previous,
      organization: saved,
    }));
    return saved;
  };

  const runTask = async (agentId: string, task: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    const agent = snapshot.agents.find((item) => item.id === agentId);
    if (!agent) throw new Error('Agent not found');

    const result = runMockOrchestration({
      agent,
      task,
      memories: snapshot.memories,
      tools: snapshot.tools,
    });

    const savedRun = await saveRun(currentUser, mode, {
      agentId,
      task,
      taskType: result.taskType,
      status: 'completed',
      modelsUsed: result.modelsUsed,
      subtasks: result.subtasks,
      orchestration: result.orchestration,
      estimatedTokens: result.estimatedTokens,
      estimatedCost: result.estimatedCost,
      finalOutput: result.finalOutput,
    });

    const usage = await saveUsageLog(currentUser, mode, {
      agentId,
      runId: savedRun.id,
      taskType: result.taskType,
      model: result.modelsUsed[0],
      tokensIn: Math.floor(result.estimatedTokens * 0.42),
      tokensOut: Math.floor(result.estimatedTokens * 0.58),
      estimatedCost: result.estimatedCost,
    });

    const updatedAgent = await saveAgent(currentUser, mode, {
      id: agent.id,
      name: agent.name,
      purpose: agent.purpose,
      tools: agent.tools,
      memorySetting: agent.memorySetting,
      preferredModel: agent.preferredModel,
      lastTaskSummary: task,
      status: 'active',
    });

    setSnapshot((previous) => ({
      ...previous,
      agents: [updatedAgent, ...previous.agents.filter((item) => item.id !== updatedAgent.id)].sort(
        (a, b) => b.updatedAt - a.updatedAt,
      ),
      runs: [savedRun, ...previous.runs],
      usageLogs: [usage, ...previous.usageLogs],
    }));
  };

  return (
    <AppDataContext.Provider
      value={{
        ...snapshot,
        loading,
        error,
        refresh,
        upsertAgent,
        createMemory,
        updateTool,
        updateOrganization,
        runTask,
        dashboardStats: calculateDashboardStats(snapshot),
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
