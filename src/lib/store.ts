import fs from 'fs';
import path from 'path';
import { 
  OperationalRole, 
  RoutineBlock, 
  DailyRitual, 
  RoutineExecution, 
  RoutineBlockWithExecution,
  ExecutionStatus,
  GovernanceMinute,
  SystemUser
} from './types';
import { INITIAL_ROLES, INITIAL_BLOCKS, INITIAL_RITUALS, INITIAL_MINUTES, INITIAL_USERS } from './seed-data';

interface AppStore {
  roles: OperationalRole[];
  blocks: RoutineBlock[];
  rituals: DailyRitual[];
  executions: RoutineExecution[];
  dispatchNotes: { 
    [key: string]: { 
      notes: string; 
      checklist: { [itemIndex: number]: boolean };
      boardVotes?: { [itemIndex: number]: { [voterName: string]: 'favorable' | 'contrary' | 'abstention' } };
      resolutionNotes?: { [itemIndex: number]: string };
    } 
  };
  minutes: GovernanceMinute[];
  users: SystemUser[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function getInitialStore(): AppStore {
  return {
    roles: INITIAL_ROLES,
    blocks: INITIAL_BLOCKS,
    rituals: INITIAL_RITUALS,
    executions: [],
    dispatchNotes: {},
    minutes: INITIAL_MINUTES,
    users: INITIAL_USERS
  };
}

function readStore(): AppStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.minutes) {
      parsed.minutes = INITIAL_MINUTES;
    }
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = INITIAL_USERS;
    }
    if (parsed.rituals && Array.isArray(parsed.rituals)) {
      for (const initRit of INITIAL_RITUALS) {
        const found = parsed.rituals.find((r: any) => r.id === initRit.id);
        if (!found) {
          parsed.rituals.push(initRit);
        } else if (!found.frequency) {
          found.frequency = initRit.frequency || 'daily';
          found.weekDays = initRit.weekDays || [1, 2, 3, 4, 5];
          found.includeWeekends = initRit.includeWeekends || false;
        }
      }
    }
    return parsed;
  } catch (err) {
    console.error('Error reading store file, using initial store:', err);
    return getInitialStore();
  }
}

function writeStore(store: AppStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file:', err);
  }
}

// Get all roles
export async function getRoles(): Promise<OperationalRole[]> {
  const store = readStore();
  return store.roles;
}

// Get single role
export async function getRoleById(id: string): Promise<OperationalRole | null> {
  const store = readStore();
  return store.roles.find(r => r.id === id) || null;
}

// Create role
export async function createRole(data: Omit<OperationalRole, 'id' | 'createdAt'>): Promise<OperationalRole> {
  const store = readStore();
  const nextNum = store.roles.length + 1;
  const newRole: OperationalRole = {
    id: `role-${Date.now()}`,
    code: data.code || `CAD-${(data.department || 'FAC').substring(0, 3).toUpperCase()}-0${nextNum}`,
    title: data.title,
    department: data.department,
    description: data.description,
    createdAt: new Date().toISOString()
  };
  store.roles.push(newRole);
  writeStore(store);
  return newRole;
}

// Update role
export async function updateRole(id: string, data: Partial<OperationalRole>): Promise<OperationalRole | null> {
  const store = readStore();
  const index = store.roles.findIndex(r => r.id === id);
  if (index === -1) return null;
  store.roles[index] = { ...store.roles[index], ...data };
  writeStore(store);
  return store.roles[index];
}

// Delete role
export async function deleteRole(id: string): Promise<boolean> {
  const store = readStore();
  store.roles = store.roles.filter(r => r.id !== id);
  store.blocks = store.blocks.filter(b => b.roleId !== id);
  store.rituals = store.rituals.filter(r => r.roleId !== id);
  writeStore(store);
  return true;
}

// Get blocks with execution state for a given date
export async function getBlocksForRole(roleId: string, dateStr?: string): Promise<RoutineBlockWithExecution[]> {
  const store = readStore();
  const today = dateStr || new Date().toISOString().split('T')[0];
  
  const blocks = store.blocks
    .filter(b => b.roleId === roleId)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return blocks.map(block => {
    const execution = store.executions.find(
      e => e.routineBlockId === block.id && e.date === today
    );
    return {
      ...block,
      execution
    };
  });
}

// Get all blocks
export async function getAllBlocks(): Promise<RoutineBlock[]> {
  const store = readStore();
  return store.blocks.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

// Create routine block
export async function createRoutineBlock(data: Omit<RoutineBlock, 'id'>): Promise<RoutineBlock> {
  const store = readStore();
  const count = store.blocks.filter(b => b.roleId === data.roleId).length + 1;
  const newBlock: RoutineBlock = {
    id: `block-${Date.now()}`,
    code: data.code || `POP-FAC-00${count}`,
    version: data.version || 'v1.0',
    homologatedBy: data.homologatedBy || 'Diretoria de Operações',
    ...data,
    orderIndex: data.orderIndex || count
  };
  store.blocks.push(newBlock);
  writeStore(store);
  return newBlock;
}

// Update routine block
export async function updateRoutineBlock(id: string, data: Partial<RoutineBlock>): Promise<RoutineBlock | null> {
  const store = readStore();
  const index = store.blocks.findIndex(b => b.id === id);
  if (index === -1) return null;
  store.blocks[index] = { ...store.blocks[index], ...data };
  writeStore(store);
  return store.blocks[index];
}

// Delete routine block
export async function deleteRoutineBlock(id: string): Promise<boolean> {
  const store = readStore();
  store.blocks = store.blocks.filter(b => b.id !== id);
  store.executions = store.executions.filter(e => e.routineBlockId !== id);
  writeStore(store);
  return true;
}

// Toggle / set execution status with delay tracking
export async function setBlockExecution(
  blockId: string, 
  dateStr: string, 
  status: ExecutionStatus, 
  observation?: string,
  verifiedBy?: string,
  delayInfo?: {
    isDelayed?: boolean;
    delayMinutes?: number;
    delayReason?: string;
    delayCategory?: string;
  }
): Promise<RoutineExecution> {
  const store = readStore();
  const existingIndex = store.executions.findIndex(
    e => e.routineBlockId === blockId && e.date === dateStr
  );

  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  if (existingIndex >= 0) {
    store.executions[existingIndex] = {
      ...store.executions[existingIndex],
      status,
      observation: observation !== undefined ? observation : store.executions[existingIndex].observation,
      completedAt: completedAt || (status === 'completed' ? store.executions[existingIndex].completedAt : null),
      verifiedBy: verifiedBy || store.executions[existingIndex].verifiedBy,
      isDelayed: delayInfo?.isDelayed !== undefined ? delayInfo.isDelayed : store.executions[existingIndex].isDelayed,
      delayMinutes: delayInfo?.delayMinutes !== undefined ? delayInfo.delayMinutes : store.executions[existingIndex].delayMinutes,
      delayReason: delayInfo?.delayReason !== undefined ? delayInfo.delayReason : store.executions[existingIndex].delayReason,
      delayCategory: delayInfo?.delayCategory !== undefined ? delayInfo.delayCategory : store.executions[existingIndex].delayCategory
    };
    writeStore(store);
    return store.executions[existingIndex];
  } else {
    const newExec: RoutineExecution = {
      id: `exec-${Date.now()}`,
      routineBlockId: blockId,
      date: dateStr,
      status,
      observation: observation || null,
      completedAt,
      verifiedBy: verifiedBy || null,
      isDelayed: delayInfo?.isDelayed || false,
      delayMinutes: delayInfo?.delayMinutes || 0,
      delayReason: delayInfo?.delayReason || null,
      delayCategory: delayInfo?.delayCategory || null
    };
    store.executions.push(newExec);
    writeStore(store);
    return newExec;
  }
}

// Daily Rituals
export async function getRitualsForRole(roleId: string): Promise<DailyRitual[]> {
  const store = readStore();
  return store.rituals.filter(r => r.roleId === roleId);
}

export async function createDailyRitual(data: Omit<DailyRitual, 'id'>): Promise<DailyRitual> {
  const store = readStore();
  const newRitual: DailyRitual = {
    id: `ritual-${Date.now()}`,
    code: data.code || `RIT-${store.rituals.length + 1}`,
    ...data
  };
  store.rituals.push(newRitual);
  writeStore(store);
  return newRitual;
}

export async function updateDailyRitual(id: string, data: Partial<DailyRitual>): Promise<DailyRitual | null> {
  const store = readStore();
  const index = store.rituals.findIndex(r => r.id === id);
  if (index === -1) return null;
  store.rituals[index] = { ...store.rituals[index], ...data };
  writeStore(store);
  return store.rituals[index];
}

export async function deleteDailyRitual(id: string): Promise<boolean> {
  const store = readStore();
  store.rituals = store.rituals.filter(r => r.id !== id);
  writeStore(store);
  return true;
}

// Dispatch Room Notes and Checklist Save
export async function getDispatchRoomState(ritualId: string, dateStr: string) {
  const store = readStore();
  const key = `${ritualId}_${dateStr}`;
  return store.dispatchNotes?.[key] || { notes: '', checklist: {} };
}

export async function saveDispatchRoomState(
  ritualId: string, 
  dateStr: string, 
  notes: string, 
  checklist: { [itemIndex: number]: boolean },
  boardVotes?: { [itemIndex: number]: { [voterName: string]: 'favorable' | 'contrary' | 'abstention' } },
  resolutionNotes?: { [itemIndex: number]: string }
) {
  const store = readStore();
  if (!store.dispatchNotes) {
    store.dispatchNotes = {};
  }
  const key = `${ritualId}_${dateStr}`;
  store.dispatchNotes[key] = { 
    notes, 
    checklist, 
    boardVotes: boardVotes || {}, 
    resolutionNotes: resolutionNotes || {} 
  };
  writeStore(store);
  return store.dispatchNotes[key];
}

// Governance Minutes
export async function getGovernanceMinutes(roleId?: string): Promise<GovernanceMinute[]> {
  const store = readStore();
  if (roleId) {
    return (store.minutes || []).filter(m => m.roleId === roleId);
  }
  return store.minutes || [];
}

export async function createGovernanceMinute(data: Omit<GovernanceMinute, 'id' | 'signedAt'>): Promise<GovernanceMinute> {
  const store = readStore();
  if (!store.minutes) store.minutes = [];
  
  const minute: GovernanceMinute = {
    id: `min-${Date.now()}`,
    ...data,
    signedAt: new Date().toISOString()
  };
  store.minutes.unshift(minute);
  writeStore(store);
  return minute;
}

// Reset store back to defaults
export async function resetToDefaultSeed(): Promise<void> {
  const initial = getInitialStore();
  writeStore(initial);
}

// User Management (RBAC / IAM)
export async function getUsers(): Promise<SystemUser[]> {
  const store = readStore();
  return store.users || INITIAL_USERS;
}

export async function getUserById(id: string): Promise<SystemUser | null> {
  const store = readStore();
  return (store.users || []).find(u => u.id === id) || null;
}

export async function createUser(data: Omit<SystemUser, 'id'>): Promise<SystemUser> {
  const store = readStore();
  if (!store.users) store.users = [...INITIAL_USERS];

  const colors = [
    'bg-blue-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-purple-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white'
  ];
  const avatarColor = data.avatarColor || colors[store.users.length % colors.length];

  const newUser: SystemUser = {
    id: `user-${Date.now()}`,
    ...data,
    avatarColor,
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);
  writeStore(store);
  return newUser;
}

export async function updateUser(id: string, data: Partial<SystemUser>): Promise<SystemUser | null> {
  const store = readStore();
  if (!store.users) store.users = [...INITIAL_USERS];

  const index = store.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  store.users[index] = {
    ...store.users[index],
    ...data
  };
  writeStore(store);
  return store.users[index];
}

export async function deleteUser(id: string): Promise<boolean> {
  const store = readStore();
  if (!store.users) return false;

  const initialLen = store.users.length;
  store.users = store.users.filter(u => u.id !== id);
  if (store.users.length < initialLen) {
    writeStore(store);
    return true;
  }
  return false;
}

