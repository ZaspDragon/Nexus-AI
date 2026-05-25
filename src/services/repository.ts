import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import { buildDemoDataset } from '../data/demoData';
import { db } from './firebase';
import type {
  Agent,
  AgentRun,
  AppMode,
  DemoDataset,
  MemoryNote,
  Organization,
  ToolDefinition,
  UsageLog,
  UserProfile,
  WorkspaceSnapshot,
} from '../types';

const COLLECTIONS = {
  users: 'users',
  agents: 'agents',
  agentRuns: 'agentRuns',
  memories: 'memories',
  tools: 'tools',
  usageLogs: 'usageLogs',
  organizations: 'organizations',
} as const;

const demoStorageKey = (uid: string) => `nexus-ai-demo-v1:${uid}`;

const readDemoDataset = (profile: UserProfile): DemoDataset => {
  const stored = localStorage.getItem(demoStorageKey(profile.uid));
  if (!stored) {
    const seeded = buildDemoDataset(profile);
    localStorage.setItem(demoStorageKey(profile.uid), JSON.stringify(seeded));
    return seeded;
  }
  return JSON.parse(stored) as DemoDataset;
};

const writeDemoDataset = (profile: UserProfile, dataset: DemoDataset) => {
  localStorage.setItem(demoStorageKey(profile.uid), JSON.stringify(dataset));
};

const sortByCreatedDesc = <T extends { createdAt: number }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt - a.createdAt);

const createId = (prefix: string) => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

const upsertById = <T extends { id: string }>(items: T[], value: T) => {
  const exists = items.some((item) => item.id === value.id);
  if (!exists) return [value, ...items];
  return items.map((item) => (item.id === value.id ? value : item));
};

const toSnapshot = (dataset: DemoDataset): WorkspaceSnapshot => ({
  organization: dataset.organization,
  agents: sortByCreatedDesc(dataset.agents),
  runs: sortByCreatedDesc(dataset.runs),
  memories: sortByCreatedDesc(dataset.memories),
  tools: [...dataset.tools].sort((a, b) => a.name.localeCompare(b.name)),
  usageLogs: sortByCreatedDesc(dataset.usageLogs),
});

const getFirestoreInstance = (): Firestore => {
  if (!db) throw new Error('Firebase is not configured.');
  return db;
};

const ensureFirestoreSeed = async (profile: UserProfile) => {
  const firestore = getFirestoreInstance();
  const seed = buildDemoDataset(profile);

  await setDoc(doc(firestore, COLLECTIONS.users, profile.uid), profile, { merge: true });
  await setDoc(doc(firestore, COLLECTIONS.organizations, profile.organizationId), seed.organization, {
    merge: true,
  });

  const [agentsSnapshot, toolsSnapshot] = await Promise.all([
    getDocs(
      query(collection(firestore, COLLECTIONS.agents), where('organizationId', '==', profile.organizationId)),
    ),
    getDocs(
      query(collection(firestore, COLLECTIONS.tools), where('organizationId', '==', profile.organizationId)),
    ),
  ]);

  if (agentsSnapshot.empty) {
    await Promise.all(
      seed.agents.map((agent) => setDoc(doc(firestore, COLLECTIONS.agents, agent.id), agent)),
    );
    await Promise.all(
      seed.memories.map((memory) => setDoc(doc(firestore, COLLECTIONS.memories, memory.id), memory)),
    );
    await Promise.all(
      seed.runs.map((run) => setDoc(doc(firestore, COLLECTIONS.agentRuns, run.id), run)),
    );
    await Promise.all(
      seed.usageLogs.map((log) => setDoc(doc(firestore, COLLECTIONS.usageLogs, log.id), log)),
    );
  }

  if (toolsSnapshot.empty) {
    await Promise.all(
      seed.tools.map((tool) => setDoc(doc(firestore, COLLECTIONS.tools, tool.id), tool)),
    );
  }
};

const loadFirestoreCollection = async <T extends { organizationId: string }>(
  collectionName: string,
  organizationId: string,
) => {
  const firestore = getFirestoreInstance();
  const snapshot = await getDocs(
    query(collection(firestore, collectionName), where('organizationId', '==', organizationId)),
  );
  return snapshot.docs.map((item) => item.data() as T);
};

export const bootstrapWorkspace = async (profile: UserProfile, mode: AppMode) => {
  if (mode === 'demo') {
    readDemoDataset(profile);
    return;
  }

  await ensureFirestoreSeed(profile);
};

export const loadWorkspace = async (
  profile: UserProfile,
  mode: AppMode,
): Promise<WorkspaceSnapshot> => {
  if (mode === 'demo') {
    return toSnapshot(readDemoDataset(profile));
  }

  const firestore = getFirestoreInstance();
  const organizationDoc = await getDoc(doc(firestore, COLLECTIONS.organizations, profile.organizationId));
  const [agents, runs, memories, tools, usageLogs] = await Promise.all([
    loadFirestoreCollection<Agent>(COLLECTIONS.agents, profile.organizationId),
    loadFirestoreCollection<AgentRun>(COLLECTIONS.agentRuns, profile.organizationId),
    loadFirestoreCollection<MemoryNote>(COLLECTIONS.memories, profile.organizationId),
    loadFirestoreCollection<ToolDefinition>(COLLECTIONS.tools, profile.organizationId),
    loadFirestoreCollection<UsageLog>(COLLECTIONS.usageLogs, profile.organizationId),
  ]);

  return {
    organization: organizationDoc.data() as Organization,
    agents: sortByCreatedDesc(agents),
    runs: sortByCreatedDesc(runs),
    memories: sortByCreatedDesc(memories),
    tools: [...tools].sort((a, b) => a.name.localeCompare(b.name)),
    usageLogs: sortByCreatedDesc(usageLogs),
  };
};

export const saveAgent = async (
  profile: UserProfile,
  mode: AppMode,
  agent: Omit<Agent, 'id' | 'organizationId' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<Agent> => {
  const existingDemoAgent =
    mode === 'demo' ? readDemoDataset(profile).agents.find((item) => item.id === agent.id) : null;
  const savedAgent: Agent = {
    ...agent,
    id: agent.id ?? createId('agent'),
    organizationId: profile.organizationId,
    ownerId: profile.uid,
    createdAt: existingDemoAgent?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  if (mode === 'demo') {
    const dataset = readDemoDataset(profile);
    dataset.agents = upsertById(dataset.agents, savedAgent);
    writeDemoDataset(profile, dataset);
    return savedAgent;
  }

  const firestore = getFirestoreInstance();
  const existingDoc = savedAgent.id
    ? await getDoc(doc(firestore, COLLECTIONS.agents, savedAgent.id))
    : null;
  if (existingDoc?.exists()) {
    savedAgent.createdAt = (existingDoc.data() as Agent).createdAt;
  }
  await setDoc(doc(firestore, COLLECTIONS.agents, savedAgent.id), savedAgent, { merge: true });
  return savedAgent;
};

export const saveMemory = async (
  profile: UserProfile,
  mode: AppMode,
  memory: Omit<MemoryNote, 'id' | 'organizationId' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<MemoryNote> => {
  const existingDemoMemory =
    mode === 'demo' ? readDemoDataset(profile).memories.find((item) => item.id === memory.id) : null;
  const savedMemory: MemoryNote = {
    ...memory,
    id: memory.id ?? createId('memory'),
    organizationId: profile.organizationId,
    ownerId: profile.uid,
    createdAt: existingDemoMemory?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  if (mode === 'demo') {
    const dataset = readDemoDataset(profile);
    dataset.memories = upsertById(dataset.memories, savedMemory);
    writeDemoDataset(profile, dataset);
    return savedMemory;
  }

  const firestore = getFirestoreInstance();
  const existingDoc = savedMemory.id
    ? await getDoc(doc(firestore, COLLECTIONS.memories, savedMemory.id))
    : null;
  if (existingDoc?.exists()) {
    savedMemory.createdAt = (existingDoc.data() as MemoryNote).createdAt;
  }
  await setDoc(doc(firestore, COLLECTIONS.memories, savedMemory.id), savedMemory, { merge: true });
  return savedMemory;
};

export const saveTool = async (
  profile: UserProfile,
  mode: AppMode,
  tool: ToolDefinition,
): Promise<ToolDefinition> => {
  if (mode === 'demo') {
    const dataset = readDemoDataset(profile);
    dataset.tools = upsertById(dataset.tools, tool);
    writeDemoDataset(profile, dataset);
    return tool;
  }

  const firestore = getFirestoreInstance();
  await setDoc(doc(firestore, COLLECTIONS.tools, tool.id), tool, { merge: true });
  return tool;
};

export const saveOrganization = async (
  profile: UserProfile,
  mode: AppMode,
  organization: Organization,
): Promise<Organization> => {
  const savedOrganization = {
    ...organization,
    updatedAt: Date.now(),
  };

  if (mode === 'demo') {
    const dataset = readDemoDataset(profile);
    dataset.organization = savedOrganization;
    writeDemoDataset(profile, dataset);
    return savedOrganization;
  }

  const firestore = getFirestoreInstance();
  await setDoc(doc(firestore, COLLECTIONS.organizations, organization.id), savedOrganization, {
    merge: true,
  });
  return savedOrganization;
};

export const saveRun = async (
  profile: UserProfile,
  mode: AppMode,
  run: Omit<AgentRun, 'id' | 'organizationId' | 'ownerId' | 'createdAt'>,
): Promise<AgentRun> => {
  const savedRun: AgentRun = {
    ...run,
    id: createId('run'),
    organizationId: profile.organizationId,
    ownerId: profile.uid,
    createdAt: Date.now(),
  };

  if (mode === 'demo') {
    const dataset = readDemoDataset(profile);
    dataset.runs = [savedRun, ...dataset.runs];
    writeDemoDataset(profile, dataset);
    return savedRun;
  }

  const firestore = getFirestoreInstance();
  await setDoc(doc(firestore, COLLECTIONS.agentRuns, savedRun.id), savedRun);
  return savedRun;
};

export const saveUsageLog = async (
  profile: UserProfile,
  mode: AppMode,
  log: Omit<UsageLog, 'id' | 'organizationId' | 'ownerId' | 'createdAt'>,
): Promise<UsageLog> => {
  const savedLog: UsageLog = {
    ...log,
    id: createId('usage'),
    organizationId: profile.organizationId,
    ownerId: profile.uid,
    createdAt: Date.now(),
  };

  if (mode === 'demo') {
    const dataset = readDemoDataset(profile);
    dataset.usageLogs = [savedLog, ...dataset.usageLogs];
    writeDemoDataset(profile, dataset);
    return savedLog;
  }

  const firestore = getFirestoreInstance();
  await setDoc(doc(firestore, COLLECTIONS.usageLogs, savedLog.id), savedLog);
  return savedLog;
};
