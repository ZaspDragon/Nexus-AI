import { EventEmitter } from 'node:events';
import {
  getWarehouseFacility,
  warehouseFacilityOptions,
} from '../src/data/warehouseDemo';
import type {
  CommandPriority,
  LiveConnectorStatus,
  LiveFacilitySnapshot,
  LiveOpsEvent,
  LiveSimulationScenario,
  OperationalEventSource,
  TimelineEvent,
  WarehouseDowntimeEvent,
  WarehouseFacilityData,
  WarehouseFacilityId,
  WarehouseInventoryZone,
  WarehouseRecommendation,
  WarehouseReceivingLane,
  WarehouseWorker,
} from '../src/types';

interface FacilityLiveState {
  facility: WarehouseFacilityData;
  connectors: LiveConnectorStatus[];
  lastUpdated: string;
}

const connectorBlueprints: Array<{
  id: string;
  label: string;
  source: OperationalEventSource;
  detail: string;
}> = [
  { id: 'wms-core', label: 'Warehouse Management System', source: 'wms', detail: 'Receiving, inventory, and picking updates' },
  { id: 'lms-core', label: 'Labor Management System', source: 'lms', detail: 'Clock-ins, utilization, and staffing shifts' },
  { id: 'yms-core', label: 'Yard and Dock System', source: 'yms', detail: 'Trailer arrivals, doors, and staging flow' },
  { id: 'telemetry-core', label: 'Equipment Telemetry', source: 'telemetry', detail: 'Downtime, congestion, and device health' },
  { id: 'erp-core', label: 'ERP and Orders', source: 'erp', detail: 'Customer priorities and shipment cutoffs' },
];

const connectorMap = new Map<OperationalEventSource, string>([
  ['wms', 'wms-core'],
  ['lms', 'lms-core'],
  ['yms', 'yms-core'],
  ['telemetry', 'telemetry-core'],
  ['erp', 'erp-core'],
  ['manual', 'telemetry-core'],
]);

const emitter = new EventEmitter();

const formatTimelineTime = (dateInput: string) =>
  new Date(dateInput).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const cloneFacility = (facilityId: WarehouseFacilityId): WarehouseFacilityData =>
  structuredClone(getWarehouseFacility(facilityId));

const buildConnectors = (): LiveConnectorStatus[] =>
  connectorBlueprints.map((connector) => ({
    id: connector.id,
    label: connector.label,
    source: connector.source,
    status: 'pending',
    lastEventAt: 'No events yet',
    detail: connector.detail,
  }));

const createInitialState = (facilityId: WarehouseFacilityId): FacilityLiveState => ({
  facility: cloneFacility(facilityId),
  connectors: buildConnectors(),
  lastUpdated: new Date().toISOString(),
});

const liveStates = new Map<WarehouseFacilityId, FacilityLiveState>(
  warehouseFacilityOptions.map((facility) => [facility.id, createInitialState(facility.id)]),
);

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

const priorityOrder: Record<CommandPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

const buildLaneRiskRecommendation = (lane: WarehouseReceivingLane): WarehouseRecommendation | null => {
  if (!['Needs support', 'Congested', 'Late', 'Watch'].includes(lane.status)) {
    return null;
  }

  const priority: CommandPriority =
    lane.status === 'Late' || lane.status === 'Congested' ? 'Critical' : 'High';

  return {
    id: `live-${lane.lane.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${lane.lane} needs immediate receiving support`,
    timestamp: 'Live',
    department: 'Receiving',
    priority,
    confidence: lane.progress < 45 ? 91 : 86,
    recommendation: `${lane.lane} ${lane.trailer.toLowerCase()} is trending behind target. Move ${lane.owner} or a cross-trained picker into dock support until the lane is back above 70% completion.`,
    impact: 'Reduces dock-to-stock risk and protects the next inbound wave from queueing at the door.',
    status: 'New',
  };
};

const buildDowntimeRecommendation = (event: WarehouseDowntimeEvent): WarehouseRecommendation | null => {
  if (event.state === 'Closed' || event.duration < 25) {
    return null;
  }

  return {
    id: `live-downtime-${event.area.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${event.area} downtime is exceeding threshold`,
    timestamp: 'Live',
    department: 'Downtime',
    priority: event.duration >= 30 ? 'Critical' : 'High',
    confidence: event.duration >= 30 ? 89 : 82,
    recommendation: `${event.area} has been in ${event.state.toLowerCase()} status for ${event.duration} minutes. Escalate ${event.owner} and reroute work around the blocked path until recovery is confirmed.`,
    impact: 'Contains throughput loss and prevents congestion from spreading to adjacent lanes.',
    status: 'New',
  };
};

const buildInventoryRecommendation = (zone: WarehouseInventoryZone): WarehouseRecommendation | null => {
  if (zone.accuracy >= 98.5) {
    return null;
  }

  return {
    id: `live-inventory-${zone.zone.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${zone.zone} inventory confidence is slipping`,
    timestamp: 'Live',
    department: 'Inventory',
    priority: zone.accuracy < 98 ? 'High' : 'Medium',
    confidence: zone.accuracy < 98 ? 87 : 79,
    recommendation: `${zone.zone} is showing ${zone.accuracy.toFixed(1)}% accuracy with ${zone.issue.toLowerCase()}. ${zone.action}.`,
    impact: 'Protects forward pick accuracy before replenishment noise turns into short picks.',
    status: 'New',
  };
};

const buildLaborRecommendation = (facility: WarehouseFacilityData): WarehouseRecommendation | null => {
  const gap = facility.overview.laborUtilization.target - facility.overview.laborUtilization.value;
  if (gap <= 2) {
    return null;
  }

  const candidateWorker =
    facility.workers.find((worker) => worker.status.toLowerCase().includes('cross-train')) ??
    facility.workers[0];

  return {
    id: `live-labor-${facility.id}`,
    title: 'Labor balance is below target',
    timestamp: 'Live',
    department: 'Labor',
    priority: gap >= 6 ? 'High' : 'Medium',
    confidence: gap >= 6 ? 84 : 76,
    recommendation: `Labor utilization is ${gap} points below target. Move ${candidateWorker.name} toward the workstream with the highest dock-to-stock pressure for the next 30 minutes.`,
    impact: 'Improves labor efficiency without adding headcount and keeps the shift from drifting through idle pockets.',
    status: 'New',
  };
};

const buildPickingRecommendation = (facility: WarehouseFacilityData): WarehouseRecommendation | null => {
  const gap = facility.overview.picksPerHour.target - facility.overview.picksPerHour.value;
  if (gap <= 4) {
    return null;
  }

  return {
    id: `live-picking-${facility.id}`,
    title: 'Picking productivity is below plan',
    timestamp: 'Live',
    department: 'Picking',
    priority: gap >= 10 ? 'High' : 'Medium',
    confidence: gap >= 10 ? 81 : 73,
    recommendation: `Picking is running ${gap} units below target pace. Review congestion, replenishment starvation, and the current labor mix before the next release wave.`,
    impact: 'Recovers throughput sooner and reduces the chance of backlog compounding later in the shift.',
    status: 'New',
  };
};

const rebuildIntelligence = (facility: WarehouseFacilityData) => {
  const receivingPercent = Math.round(
    (facility.overview.receivingProgress.completed / Math.max(facility.overview.receivingProgress.total, 1)) * 100,
  );
  const delayedLanes = facility.receivingLanes.filter((lane) =>
    ['Needs support', 'Congested', 'Late', 'Watch'].includes(lane.status),
  );
  const worstDowntime = facility.downtimeEvents.reduce<WarehouseDowntimeEvent | null>(
    (highest, event) => (highest && highest.duration > event.duration ? highest : event),
    null,
  );
  const lowConfidenceZone = facility.inventoryZones.reduce<WarehouseInventoryZone | null>(
    (lowest, zone) => (lowest && lowest.accuracy < zone.accuracy ? lowest : zone),
    null,
  );

  const recommendations = [
    ...delayedLanes.map(buildLaneRiskRecommendation),
    ...facility.downtimeEvents.map(buildDowntimeRecommendation),
    ...facility.inventoryZones.map(buildInventoryRecommendation),
    buildLaborRecommendation(facility),
    buildPickingRecommendation(facility),
  ]
    .filter((item): item is WarehouseRecommendation => Boolean(item))
    .sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority])
    .slice(0, 6);

  facility.commandFeed = recommendations;
  facility.overview.aiRecommendations = recommendations.length;
  facility.overview.dockStatus.detail = delayedLanes.length
    ? `${delayedLanes.length} doors need support`
    : 'Dock flow is stable';
  facility.overview.inventoryAccuracy.detail = lowConfidenceZone
    ? `${lowConfidenceZone.zone} is carrying the most variance exposure`
    : 'Inventory is stable across active zones';
  facility.overview.downtimeAlerts.open = facility.downtimeEvents.filter((event) => event.state !== 'Closed').length;
  facility.overview.downtimeAlerts.detail = worstDowntime
    ? `${worstDowntime.area} is the highest active downtime risk`
    : 'No downtime above threshold';
  facility.overview.picksPerHour.trend =
    facility.overview.picksPerHour.value >= facility.overview.picksPerHour.target
      ? `+${facility.overview.picksPerHour.value - facility.overview.picksPerHour.target}% vs target pace`
      : `-${facility.overview.picksPerHour.target - facility.overview.picksPerHour.value}% vs target pace`;

  const laborScore = clamp(facility.overview.laborUtilization.value, 55, 96);
  const receivingScore = clamp(receivingPercent, 48, 96);
  const inventoryScore = clamp(Math.round(facility.overview.inventoryAccuracy.value), 60, 99);
  const downtimeScore = clamp(100 - facility.overview.downtimeAlerts.open * 9 - (worstDowntime?.duration ?? 0) / 4, 48, 95);
  const congestionScore = clamp(100 - delayedLanes.length * 11 - (worstDowntime?.duration ?? 0) / 5, 46, 94);
  const shiftScore = Math.round((laborScore + receivingScore + inventoryScore + downtimeScore + congestionScore) / 5);

  facility.shiftHealth = {
    score: shiftScore,
    summary:
      delayedLanes.length || facility.overview.downtimeAlerts.open
        ? 'Live signals show the shift is still recoverable, but the top AI actions should be handled before the next operating wave.'
        : 'Live signals are healthy. Nexus AI is watching for drift, but the floor is currently in control.',
    factors: [
      {
        label: 'Labor Efficiency',
        score: laborScore,
        status: laborScore >= 85 ? 'Healthy' : laborScore >= 75 ? 'Watch' : 'Urgent',
        detail: facility.overview.laborUtilization.detail,
      },
      {
        label: 'Receiving Flow',
        score: receivingScore,
        status: receivingScore >= 85 ? 'Healthy' : receivingScore >= 75 ? 'Watch' : 'Urgent',
        detail: facility.overview.receivingProgress.targetMinutes,
      },
      {
        label: 'Inventory Stability',
        score: inventoryScore,
        status: inventoryScore >= 85 ? 'Healthy' : inventoryScore >= 75 ? 'Watch' : 'Urgent',
        detail: facility.overview.inventoryAccuracy.detail,
      },
      {
        label: 'Downtime Risk',
        score: downtimeScore,
        status: downtimeScore >= 85 ? 'Healthy' : downtimeScore >= 75 ? 'Watch' : 'Urgent',
        detail: facility.overview.downtimeAlerts.detail,
      },
      {
        label: 'Congestion Risk',
        score: congestionScore,
        status: congestionScore >= 85 ? 'Healthy' : congestionScore >= 75 ? 'Watch' : 'Urgent',
        detail: delayedLanes.length
          ? `${delayedLanes.length} live dock or aisle congestion risks are open`
          : 'No major congestion risk is open right now',
      },
    ],
  };

  facility.predictiveInsights = [
    {
      id: `${facility.id}-shipment-risk`,
      title: 'Missed shipment risk',
      value: `${clamp(12 + delayedLanes.length * 9 + facility.overview.downtimeAlerts.open * 5, 8, 72)}%`,
      tone: delayedLanes.length > 1 ? 'watch' : 'healthy',
      detail: 'Calculated from live door pacing, downtime overlap, and current staffing coverage.',
      outlook: 'This risk falls fastest when the highest-priority door or downtime issue is stabilized first.',
    },
    {
      id: `${facility.id}-receiving-forecast`,
      title: 'Receiving delay forecast',
      value: `+${clamp(8 + delayedLanes.length * 12, 6, 48)} min`,
      tone: delayedLanes.length > 1 ? 'urgent' : 'watch',
      detail: 'Forecast uses current unload progress, door status, and trailer overlap timing.',
      outlook: 'Live WMS and yard signals will tighten this forecast as the next trailer wave approaches.',
    },
    {
      id: `${facility.id}-inventory-variance`,
      title: 'Inventory variance probability',
      value: `${clamp(Math.round((100 - inventoryScore) * 0.9), 7, 41)}%`,
      tone: inventoryScore < 98 ? 'watch' : 'healthy',
      detail: 'Calculated from zone accuracy, scan exceptions, and recent count drift.',
      outlook: 'Correcting the lowest-confidence zone reduces downstream replenishment noise quickly.',
    },
    {
      id: `${facility.id}-labor-risk`,
      title: 'Labor shortage risk',
      value: laborScore < 78 ? 'Moderate' : 'Low',
      tone: laborScore < 78 ? 'watch' : 'healthy',
      detail: 'Based on active workers, utilization gap, and cross-trained flex capacity.',
      outlook: 'Nexus AI will surface another rebalance action if labor pockets widen.',
    },
    {
      id: `${facility.id}-dock-risk`,
      title: 'Dock congestion forecast',
      value: `${clamp(18 + delayedLanes.length * 13 + facility.overview.downtimeAlerts.open * 4, 14, 78)}%`,
      tone: delayedLanes.length > 1 ? 'urgent' : 'watch',
      detail: 'Combines live dock pacing, queue buildup, and equipment flow interruptions.',
      outlook: 'The probability drops once late or congested lanes move back into stable status.',
    },
  ];

  facility.heroSnapshot = [
    delayedLanes.length
      ? `${delayedLanes[0]?.lane ?? 'Receiving'} is the top live dock-to-stock risk right now.`
      : 'Receiving flow is currently stable across active doors.',
    worstDowntime
      ? `${worstDowntime.area} is the highest downtime pressure point.`
      : 'No downtime issue is currently dominating the shift.',
    lowConfidenceZone
      ? `${lowConfidenceZone.zone} is the current inventory confidence watch area.`
      : 'Inventory confidence is healthy across active zones.',
  ];
};

const addTimelineEvent = (facility: WarehouseFacilityData, event: TimelineEvent) => {
  facility.timeline = [event, ...facility.timeline].slice(0, 12);
};

const applyReceivingProgress = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  const laneName = typeof event.payload.lane === 'string' ? event.payload.lane : null;
  const progress = typeof event.payload.progress === 'number' ? clamp(event.payload.progress, 0, 100) : null;
  const completed = typeof event.payload.completed === 'number' ? event.payload.completed : null;
  const total = typeof event.payload.total === 'number' ? event.payload.total : null;
  const status = typeof event.payload.status === 'string' ? event.payload.status : null;
  const eta = typeof event.payload.eta === 'string' ? event.payload.eta : null;

  facility.receivingLanes = facility.receivingLanes.map((lane) =>
    laneName && lane.lane === laneName
      ? {
          ...lane,
          progress: progress ?? lane.progress,
          status: status ?? lane.status,
          eta: eta ?? lane.eta,
        }
      : lane,
  );

  facility.overview.receivingProgress.completed = completed ?? facility.overview.receivingProgress.completed;
  facility.overview.receivingProgress.total = total ?? facility.overview.receivingProgress.total;
};

const applyDockDelay = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  const laneName = typeof event.payload.lane === 'string' ? event.payload.lane : null;
  const eta = typeof event.payload.eta === 'string' ? event.payload.eta : null;
  const status = typeof event.payload.status === 'string' ? event.payload.status : 'Late';

  facility.receivingLanes = facility.receivingLanes.map((lane) =>
    laneName && lane.lane === laneName
      ? {
          ...lane,
          status,
          eta: eta ?? lane.eta,
        }
      : lane,
  );
};

const applyLaborUpdate = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  const currentWorkers = typeof event.payload.currentWorkers === 'number' ? event.payload.currentWorkers : null;
  const utilization = typeof event.payload.utilization === 'number' ? clamp(event.payload.utilization, 0, 100) : null;
  const workerName = typeof event.payload.workerName === 'string' ? event.payload.workerName : null;
  const status = typeof event.payload.status === 'string' ? event.payload.status : null;
  const zone = typeof event.payload.zone === 'string' ? event.payload.zone : null;
  const team = typeof event.payload.team === 'string' ? event.payload.team : null;
  const staffed = typeof event.payload.staffed === 'number' ? event.payload.staffed : null;

  if (currentWorkers !== null) {
    facility.overview.activeWorkers.current = currentWorkers;
  }

  if (utilization !== null) {
    facility.overview.laborUtilization.value = utilization;
  }

  if (team) {
    facility.laborSegments = facility.laborSegments.map((segment) =>
      segment.team === team
        ? {
            ...segment,
            staffed: staffed ?? segment.staffed,
            utilization: utilization ?? segment.utilization,
          }
        : segment,
    );
  }

  if (workerName) {
    facility.workers = facility.workers.map((worker) =>
      worker.name === workerName
        ? {
            ...worker,
            status: status ?? worker.status,
            zone: zone ?? worker.zone,
          }
        : worker,
    );
  }
};

const applyDowntimeAlert = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  const area = typeof event.payload.area === 'string' ? event.payload.area : 'Unknown area';
  const duration = typeof event.payload.duration === 'number' ? event.payload.duration : 25;
  const cause = typeof event.payload.cause === 'string' ? event.payload.cause : 'Operational disruption';
  const owner = typeof event.payload.owner === 'string' ? event.payload.owner : 'Supervisor';
  const state = typeof event.payload.state === 'string' ? event.payload.state : 'Open';

  const nextEvent: WarehouseDowntimeEvent = {
    area,
    duration,
    cause,
    owner,
    state: state === 'Closed' ? 'Closed' : state === 'Monitoring' ? 'Monitoring' : 'Open',
  };

  const exists = facility.downtimeEvents.some((item) => item.area === area);
  facility.downtimeEvents = exists
    ? facility.downtimeEvents.map((item) => (item.area === area ? nextEvent : item))
    : [nextEvent, ...facility.downtimeEvents].slice(0, 6);
};

const applyInventorySignal = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  const zoneName = typeof event.payload.zone === 'string' ? event.payload.zone : null;
  const accuracy = typeof event.payload.accuracy === 'number' ? clamp(event.payload.accuracy, 92, 100) : null;
  const issue = typeof event.payload.issue === 'string' ? event.payload.issue : null;
  const action = typeof event.payload.action === 'string' ? event.payload.action : null;

  facility.inventoryZones = facility.inventoryZones.map((zone) =>
    zoneName && zone.zone === zoneName
      ? {
          ...zone,
          accuracy: accuracy ?? zone.accuracy,
          issue: issue ?? zone.issue,
          action: action ?? zone.action,
        }
      : zone,
  );

  const averageAccuracy =
    facility.inventoryZones.reduce((sum, zone) => sum + zone.accuracy, 0) / facility.inventoryZones.length;
  facility.overview.inventoryAccuracy.value = Number(averageAccuracy.toFixed(1));
};

const applyPickingRate = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  const value = typeof event.payload.value === 'number' ? event.payload.value : null;
  const target = typeof event.payload.target === 'number' ? event.payload.target : null;
  if (value !== null) {
    facility.overview.picksPerHour.value = value;
  }
  if (target !== null) {
    facility.overview.picksPerHour.target = target;
  }
};

const applyWorkerAssignment = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  const workerName = typeof event.payload.workerName === 'string' ? event.payload.workerName : null;
  const zone = typeof event.payload.zone === 'string' ? event.payload.zone : null;
  const status = typeof event.payload.status === 'string' ? event.payload.status : null;
  const note = typeof event.payload.note === 'string' ? event.payload.note : null;

  facility.workers = facility.workers.map<WarehouseWorker>((worker) =>
    workerName && worker.name === workerName
      ? {
          ...worker,
          zone: zone ?? worker.zone,
          status: status ?? worker.status,
          note: note ?? worker.note,
        }
      : worker,
  );
};

const eventToTimeline = (event: LiveOpsEvent): TimelineEvent => {
  const area = typeof event.payload.area === 'string' ? event.payload.area : null;
  const lane = typeof event.payload.lane === 'string' ? event.payload.lane : null;
  const zone = typeof event.payload.zone === 'string' ? event.payload.zone : null;
  const workerName = typeof event.payload.workerName === 'string' ? event.payload.workerName : null;

  const descriptionByType: Record<LiveOpsEvent['type'], string> = {
    truck_arrival: `Truck arrival confirmed ${lane ? `at ${lane}` : 'for the next receiving lane'}.`,
    receiving_progress: `Receiving progress updated ${lane ? `for ${lane}` : 'from WMS'}.`,
    dock_delay: `Dock delay flagged ${lane ? `for ${lane}` : 'by the yard system'}.`,
    labor_update: `Labor update received ${workerName ? `for ${workerName}` : 'from the LMS'}.`,
    downtime_alert: `Downtime alert raised ${area ? `for ${area}` : 'from telemetry'}.`,
    inventory_signal: `Inventory signal updated ${zone ? `for ${zone}` : 'from WMS counts'}.`,
    picking_rate: 'Picking rate updated from live throughput signals.',
    worker_assignment: `Worker assignment changed ${workerName ? `for ${workerName}` : 'from the supervisor console'}.`,
  };

  const severityByType: Record<LiveOpsEvent['type'], CommandPriority> = {
    truck_arrival: 'Low',
    receiving_progress: 'Medium',
    dock_delay: 'High',
    labor_update: 'Medium',
    downtime_alert: 'High',
    inventory_signal: 'Medium',
    picking_rate: 'Medium',
    worker_assignment: 'Low',
  };

  const departmentByType: Record<LiveOpsEvent['type'], string> = {
    truck_arrival: 'Yard',
    receiving_progress: 'Receiving',
    dock_delay: 'Dock',
    labor_update: 'Labor',
    downtime_alert: 'Downtime',
    inventory_signal: 'Inventory',
    picking_rate: 'Picking',
    worker_assignment: 'Supervisor Action',
  };

  return {
    id: `timeline-${crypto.randomUUID()}`,
    time: formatTimelineTime(event.occurredAt),
    department: departmentByType[event.type],
    severity: severityByType[event.type],
    description: descriptionByType[event.type],
  };
};

const applyEvent = (facility: WarehouseFacilityData, event: LiveOpsEvent) => {
  switch (event.type) {
    case 'truck_arrival':
      applyDockDelay(facility, { ...event, type: 'dock_delay' });
      break;
    case 'receiving_progress':
      applyReceivingProgress(facility, event);
      break;
    case 'dock_delay':
      applyDockDelay(facility, event);
      break;
    case 'labor_update':
      applyLaborUpdate(facility, event);
      break;
    case 'downtime_alert':
      applyDowntimeAlert(facility, event);
      break;
    case 'inventory_signal':
      applyInventorySignal(facility, event);
      break;
    case 'picking_rate':
      applyPickingRate(facility, event);
      break;
    case 'worker_assignment':
      applyWorkerAssignment(facility, event);
      break;
    default:
      break;
  }

  addTimelineEvent(facility, eventToTimeline(event));
  rebuildIntelligence(facility);
};

const touchConnector = (
  connectors: LiveConnectorStatus[],
  source: OperationalEventSource,
  occurredAt: string,
): LiveConnectorStatus[] =>
  connectors.map((connector) =>
    connector.id === connectorMap.get(source)
      ? {
          ...connector,
          status: 'connected' as const,
          lastEventAt: formatTimelineTime(occurredAt),
          detail: `Last ${source.toUpperCase()} event processed at ${formatTimelineTime(occurredAt)}.`,
        }
      : connector,
  );

const getState = (facilityId: WarehouseFacilityId) => {
  const state = liveStates.get(facilityId);
  if (!state) {
    throw new Error(`Unknown facility ${facilityId}`);
  }
  return state;
};

const publishSnapshot = (facilityId: WarehouseFacilityId) => {
  emitter.emit(`facility:${facilityId}`, getLiveSnapshot(facilityId));
};

export const listFacilities = () =>
  warehouseFacilityOptions.map((facility) => ({
    id: facility.id,
    label: facility.label,
    region: facility.region,
  }));

export const getLiveSnapshot = (facilityId: WarehouseFacilityId): LiveFacilitySnapshot => {
  const state = getState(facilityId);
  return {
    mode: 'live',
    facility: structuredClone(state.facility),
    connectors: structuredClone(state.connectors),
    lastUpdated: state.lastUpdated,
  };
};

export const ingestLiveEvent = (event: LiveOpsEvent) => {
  const state = getState(event.facilityId);
  state.lastUpdated = event.occurredAt;
  state.connectors = touchConnector(state.connectors, event.source, event.occurredAt);
  applyEvent(state.facility, event);
  publishSnapshot(event.facilityId);
  return getLiveSnapshot(event.facilityId);
};

const buildSampleScenarioEvents = (
  facilityId: WarehouseFacilityId,
  scenario: LiveSimulationScenario,
): LiveOpsEvent[] => {
  const now = new Date();
  const at = (offsetMinutes: number) => new Date(now.getTime() + offsetMinutes * 60_000).toISOString();

  const scenarios: Record<LiveSimulationScenario, LiveOpsEvent[]> = {
    mixed: [
      {
        facilityId,
        source: 'wms',
        type: 'receiving_progress',
        occurredAt: at(-3),
        payload: { lane: 'Door 3', progress: 44, status: 'Needs support', eta: '41 min' },
      },
      {
        facilityId,
        source: 'telemetry',
        type: 'downtime_alert',
        occurredAt: at(-2),
        payload: { area: 'Aisle 14', duration: 34, cause: 'Lift congestion', owner: 'Operations lead', state: 'Open' },
      },
      {
        facilityId,
        source: 'lms',
        type: 'labor_update',
        occurredAt: at(-1),
        payload: { currentWorkers: 39, utilization: 79, team: 'Receiving', staffed: 10, workerName: 'Kris', status: 'Dock support ready', zone: 'Receiving' },
      },
    ],
    'receiving-delay': [
      {
        facilityId,
        source: 'yms',
        type: 'dock_delay',
        occurredAt: at(-2),
        payload: { lane: 'Door 5', status: 'Late', eta: '58 min' },
      },
      {
        facilityId,
        source: 'wms',
        type: 'receiving_progress',
        occurredAt: at(-1),
        payload: { lane: 'Door 5', progress: 28, status: 'Congested', completed: 58, total: 91 },
      },
    ],
    'downtime-spike': [
      {
        facilityId,
        source: 'telemetry',
        type: 'downtime_alert',
        occurredAt: at(-1),
        payload: { area: 'Sorter lane 2', duration: 37, cause: 'Jam reset', owner: 'Maintenance', state: 'Open' },
      },
    ],
    'inventory-variance': [
      {
        facilityId,
        source: 'wms',
        type: 'inventory_signal',
        occurredAt: at(-1),
        payload: { zone: 'Zone B', accuracy: 97.4, issue: 'Variance risk elevated', action: 'Spot-check top 10 SKUs before replenishment resumes' },
      },
    ],
    'labor-rebalance': [
      {
        facilityId,
        source: 'lms',
        type: 'labor_update',
        occurredAt: at(-1),
        payload: { currentWorkers: 38, utilization: 76, team: 'Receiving', staffed: 9, workerName: 'Yussif', status: 'Cross-trained flex ready', zone: 'Receiving support' },
      },
    ],
  };

  return scenarios[scenario];
};

export const runSimulationScenario = (
  facilityId: WarehouseFacilityId,
  scenario: LiveSimulationScenario,
) => {
  const events = buildSampleScenarioEvents(facilityId, scenario);
  let snapshot = getLiveSnapshot(facilityId);
  for (const event of events) {
    snapshot = ingestLiveEvent(event);
  }
  return snapshot;
};

export const subscribeToFacility = (
  facilityId: WarehouseFacilityId,
  listener: (snapshot: LiveFacilitySnapshot) => void,
) => {
  const eventName = `facility:${facilityId}`;
  emitter.on(eventName, listener);
  return () => {
    emitter.off(eventName, listener);
  };
};
