import { describe, expect, it } from 'vitest';
import { buildDemoDataset } from '../data/demoData';
import { runMockOrchestration } from './mockOrchestrator';

const profile = {
  uid: 'demo_user',
  organizationId: 'org_demo_nexus',
  displayName: 'Demo User',
  email: 'demo@nexus.ai',
  role: 'owner' as const,
  demoMode: true,
};

describe('runMockOrchestration', () => {
  it('returns the full orchestration phases and output', () => {
    const dataset = buildDemoDataset(profile);
    const result = runMockOrchestration({
      agent: dataset.agents[0],
      task: 'Plan a launch and write the executive summary.',
      memories: dataset.memories,
      tools: dataset.tools,
    });

    expect(result.orchestration.map((step) => step.phase)).toEqual([
      'planning',
      'routing',
      'tools',
      'memory',
      'final',
    ]);
    expect(result.finalOutput).toContain('Execution plan');
    expect(result.estimatedTokens).toBeGreaterThan(0);
  });
});
