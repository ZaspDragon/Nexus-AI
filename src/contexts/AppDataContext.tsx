import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { calculateDashboardStats } from '../services/analytics';
import { runMockOrchestration } from '../services/mockOrchestrator';
import {
  defaultWarehouseFacility,
  defaultWarehouseFacilityId,
  getWarehouseFacility,
  warehouseFacilities,
  warehouseFacilityOptions,
  warehouseShiftOptions,
} from '../data/warehouseDemo';
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
  ChatMessage,
  CommandStatus,
  MemoryNote,
  Organization,
  TimelineEvent,
  ToolDefinition,
  WarehouseFacilityData,
  WarehouseFacilityId,
  WarehouseRecommendation,
  WarehouseShift,
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
  facilityOptions: typeof warehouseFacilityOptions;
  shiftOptions: WarehouseShift[];
  selectedFacilityId: WarehouseFacilityId;
  setSelectedFacilityId: (facilityId: WarehouseFacilityId) => void;
  selectedShift: WarehouseShift;
  setSelectedShift: (shift: WarehouseShift) => void;
  selectedWarehouse: WarehouseFacilityData;
  commandFeed: WarehouseRecommendation[];
  timeline: TimelineEvent[];
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  updateRecommendationStatus: (recommendationId: string, status: CommandStatus) => void;
  createTaskFromRecommendation: (recommendationId: string) => string | null;
  askNexus: (prompt: string) => Promise<void>;
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

const cloneFacilityFeed = () =>
  Object.fromEntries(
    Object.entries(warehouseFacilities).map(([facilityId, facility]) => [
      facilityId,
      facility.commandFeed.map((item) => ({ ...item })),
    ]),
  ) as Record<WarehouseFacilityId, WarehouseRecommendation[]>;

const cloneFacilityTimeline = () =>
  Object.fromEntries(
    Object.keys(warehouseFacilities).map((facilityId) => [facilityId, []]),
  ) as unknown as Record<WarehouseFacilityId, TimelineEvent[]>;

const buildIntroMessage = (facility: WarehouseFacilityData): ChatMessage => ({
  id: `intro-${facility.id}`,
  role: 'assistant',
  message: `Ask Nexus AI about ${facility.label}. I can explain receiving risk, labor moves, inventory confidence, dock-to-stock pressure, and the biggest shift threats.`,
});

const buildFacilityChats = () =>
  Object.fromEntries(
    Object.values(warehouseFacilities).map((facility) => [facility.id, [buildIntroMessage(facility)]]),
  ) as Record<WarehouseFacilityId, ChatMessage[]>;

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider = ({ children }: PropsWithChildren) => {
  const { currentUser, mode } = useAuth();
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<WarehouseFacilityId>(defaultWarehouseFacilityId);
  const [selectedShift, setSelectedShift] = useState<WarehouseShift>(defaultWarehouseFacility.overview.shift);
  const [commandFeedByFacility, setCommandFeedByFacility] =
    useState<Record<WarehouseFacilityId, WarehouseRecommendation[]>>(cloneFacilityFeed);
  const [timelineByFacility, setTimelineByFacility] =
    useState<Record<WarehouseFacilityId, TimelineEvent[]>>(cloneFacilityTimeline);
  const [chatByFacility, setChatByFacility] =
    useState<Record<WarehouseFacilityId, ChatMessage[]>>(buildFacilityChats);
  const [chatLoading, setChatLoading] = useState(false);

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

  useEffect(() => {
    setSelectedShift(getWarehouseFacility(selectedFacilityId).overview.shift);
  }, [selectedFacilityId]);

  const selectedWarehouse = useMemo(
    () => getWarehouseFacility(selectedFacilityId),
    [selectedFacilityId],
  );

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

  const pushTimelineEvent = (facilityId: WarehouseFacilityId, event: TimelineEvent) => {
    setTimelineByFacility((previous) => ({
      ...previous,
      [facilityId]: [event, ...previous[facilityId]],
    }));
  };

  const updateRecommendationStatus = (recommendationId: string, status: CommandStatus) => {
    const facilityId = selectedFacilityId;
    let changedTitle = '';
    setCommandFeedByFacility((previous) => ({
      ...previous,
      [facilityId]: previous[facilityId].map((item) => {
        if (item.id !== recommendationId) {
          return item;
        }
        changedTitle = item.title;
        return { ...item, status };
      }),
    }));

    if (changedTitle) {
      pushTimelineEvent(facilityId, {
        id: `timeline-${recommendationId}-${status.toLowerCase()}`,
        time: 'Now',
        department: 'Supervisor Action',
        severity: status === 'Escalated' ? 'Critical' : status === 'Accepted' ? 'High' : 'Low',
        description: `${changedTitle} was marked ${status.toLowerCase()} by the supervisor.`,
      });
    }
  };

  const createTaskFromRecommendation = (recommendationId: string) => {
    const facilityId = selectedFacilityId;
    const item = commandFeedByFacility[facilityId].find((recommendation) => recommendation.id === recommendationId);
    if (!item) {
      return null;
    }

    setCommandFeedByFacility((previous) => ({
      ...previous,
      [facilityId]: previous[facilityId].map((recommendation) =>
        recommendation.id === recommendationId ? { ...recommendation, status: 'Accepted' } : recommendation,
      ),
    }));

    pushTimelineEvent(facilityId, {
      id: `task-${recommendationId}`,
      time: 'Now',
      department: 'Task Queue',
      severity: item.priority === 'Critical' ? 'Critical' : 'Medium',
      description: `Task created from AI action: ${item.recommendation}`,
    });

    return `Task created for ${item.department.toLowerCase()}: ${item.title}.`;
  };

  const askNexus = async (prompt: string) => {
    const facilityId = selectedFacilityId;
    const facility = getWarehouseFacility(facilityId);
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) {
      return;
    }

    setChatByFacility((previous) => ({
      ...previous,
      [facilityId]: [
        ...previous[facilityId],
        { id: `user-${Date.now()}`, role: 'user', message: normalizedPrompt },
      ],
    }));
    setChatLoading(true);

    const preset =
      facility.chatPresets.find((item) => item.prompt.toLowerCase() === normalizedPrompt.toLowerCase()) ??
      facility.chatPresets.find((item) => normalizedPrompt.toLowerCase().includes(item.prompt.toLowerCase().split(' ')[0])) ??
      null;

    await new Promise((resolve) => {
      window.setTimeout(resolve, 420);
    });

    const response =
      preset?.response ??
      `${facility.label} is currently tracking ${facility.commandFeed.length} live AI actions. The fastest supervisor win is to address the highest-priority recommendation and clear the active dock-to-stock risk first.`;

    setChatByFacility((previous) => ({
      ...previous,
      [facilityId]: [
        ...previous[facilityId],
        { id: `assistant-${Date.now()}`, role: 'assistant', message: response },
      ],
    }));
    setChatLoading(false);
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
        facilityOptions: warehouseFacilityOptions,
        shiftOptions: warehouseShiftOptions,
        selectedFacilityId,
        setSelectedFacilityId,
        selectedShift,
        setSelectedShift,
        selectedWarehouse,
        commandFeed: commandFeedByFacility[selectedFacilityId],
        timeline: [...timelineByFacility[selectedFacilityId], ...selectedWarehouse.timeline],
        chatMessages: chatByFacility[selectedFacilityId],
        chatLoading,
        updateRecommendationStatus,
        createTaskFromRecommendation,
        askNexus,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
