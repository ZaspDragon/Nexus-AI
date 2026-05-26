export const warehouseOverview = {
  siteName: 'Nexus Fulfillment Hub 7',
  shift: 'Day Shift',
  shiftWindow: '06:00 AM - 02:30 PM',
  supervisors: ['Maria Ofori', 'Daniel Reyes'],
  activeWorkers: { current: 41, target: 44, delta: '+3 vs yesterday' },
  dockStatus: { activeDoors: 8, totalDoors: 10, detail: '2 trailers waiting to spot' },
  receivingProgress: { completed: 62, total: 91, targetMinutes: '30 min LTL / transfer, 2 hr container' },
  inventoryAccuracy: { value: 98.7, detail: 'Cycle count variance concentrated in Zone B' },
  downtimeAlerts: { open: 3, threshold: '25+ minutes', detail: '2 conveyor, 1 lift congestion' },
  picksPerHour: { value: 126, target: 134, trend: '-6% vs target pace' },
  laborUtilization: { value: 84, target: 88, detail: 'Cross-training needed at dock doors 3 and 4' },
  aiRecommendations: 4,
};

export const heroBenefits = [
  'Nexus AI watches receiving, inventory, labor, downtime, and dock flow in one command center.',
  'Supervisors get shift-specific recommendations before bottlenecks roll into missed cutoffs.',
  'Staffing and logistics leaders can rebalance labor using live warehouse signals instead of gut feel.',
];

export const workers = [
  { name: 'Henry', role: 'Dock lead', zone: 'Receiving', status: 'On pace', throughput: '14 trailers touched', utilization: '89%' },
  { name: 'Kris', role: 'Lift driver', zone: 'Aisle 14', status: 'Below pace', throughput: '31 moves / 45 goal', utilization: '76%' },
  { name: 'Dawitt', role: 'Cycle count lead', zone: 'Zone B', status: 'Variance watch', throughput: '142 counts / 200 goal', utilization: '83%' },
  { name: 'Yussif', role: 'Picker', zone: 'Pick Module 2', status: 'Cross-train candidate', throughput: '138 PPH', utilization: '92%' },
];

export const commandRecommendations = [
  {
    title: 'Receiving behind target',
    severity: 'high' as const,
    recommendation: 'Receiving is trending 18% behind target. Move 1 picker to dock door 3 for the next 45 minutes.',
    impact: 'Prevents container overflow from missing dock-to-stock SLA.',
  },
  {
    title: 'Zone B variance risk',
    severity: 'medium' as const,
    recommendation: 'Zone B has high variance risk based on recent cycle counts. Hold replenishment until counts are closed.',
    impact: 'Reduces short picks and inventory adjustment churn before second half of shift.',
  },
  {
    title: 'Lift congestion',
    severity: 'medium' as const,
    recommendation: 'Lift driver productivity is below pace. Check congestion near aisle 14 and reroute replenishment traffic.',
    impact: 'Recovers an estimated 9 moves before lunch cutover.',
  },
  {
    title: 'Dock-to-stock delay',
    severity: 'high' as const,
    recommendation: 'Dock-to-stock time is exceeding target by 26 minutes. Clear pallet staging near doors 5 and 6 immediately.',
    impact: 'Prevents replenishment starvation in the pick module.',
  },
];

export const receivingLanes = [
  { lane: 'Door 1', trailer: 'LTL inbound', progress: 84, eta: '11 min', owner: 'Henry', status: 'Stable' },
  { lane: 'Door 3', trailer: 'Transfer trailer', progress: 52, eta: '34 min', owner: 'Henry', status: 'Needs support' },
  { lane: 'Door 5', trailer: 'Import container', progress: 39, eta: '1 hr 06 min', owner: 'Kris', status: 'Congested' },
  { lane: 'Door 8', trailer: 'Vendor replenishment', progress: 93, eta: '6 min', owner: 'Yussif', status: 'Closing' },
];

export const inventoryZones = [
  { zone: 'Zone A', accuracy: 99.4, issue: 'None', action: 'Keep standard cadence' },
  { zone: 'Zone B', accuracy: 97.9, issue: 'High variance', action: 'Cycle count hold + audit top 20 SKUs' },
  { zone: 'Cold Storage', accuracy: 98.8, issue: 'Labeling lag', action: 'Review receiving scan compliance' },
  { zone: 'Pick Module 2', accuracy: 99.1, issue: 'Short-pick risk', action: 'Advance replenishment by 20 min' },
];

export const laborSegments = [
  { team: 'Receiving', staffed: 11, planned: 12, utilization: 87, note: 'One reassignment available after 10:30.' },
  { team: 'Picking', staffed: 18, planned: 17, utilization: 92, note: 'Best flex pool for dock support.' },
  { team: 'Inventory', staffed: 6, planned: 7, utilization: 83, note: 'Variance queue growing in Zone B.' },
  { team: 'Lift Drivers', staffed: 6, planned: 8, utilization: 76, note: 'Goal is 45 moves/day per driver.' },
];

export const downtimeEvents = [
  { area: 'Aisle 14', duration: 31, cause: 'Lift congestion', owner: 'Kris', state: 'Open' },
  { area: 'Sorter lane 2', duration: 28, cause: 'Jam reset', owner: 'Maintenance', state: 'Monitoring' },
  { area: 'Door 6 staging', duration: 26, cause: 'Pallet overflow', owner: 'Receiving lead', state: 'Open' },
];

export const reportCards = [
  {
    title: 'Daily Shift Summary',
    description: 'Shift attainment, labor moves, dock flow, and AI intervention timeline.',
    metrics: ['41 active workers', '126 picks/hr', '3 open alerts'],
  },
  {
    title: 'Downtime Report',
    description: 'All events above the 25-minute threshold with root cause and action owner.',
    metrics: ['3 qualifying events', '85 min total impact', '2 unresolved'],
  },
  {
    title: 'Receiving Performance',
    description: 'Door-by-door progress against 30-minute LTL/transfer and 2-hour container targets.',
    metrics: ['62 / 91 loads touched', 'Door 3 behind pace', 'Dock-to-stock +26 min'],
  },
  {
    title: 'Inventory Accuracy',
    description: 'Zone-level accuracy, variance exposure, and cycle count completion.',
    metrics: ['98.7% total accuracy', 'Zone B watch', '142 / 200 counts complete'],
  },
  {
    title: 'Labor Productivity',
    description: 'Staffed vs planned labor, utilization, and flex recommendations by workstream.',
    metrics: ['84% utilization', 'Lift team under target', '1 picker can rebalance'],
  },
  {
    title: 'AI Recommended Actions',
    description: 'Exportable recommendation log with timestamps, risk level, and expected impact.',
    metrics: ['4 live recommendations', '2 high-priority', '1 labor rebalance pending'],
  },
];

export const reportHighlights = [
  'Receiving targets: 30 min for LTL/transfer, 2 hr for container unloads.',
  'Lift driver goal: 45 moves/day.',
  'Cycle count goal: 200 counts/shift.',
  'Downtime threshold: 25+ minutes before escalation.',
];
