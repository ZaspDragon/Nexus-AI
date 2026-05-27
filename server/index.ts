import cors from 'cors';
import express from 'express';
import {
  getLiveSnapshot,
  ingestLiveEvent,
  listFacilities,
  runSimulationScenario,
  subscribeToFacility,
} from './liveOpsStore';
import type {
  LiveOpsEvent,
  LiveSimulationScenario,
  WarehouseFacilityId,
} from '../src/types';

const app = express();
const port = Number(process.env.NEXUS_LIVE_OPS_PORT ?? 8787);
const allowedOrigin = process.env.NEXUS_ALLOWED_ORIGIN ?? '*';

app.use(
  cors({
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    credentials: false,
  }),
);
app.use(express.json({ limit: '1mb' }));

const facilityIds = new Set(listFacilities().map((facility) => facility.id));
const simulationScenarios = new Set<LiveSimulationScenario>([
  'mixed',
  'receiving-delay',
  'downtime-spike',
  'inventory-variance',
  'labor-rebalance',
]);
const eventTypes = new Set<LiveOpsEvent['type']>([
  'truck_arrival',
  'receiving_progress',
  'dock_delay',
  'labor_update',
  'downtime_alert',
  'inventory_signal',
  'picking_rate',
  'worker_assignment',
]);
const eventSources = new Set<LiveOpsEvent['source']>(['wms', 'lms', 'yms', 'telemetry', 'erp', 'manual']);

const isFacilityId = (value: string): value is WarehouseFacilityId => facilityIds.has(value as WarehouseFacilityId);

const isLiveOpsEvent = (value: unknown): value is LiveOpsEvent => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LiveOpsEvent>;
  return (
    typeof candidate.facilityId === 'string' &&
    isFacilityId(candidate.facilityId) &&
    typeof candidate.source === 'string' &&
    eventSources.has(candidate.source) &&
    typeof candidate.type === 'string' &&
    eventTypes.has(candidate.type) &&
    typeof candidate.occurredAt === 'string' &&
    Boolean(candidate.payload) &&
    typeof candidate.payload === 'object'
  );
};

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'nexus-live-ops',
    timestamp: new Date().toISOString(),
    facilities: listFacilities(),
  });
});

app.get('/api/facilities', (_request, response) => {
  response.json({
    mode: 'live',
    facilities: listFacilities(),
  });
});

app.get('/api/facilities/:facilityId/state', (request, response) => {
  const { facilityId } = request.params;
  if (!isFacilityId(facilityId)) {
    response.status(404).json({ error: `Unknown facility: ${facilityId}` });
    return;
  }

  response.json(getLiveSnapshot(facilityId));
});

app.post('/api/ingest/events', (request, response) => {
  const body = request.body as { events?: unknown[]; event?: unknown };
  const candidates = Array.isArray(body?.events) ? body.events : body?.event ? [body.event] : [];

  if (!candidates.length || !candidates.every(isLiveOpsEvent)) {
    response.status(400).json({
      error: 'Expected a payload with event or events using the LiveOpsEvent shape.',
    });
    return;
  }

  let snapshot = getLiveSnapshot(candidates[0].facilityId);
  for (const event of candidates) {
    snapshot = ingestLiveEvent(event);
  }

  response.status(202).json(snapshot);
});

app.post('/api/simulate/:facilityId', (request, response) => {
  const { facilityId } = request.params;
  const scenario = (request.body?.scenario ?? 'mixed') as LiveSimulationScenario;

  if (!isFacilityId(facilityId)) {
    response.status(404).json({ error: `Unknown facility: ${facilityId}` });
    return;
  }

  if (!simulationScenarios.has(scenario)) {
    response.status(400).json({ error: `Unsupported simulation scenario: ${scenario}` });
    return;
  }

  response.status(202).json(runSimulationScenario(facilityId, scenario));
});

app.get('/api/stream', (request, response) => {
  const facilityId = request.query.facilityId;
  if (typeof facilityId !== 'string' || !isFacilityId(facilityId)) {
    response.status(400).json({ error: 'facilityId query parameter is required.' });
    return;
  }

  response.setHeader('Content-Type', 'text/event-stream');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Connection', 'keep-alive');
  response.flushHeaders();

  const sendSnapshot = () => {
    response.write(`data: ${JSON.stringify(getLiveSnapshot(facilityId))}\n\n`);
  };

  sendSnapshot();

  const unsubscribe = subscribeToFacility(facilityId, (snapshot) => {
    response.write(`data: ${JSON.stringify(snapshot)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    response.write('event: heartbeat\ndata: {}\n\n');
  }, 20_000);

  request.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
    response.end();
  });
});

app.listen(port, () => {
  console.log(`Nexus Live Ops API listening on http://localhost:${port}`);
});
