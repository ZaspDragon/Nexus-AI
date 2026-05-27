import type {
  LiveConnectionStatus,
  LiveFacilitySnapshot,
  LiveSimulationScenario,
  WarehouseFacilityId,
} from '../types';

const liveOpsBaseUrl = import.meta.env.VITE_NEXUS_LIVE_OPS_URL?.replace(/\/$/, '');

export const isLiveOpsConfigured = Boolean(liveOpsBaseUrl);

const getBaseUrl = () => {
  if (!liveOpsBaseUrl) {
    throw new Error('Live Ops API URL is not configured.');
  }
  return liveOpsBaseUrl;
};

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Live Ops request failed with ${response.status}`);
  }
  return (await response.json()) as T;
};

export const fetchLiveFacilityState = async (facilityId: WarehouseFacilityId) => {
  const response = await fetch(`${getBaseUrl()}/api/facilities/${facilityId}/state`);
  return readJson<LiveFacilitySnapshot>(response);
};

export const simulateLiveScenario = async (
  facilityId: WarehouseFacilityId,
  scenario: LiveSimulationScenario = 'mixed',
) => {
  const response = await fetch(`${getBaseUrl()}/api/simulate/${facilityId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scenario }),
  });
  return readJson<LiveFacilitySnapshot>(response);
};

export const subscribeToLiveFacility = (
  facilityId: WarehouseFacilityId,
  handlers: {
    onSnapshot: (snapshot: LiveFacilitySnapshot) => void;
    onStatusChange?: (status: LiveConnectionStatus) => void;
  },
) => {
  if (!isLiveOpsConfigured || typeof window === 'undefined') {
    return () => {};
  }

  handlers.onStatusChange?.('connecting');
  const source = new EventSource(`${getBaseUrl()}/api/stream?facilityId=${facilityId}`);

  source.onopen = () => {
    handlers.onStatusChange?.('connected');
  };

  source.onmessage = (event) => {
    const payload = JSON.parse(event.data) as LiveFacilitySnapshot;
    handlers.onSnapshot(payload);
  };

  source.onerror = () => {
    handlers.onStatusChange?.('fallback');
    source.close();
  };

  return () => {
    source.close();
  };
};
