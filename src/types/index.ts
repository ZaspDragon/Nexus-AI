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

export type WarehouseFacilityId = 'columbus-dc' | 'dallas-hub' | 'atlanta-dc';

export type WarehouseShift = 'Day Shift' | 'Swing Shift' | 'Night Shift';

export type OperationalTone = 'healthy' | 'watch' | 'urgent';

export type CommandPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type CommandStatus = 'New' | 'Accepted' | 'Ignored' | 'Escalated';

export interface WarehouseSelectorOption {
  id: WarehouseFacilityId;
  label: string;
  region: string;
}

export interface WarehouseWorker {
  name: string;
  role: string;
  zone: string;
  status: string;
  throughput: string;
  utilization: string;
  note: string;
}

export interface WarehouseRecommendation {
  id: string;
  title: string;
  timestamp: string;
  department: string;
  priority: CommandPriority;
  confidence: number;
  recommendation: string;
  impact: string;
  status: CommandStatus;
}

export interface ShiftHealthFactor {
  label: string;
  score: number;
  status: 'Healthy' | 'Watch' | 'Urgent';
  detail: string;
}

export interface ShiftHealthScore {
  score: number;
  summary: string;
  factors: ShiftHealthFactor[];
}

export interface WarehouseMapZone {
  id: string;
  label: string;
  detail: string;
  tone: OperationalTone;
  span: string;
  type: 'dock' | 'receiving' | 'picking' | 'inventory' | 'congestion';
  activeAlert?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  department: string;
  severity: CommandPriority;
  description: string;
}

export interface PredictiveInsight {
  id: string;
  title: string;
  value: string;
  tone: OperationalTone;
  detail: string;
  outlook: string;
}

export interface ComparisonMetric {
  id: string;
  label: string;
  delta: string;
  direction: 'up' | 'down';
  detail: string;
}

export interface ChartSeries {
  labels: string[];
  values: number[];
  target?: number;
  suffix?: string;
}

export interface WarehouseReportCard {
  id: string;
  title: string;
  description: string;
  metrics: string[];
  chart: ChartSeries;
}

export interface ChatPreset {
  prompt: string;
  response: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
}

export interface WarehouseReceivingLane {
  lane: string;
  trailer: string;
  progress: number;
  eta: string;
  owner: string;
  status: string;
}

export interface WarehouseInventoryZone {
  zone: string;
  accuracy: number;
  issue: string;
  action: string;
}

export interface WarehouseLaborSegment {
  team: string;
  staffed: number;
  planned: number;
  utilization: number;
  note: string;
}

export interface WarehouseDowntimeEvent {
  area: string;
  duration: number;
  cause: string;
  owner: string;
  state: 'Open' | 'Monitoring' | 'Closed';
}

export interface WarehouseOverview {
  siteName: string;
  shift: WarehouseShift;
  shiftWindow: string;
  supervisors: string[];
  activeWorkers: { current: number; target: number; delta: string };
  dockStatus: { activeDoors: number; totalDoors: number; detail: string };
  receivingProgress: { completed: number; total: number; targetMinutes: string };
  inventoryAccuracy: { value: number; detail: string };
  downtimeAlerts: { open: number; threshold: string; detail: string };
  picksPerHour: { value: number; target: number; trend: string };
  laborUtilization: { value: number; target: number; detail: string };
  aiRecommendations: number;
}

export interface WarehouseFacilityData {
  id: WarehouseFacilityId;
  label: string;
  region: string;
  overview: WarehouseOverview;
  heroSnapshot: string[];
  shiftHealth: ShiftHealthScore;
  commandFeed: WarehouseRecommendation[];
  receivingLanes: WarehouseReceivingLane[];
  inventoryZones: WarehouseInventoryZone[];
  laborSegments: WarehouseLaborSegment[];
  downtimeEvents: WarehouseDowntimeEvent[];
  workers: WarehouseWorker[];
  warehouseMap: WarehouseMapZone[];
  timeline: TimelineEvent[];
  predictiveInsights: PredictiveInsight[];
  comparisonMetrics: ComparisonMetric[];
  reportCards: WarehouseReportCard[];
  reportHighlights: string[];
  chatPresets: ChatPreset[];
}

export type LiveOpsMode = 'demo' | 'live';

export type LiveConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'fallback';

export type OperationalEventSource = 'wms' | 'lms' | 'yms' | 'telemetry' | 'erp' | 'manual';

export type OperationalEventType =
  | 'truck_arrival'
  | 'receiving_progress'
  | 'dock_delay'
  | 'labor_update'
  | 'downtime_alert'
  | 'inventory_signal'
  | 'picking_rate'
  | 'worker_assignment';

export type LiveSimulationScenario =
  | 'mixed'
  | 'receiving-delay'
  | 'downtime-spike'
  | 'inventory-variance'
  | 'labor-rebalance';

export interface LiveConnectorStatus {
  id: string;
  label: string;
  source: OperationalEventSource;
  status: 'connected' | 'degraded' | 'pending';
  lastEventAt: string;
  detail: string;
}

export interface LiveOpsEvent {
  facilityId: WarehouseFacilityId;
  source: OperationalEventSource;
  type: OperationalEventType;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface LiveFacilitySnapshot {
  mode: 'live';
  facility: WarehouseFacilityData;
  connectors: LiveConnectorStatus[];
  lastUpdated: string;
}
