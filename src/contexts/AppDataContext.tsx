import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { calculateDashboardStats } from '../services/analytics';
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
import { runMockOrchestration } from '../services/mockOrchestrator';
import {
  fetchLiveFacilityState,
  isLiveOpsConfigured,
  simulateLiveScenario as simulateLiveScenarioRequest,
  subscribeToLiveFacility,
} from '../services/liveOps';
import type {
  Agent,
  ChatMessage,
  CommandStatus,
  LiveConnectionStatus,
  LiveConnectorStatus,
  LiveFacilitySnapshot,
  LiveOpsMode,
  LiveSimulationScenario,
  MemoryNote,
  Organization,
  TimelineEvent,
  ToolDefinition,
  WarehouseFacilityData,
  WarehouseFacilityId,
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
  commandFeed: WarehouseFacilityData['commandFeed'];
  timeline: WarehouseFacilityData['timeline'];
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  updateRecommendationStatus: (recommendationId: string, status: CommandStatus) => void;
  createTaskFromRecommendation: (recommendationId: string) => string | null;
  askNexus: (prompt: string) => Promise<void>;
  liveOpsConfigured: boolean;
  liveOpsMode: LiveOpsMode;
  liveConnectionStatus: LiveConnectionStatus;
  liveConnectors: LiveConnectorStatus[];
  lastLiveUpdate: string | null;
  runLiveSimulation: (scenario?: LiveSimulationScenario) => Promise<string | null>;
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

const cloneWarehouseState = () =>
  Object.fromEntries(
    Object.entries(warehouseFacilities).map(([facilityId, facility]) => [facilityId, structuredClone(facility)]),
  ) as Record<WarehouseFacilityId, WarehouseFacilityData>;

const buildIntroMessage = (facility: WarehouseFacilityData): ChatMessage => ({
  id: `intro-${facility.id}`,
  role: 'assistant',
  message: `Ask Nexus AI about ${facility.label}. I can explain receiving risk, labor moves, inventory confidence, dock-to-stock pressure, and the biggest shift threats.`,
});

const buildFacilityChats = () =>
  Object.fromEntries(
    Object.values(warehouseFacilities).map((facility) => [facility.id, [buildIntroMessage(facility)]]),
  ) as Record<WarehouseFacilityId, ChatMessage[]>;

const buildConnectionState = <T,>(value: T) =>
  Object.fromEntries(
    warehouseFacilityOptions.map((facility) => [facility.id, value]),
  ) as Record<WarehouseFacilityId, T>;

export const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider = ({ children }: PropsWithChildren) => {
  const { currentUser, mode } = useAuth();
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<WarehouseFacilityId>(defaultWarehouseFacilityId);
  const [selectedShift, setSelectedShift] = useState<WarehouseShift>(defaultWarehouseFacility.overview.shift);
  const [warehouseByFacility, setWarehouseByFacility] =
    useState<Record<WarehouseFacilityId, WarehouseFacilityData>>(cloneWarehouseState);
  const [chatByFacility, setChatByFacility] =
    useState<Record<WarehouseFacilityId, ChatMessage[]>>(buildFacilityChats);
  const [chatLoading, setChatLoading] = useState(false);
  const [liveModeByFacility, setLiveModeByFacility] =
    useState<Record<WarehouseFacilityId, LiveOpsMode>>(buildConnectionState('demo'));
  const [liveStatusByFacility, setLiveStatusByFacility] =
    useState<Record<WarehouseFacilityId, LiveConnectionStatus>>(buildConnectionState('disconnected'));
  const [connectorsByFacility, setConnectorsByFacility] =
    useState<Record<WarehouseFacilityId, LiveConnectorStatus[]>>(buildConnectionState([] as LiveConnectorStatus[]));
  const [lastLiveUpdateByFacility, setLastLiveUpdateByFacility] =
    useState<Record<WarehouseFacilityId, string | null>>(buildConnectionState(null as string | null));

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

  const applyLiveSnapshot = (facilityId: WarehouseFacilityId, snapshotPayload: LiveFacilitySnapshot) => {
    setWarehouseByFacility((previous) => ({
      ...previous,
      [facilityId]: snapshotPayload.facility,
    }));
    setConnectorsByFacility((previous) => ({
      ...previous,
      [facilityId]: snapshotPayload.connectors,
    }));
    setLastLiveUpdateByFacility((previous) => ({
      ...previous,
      [facilityId]: snapshotPayload.lastUpdated,
    }));
    setLiveModeByFacility((previous) => ({
      ...previous,
      [facilityId]: 'live',
    }));
  };

  useEffect(() => {
    if (!isLiveOpsConfigured) {
      setLiveStatusByFacility((previous) => ({
        ...previous,
        [selectedFacilityId]: 'disconnected',
      }));
      return;
    }

    let active = true;
    setLiveStatusByFacility((previous) => ({
      ...previous,
      [selectedFacilityId]: 'connecting',
    }));

    void fetchLiveFacilityState(selectedFacilityId)
      .then((snapshotPayload) => {
        if (!active) {
          return;
        }
        applyLiveSnapshot(selectedFacilityId, snapshotPayload);
        setLiveStatusByFacility((previous) => ({
          ...previous,
          [selectedFacilityId]: 'connected',
        }));
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setLiveStatusByFacility((previous) => ({
          ...previous,
          [selectedFacilityId]: 'fallback',
        }));
      });

    const unsubscribe = subscribeToLiveFacility(selectedFacilityId, {
      onSnapshot: (snapshotPayload) => {
        if (!active) {
          return;
        }
        applyLiveSnapshot(selectedFacilityId, snapshotPayload);
      },
      onStatusChange: (status) => {
        if (!active) {
          return;
        }
        setLiveStatusByFacility((previous) => ({
          ...previous,
          [selectedFacilityId]: status,
        }));
      },
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [selectedFacilityId]);

  const selectedWarehouse = useMemo(
    () => warehouseByFacility[selectedFacilityId] ?? getWarehouseFacility(selectedFacilityId),
    [selectedFacilityId, warehouseByFacility],
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
    setWarehouseByFacility((previous) => ({
      ...previous,
      [facilityId]: {
        ...previous[facilityId],
        timeline: [event, ...previous[facilityId].timeline].slice(0, 12),
      },
    }));
  };

  const updateRecommendationStatus = (recommendationId: string, status: CommandStatus) => {
    const facilityId = selectedFacilityId;
    let changedTitle = '';
    setWarehouseByFacility((previous) => ({
      ...previous,
      [facilityId]: {
        ...previous[facilityId],
        commandFeed: previous[facilityId].commandFeed.map((item) => {
          if (item.id !== recommendationId) {
            return item;
          }
          changedTitle = item.title;
          return { ...item, status };
        }),
      },
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
    const item = selectedWarehouse.commandFeed.find((recommendation) => recommendation.id === recommendationId);
    if (!item) {
      return null;
    }

    setWarehouseByFacility((previous) => ({
      ...previous,
      [facilityId]: {
        ...previous[facilityId],
        commandFeed: previous[facilityId].commandFeed.map((recommendation) =>
          recommendation.id === recommendationId ? { ...recommendation, status: 'Accepted' } : recommendation,
        ),
      },
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
      selectedWarehouse.chatPresets.find((item) => item.prompt.toLowerCase() === normalizedPrompt.toLowerCase()) ??
      selectedWarehouse.chatPresets.find((item) =>
        normalizedPrompt.toLowerCase().includes(item.prompt.toLowerCase().split(' ')[0]),
      ) ??
      null;

    await new Promise((resolve) => {
      window.setTimeout(resolve, 420);
    });

    const response =
      preset?.response ??
      `${selectedWarehouse.label} is currently tracking ${selectedWarehouse.commandFeed.length} live AI actions. The fastest supervisor win is to address the highest-priority recommendation and clear the top dock-to-stock risk first.`;

    setChatByFacility((previous) => ({
      ...previous,
      [facilityId]: [
        ...previous[facilityId],
        { id: `assistant-${Date.now()}`, role: 'assistant', message: response },
      ],
    }));
    setChatLoading(false);
  };

  const runLiveSimulation = async (scenario: LiveSimulationScenario = 'mixed') => {
    if (!isLiveOpsConfigured) {
      return 'Configure VITE_NEXUS_LIVE_OPS_URL to test live ingestion.';
    }

    try {
      const snapshotPayload = await simulateLiveScenarioRequest(selectedFacilityId, scenario);
      applyLiveSnapshot(selectedFacilityId, snapshotPayload);
      setLiveStatusByFacility((previous) => ({
        ...previous,
        [selectedFacilityId]: 'connected',
      }));
      return `Live ${scenario} scenario injected for ${selectedWarehouse.label}.`;
    } catch (simulationError) {
      return simulationError instanceof Error ? simulationError.message : 'Unable to run live simulation.';
    }
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
        commandFeed: selectedWarehouse.commandFeed,
        timeline: selectedWarehouse.timeline,
        chatMessages: chatByFacility[selectedFacilityId],
        chatLoading,
        updateRecommendationStatus,
        createTaskFromRecommendation,
        askNexus,
        liveOpsConfigured: isLiveOpsConfigured,
        liveOpsMode: liveModeByFacility[selectedFacilityId],
        liveConnectionStatus: liveStatusByFacility[selectedFacilityId],
        liveConnectors: connectorsByFacility[selectedFacilityId],
        lastLiveUpdate: lastLiveUpdateByFacility[selectedFacilityId],
        runLiveSimulation,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
