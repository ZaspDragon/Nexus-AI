import { describe, expect, it } from 'vitest';
import { routeTask } from './modelRouter';

describe('routeTask', () => {
  it('routes research tasks to Gemini', () => {
    expect(routeTask('Research competitors in AI sales tools').primaryModel).toBe('Gemini');
  });

  it('routes writing tasks to Claude', () => {
    expect(routeTask('Write a follow-up email for investors').primaryModel).toBe('Claude');
  });

  it('routes coding tasks to GPT', () => {
    expect(routeTask('Refactor this React component and update the API layer').primaryModel).toBe('GPT');
  });

  it('routes quick tasks to LLaMA / Groq', () => {
    expect(routeTask('Quick summary please').primaryModel).toBe('LLaMA / Groq');
  });
});
