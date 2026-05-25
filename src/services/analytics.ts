import type { WorkspaceSnapshot } from '../types';

export const calculateDashboardStats = (snapshot: WorkspaceSnapshot) => {
  const totalAgents = snapshot.agents.length;
  const tasksCompleted = snapshot.runs.length;
  const estimatedMonthlyCost = snapshot.usageLogs.reduce((sum, log) => sum + log.estimatedCost, 0);
  const savedMemories = snapshot.memories.length;
  const activeTools = snapshot.tools.filter((tool) => tool.enabled).length;

  return {
    totalAgents,
    tasksCompleted,
    estimatedMonthlyCost: Number(estimatedMonthlyCost.toFixed(2)),
    savedMemories,
    activeTools,
  };
};
