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
  SystemUser,
  GovernanceAction,
  ActionNote
} from './types';
import { INITIAL_ROLES, INITIAL_BLOCKS, INITIAL_RITUALS, INITIAL_MINUTES, INITIAL_USERS, INITIAL_ACTIONS } from './seed-data';
import { prisma } from './prisma';

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
  actions: GovernanceAction[];
}

// No ambiente serverless da Vercel, o diretório raiz é somente leitura (read-only)
// Utilizamos /tmp para persistência de sessão e fallback
const DATA_DIR = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? path.join('/tmp', 'rgr-data')
  : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function getInitialStore(): AppStore {
  return {
    roles: INITIAL_ROLES,
    blocks: INITIAL_BLOCKS,
    rituals: INITIAL_RITUALS,
    executions: [],
    dispatchNotes: {},
    minutes: INITIAL_MINUTES,
    users: INITIAL_USERS,
    actions: INITIAL_ACTIONS
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
    if (!parsed.actions || !Array.isArray(parsed.actions) || parsed.actions.length === 0) {
      parsed.actions = INITIAL_ACTIONS;
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

const isDbConfigured = Boolean(process.env.DATABASE_URL);

// =========================================================================
// 1. ROLES (CADEIRAS OPERACIONAIS)
// =========================================================================

export async function getRoles(): Promise<OperationalRole[]> {
  if (isDbConfigured) {
    try {
      const dbRoles = await prisma.operationalRole.findMany({
        orderBy: { createdAt: 'asc' }
      });
      if (dbRoles.length > 0) {
        return dbRoles.map(r => ({
          id: r.id,
          code: r.code || undefined,
          title: r.title,
          department: r.department,
          description: r.description,
          createdAt: r.createdAt.toISOString()
        }));
      }
    } catch (e) {
      console.warn('Prisma getRoles error, fallback to local store:', e);
    }
  }
  const store = readStore();
  return store.roles;
}

export async function getRoleById(id: string): Promise<OperationalRole | null> {
  if (isDbConfigured) {
    try {
      const r = await prisma.operationalRole.findUnique({ where: { id } });
      if (r) {
        return {
          id: r.id,
          code: r.code || undefined,
          title: r.title,
          department: r.department,
          description: r.description,
          createdAt: r.createdAt.toISOString()
        };
      }
    } catch (e) {
      console.warn('Prisma getRoleById error, fallback:', e);
    }
  }
  const store = readStore();
  return store.roles.find(r => r.id === id) || null;
}

export async function createRole(data: Omit<OperationalRole, 'id' | 'createdAt'>): Promise<OperationalRole> {
  if (isDbConfigured) {
    try {
      const nextNum = (await prisma.operationalRole.count()) + 1;
      const code = data.code || `CAD-${(data.department || 'FAC').substring(0, 3).toUpperCase()}-0${nextNum}`;
      const created = await prisma.operationalRole.create({
        data: {
          code,
          title: data.title,
          department: data.department,
          description: data.description,
        }
      });
      return {
        id: created.id,
        code: created.code || undefined,
        title: created.title,
        department: created.department,
        description: created.description,
        createdAt: created.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma createRole error, fallback:', e);
    }
  }

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

export async function updateRole(id: string, data: Partial<OperationalRole>): Promise<OperationalRole | null> {
  if (isDbConfigured) {
    try {
      const updated = await prisma.operationalRole.update({
        where: { id },
        data: {
          code: data.code,
          title: data.title,
          department: data.department,
          description: data.description
        }
      });
      return {
        id: updated.id,
        code: updated.code || undefined,
        title: updated.title,
        department: updated.department,
        description: updated.description,
        createdAt: updated.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma updateRole error, fallback:', e);
    }
  }

  const store = readStore();
  const index = store.roles.findIndex(r => r.id === id);
  if (index === -1) return null;
  store.roles[index] = { ...store.roles[index], ...data };
  writeStore(store);
  return store.roles[index];
}

export async function deleteRole(id: string): Promise<boolean> {
  if (isDbConfigured) {
    try {
      await prisma.operationalRole.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn('Prisma deleteRole error, fallback:', e);
    }
  }

  const store = readStore();
  store.roles = store.roles.filter(r => r.id !== id);
  store.blocks = store.blocks.filter(b => b.roleId !== id);
  store.rituals = store.rituals.filter(r => r.roleId !== id);
  writeStore(store);
  return true;
}

// =========================================================================
// 2. ROUTINE BLOCKS & POPS
// =========================================================================

export async function getAllBlocks(): Promise<RoutineBlock[]> {
  if (isDbConfigured) {
    try {
      const dbBlocks = await prisma.routineBlock.findMany({
        orderBy: { orderIndex: 'asc' }
      });
      if (dbBlocks.length > 0) {
        return dbBlocks.map(b => ({
          id: b.id,
          roleId: b.roleId,
          code: b.code || undefined,
          version: b.version || 'v1.0',
          homologatedBy: b.homologatedBy || undefined,
          timeWindow: b.timeWindow,
          title: b.title,
          deliverable: b.deliverable,
          sopMarkdown: b.sopMarkdown,
          frequency: b.frequency as any,
          dayOfWeek: b.dayOfWeek || undefined,
          dayOfMonth: b.dayOfMonth || undefined,
          orderIndex: b.orderIndex,
          createdAt: b.createdAt.toISOString()
        }));
      }
    } catch (e) {
      console.warn('Prisma getAllBlocks error, fallback:', e);
    }
  }

  const store = readStore();
  return store.blocks;
}

export async function getBlocksForRole(roleId: string, dateStr?: string): Promise<RoutineBlockWithExecution[]> {
  const today = dateStr || new Date().toISOString().split('T')[0];

  if (isDbConfigured) {
    try {
      const dbBlocks = await prisma.routineBlock.findMany({
        where: { roleId },
        include: {
          executions: {
            where: { date: today }
          }
        },
        orderBy: { orderIndex: 'asc' }
      });

      if (dbBlocks.length > 0) {
        return dbBlocks.map(b => {
          const rawExec = b.executions[0];
          let execution: RoutineExecution | undefined;
          if (rawExec) {
            execution = {
              id: rawExec.id,
              routineBlockId: rawExec.routineBlockId,
              date: rawExec.date,
              status: rawExec.status as ExecutionStatus,
              observation: rawExec.observation,
              completedAt: rawExec.completedAt ? rawExec.completedAt.toISOString() : null,
              verifiedBy: rawExec.verifiedBy,
              isDelayed: rawExec.isDelayed || false,
              delayMinutes: rawExec.delayMinutes || 0,
              delayReason: rawExec.delayReason,
              delayCategory: rawExec.delayCategory
            };
          }
          return {
            id: b.id,
            roleId: b.roleId,
            code: b.code || undefined,
            version: b.version || 'v1.0',
            homologatedBy: b.homologatedBy || undefined,
            timeWindow: b.timeWindow,
            title: b.title,
            deliverable: b.deliverable,
            sopMarkdown: b.sopMarkdown,
            frequency: b.frequency as any,
            dayOfWeek: b.dayOfWeek,
            dayOfMonth: b.dayOfMonth,
            orderIndex: b.orderIndex,
            createdAt: b.createdAt.toISOString(),
            execution
          };
        });
      }
    } catch (e) {
      console.warn('Prisma getBlocksForRole error, fallback:', e);
    }
  }

  const store = readStore();
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

export async function createRoutineBlock(data: Omit<RoutineBlock, 'id' | 'createdAt'>): Promise<RoutineBlock> {
  if (isDbConfigured) {
    try {
      const created = await prisma.routineBlock.create({
        data: {
          roleId: data.roleId,
          code: data.code,
          version: data.version || 'v1.0',
          homologatedBy: data.homologatedBy,
          timeWindow: data.timeWindow,
          title: data.title,
          deliverable: data.deliverable,
          sopMarkdown: data.sopMarkdown,
          frequency: (data.frequency as any) || 'daily',
          orderIndex: data.orderIndex || 0
        }
      });
      return {
        id: created.id,
        roleId: created.roleId,
        code: created.code || undefined,
        version: created.version || 'v1.0',
        homologatedBy: created.homologatedBy || undefined,
        timeWindow: created.timeWindow,
        title: created.title,
        deliverable: created.deliverable,
        sopMarkdown: created.sopMarkdown,
        frequency: created.frequency as any,
        orderIndex: created.orderIndex,
        createdAt: created.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma createRoutineBlock error, fallback:', e);
    }
  }

  const store = readStore();
  const newBlock: RoutineBlock = {
    id: `block-${Date.now()}`,
    ...data,
    orderIndex: data.orderIndex ?? store.blocks.length,
    createdAt: new Date().toISOString()
  };
  store.blocks.push(newBlock);
  writeStore(store);
  return newBlock;
}

export async function updateRoutineBlock(id: string, data: Partial<RoutineBlock>): Promise<RoutineBlock | null> {
  if (isDbConfigured) {
    try {
      const updated = await prisma.routineBlock.update({
        where: { id },
        data: {
          code: data.code,
          version: data.version,
          homologatedBy: data.homologatedBy,
          timeWindow: data.timeWindow,
          title: data.title,
          deliverable: data.deliverable,
          sopMarkdown: data.sopMarkdown,
          frequency: data.frequency as any,
          orderIndex: data.orderIndex
        }
      });
      return {
        id: updated.id,
        roleId: updated.roleId,
        code: updated.code || undefined,
        version: updated.version || 'v1.0',
        homologatedBy: updated.homologatedBy || undefined,
        timeWindow: updated.timeWindow,
        title: updated.title,
        deliverable: updated.deliverable,
        sopMarkdown: updated.sopMarkdown,
        frequency: updated.frequency as any,
        orderIndex: updated.orderIndex,
        createdAt: updated.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma updateRoutineBlock error, fallback:', e);
    }
  }

  const store = readStore();
  const index = store.blocks.findIndex(b => b.id === id);
  if (index === -1) return null;
  store.blocks[index] = { ...store.blocks[index], ...data };
  writeStore(store);
  return store.blocks[index];
}

export async function deleteRoutineBlock(id: string): Promise<boolean> {
  if (isDbConfigured) {
    try {
      await prisma.routineBlock.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn('Prisma deleteRoutineBlock error, fallback:', e);
    }
  }

  const store = readStore();
  store.blocks = store.blocks.filter(b => b.id !== id);
  store.executions = store.executions.filter(e => e.routineBlockId !== id);
  writeStore(store);
  return true;
}

// =========================================================================
// 3. EXECUTIONS & PONTUALIDADE / SLA
// =========================================================================

export async function getExecutionsForDate(dateStr: string): Promise<RoutineExecution[]> {
  if (isDbConfigured) {
    try {
      const dbExecs = await prisma.routineExecution.findMany({
        where: { date: dateStr }
      });
      return dbExecs.map(e => ({
        id: e.id,
        routineBlockId: e.routineBlockId,
        date: e.date,
        status: e.status as ExecutionStatus,
        observation: e.observation,
        completedAt: e.completedAt ? e.completedAt.toISOString() : null,
        verifiedBy: e.verifiedBy,
        isDelayed: e.isDelayed || false,
        delayMinutes: e.delayMinutes || 0,
        delayReason: e.delayReason,
        delayCategory: e.delayCategory
      }));
    } catch (e) {
      console.warn('Prisma getExecutionsForDate error, fallback:', e);
    }
  }

  const store = readStore();
  return store.executions.filter(e => e.date === dateStr);
}

export async function setExecutionStatus(
  blockId: string,
  dateStr: string,
  status: ExecutionStatus,
  observation?: string | null,
  verifiedBy?: string,
  delayInfo?: {
    isDelayed?: boolean;
    delayMinutes?: number;
    delayReason?: string;
    delayCategory?: string;
  }
): Promise<RoutineExecution> {
  const completedAtDate = status === 'completed' ? new Date() : null;

  if (isDbConfigured) {
    try {
      const upserted = await prisma.routineExecution.upsert({
        where: {
          routineBlockId_date: {
            routineBlockId: blockId,
            date: dateStr
          }
        },
        update: {
          status: status as any,
          observation: observation !== undefined ? observation : undefined,
          completedAt: completedAtDate,
          verifiedBy: verifiedBy || undefined,
          isDelayed: delayInfo?.isDelayed,
          delayMinutes: delayInfo?.delayMinutes,
          delayReason: delayInfo?.delayReason,
          delayCategory: delayInfo?.delayCategory
        },
        create: {
          routineBlockId: blockId,
          date: dateStr,
          status: status as any,
          observation: observation || null,
          completedAt: completedAtDate,
          verifiedBy: verifiedBy || null,
          isDelayed: delayInfo?.isDelayed || false,
          delayMinutes: delayInfo?.delayMinutes || 0,
          delayReason: delayInfo?.delayReason || null,
          delayCategory: delayInfo?.delayCategory || null
        }
      });

      return {
        id: upserted.id,
        routineBlockId: upserted.routineBlockId,
        date: upserted.date,
        status: upserted.status as ExecutionStatus,
        observation: upserted.observation,
        completedAt: upserted.completedAt ? upserted.completedAt.toISOString() : null,
        verifiedBy: upserted.verifiedBy,
        isDelayed: upserted.isDelayed || false,
        delayMinutes: upserted.delayMinutes || 0,
        delayReason: upserted.delayReason,
        delayCategory: upserted.delayCategory
      };
    } catch (e) {
      console.warn('Prisma setExecutionStatus error, fallback:', e);
    }
  }

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

export const setBlockExecution = setExecutionStatus;

// =========================================================================
// 4. DAILY RITUALS & PAUTAS DE CONSELHO
// =========================================================================

export async function getRitualsForRole(roleId: string): Promise<DailyRitual[]> {
  if (isDbConfigured) {
    try {
      const dbRituals = await prisma.dailyRitual.findMany({
        where: { roleId },
        orderBy: { timeSlot: 'asc' }
      });
      if (dbRituals.length > 0) {
        return dbRituals.map(r => ({
          id: r.id,
          roleId: r.roleId,
          code: r.code || undefined,
          timeSlot: r.timeSlot,
          title: r.title,
          durationMinutes: r.durationMinutes,
          type: (r.type as any) || 'operational_cadence',
          frequency: (r.frequency as any) || 'daily',
          weekDays: Array.isArray(r.weekDays) ? (r.weekDays as number[]) : undefined,
          includeWeekends: r.includeWeekends || false,
          monthDay: r.monthDay || undefined,
          monthlyType: (r.monthlyType as any) || undefined,
          agendaItems: Array.isArray(r.agendaItems) ? (r.agendaItems as string[]) : [],
          createdAt: r.createdAt.toISOString()
        }));
      }
    } catch (e) {
      console.warn('Prisma getRitualsForRole error, fallback:', e);
    }
  }

  const store = readStore();
  return store.rituals.filter(r => r.roleId === roleId);
}

export async function getAllRituals(): Promise<DailyRitual[]> {
  if (isDbConfigured) {
    try {
      const dbRituals = await prisma.dailyRitual.findMany({
        orderBy: { timeSlot: 'asc' }
      });
      if (dbRituals.length > 0) {
        return dbRituals.map(r => ({
          id: r.id,
          roleId: r.roleId,
          code: r.code || undefined,
          timeSlot: r.timeSlot,
          title: r.title,
          durationMinutes: r.durationMinutes,
          type: (r.type as any) || 'operational_cadence',
          frequency: (r.frequency as any) || 'daily',
          weekDays: Array.isArray(r.weekDays) ? (r.weekDays as number[]) : undefined,
          includeWeekends: r.includeWeekends || false,
          monthDay: r.monthDay || undefined,
          monthlyType: (r.monthlyType as any) || undefined,
          agendaItems: Array.isArray(r.agendaItems) ? (r.agendaItems as string[]) : [],
          createdAt: r.createdAt.toISOString()
        }));
      }
    } catch (e) {
      console.warn('Prisma getAllRituals error, fallback:', e);
    }
  }

  const store = readStore();
  return store.rituals;
}

export async function createDailyRitual(data: Omit<DailyRitual, 'id'>): Promise<DailyRitual> {
  if (isDbConfigured) {
    try {
      const created = await prisma.dailyRitual.create({
        data: {
          roleId: data.roleId,
          code: data.code,
          timeSlot: data.timeSlot,
          title: data.title,
          durationMinutes: data.durationMinutes,
          type: data.type || 'operational_cadence',
          frequency: data.frequency || 'daily',
          weekDays: (data.weekDays as any) ?? undefined,
          includeWeekends: data.includeWeekends || false,
          monthDay: data.monthDay ?? undefined,
          monthlyType: data.monthlyType ?? undefined,
          agendaItems: data.agendaItems as any
        }
      });
      return {
        id: created.id,
        roleId: created.roleId,
        code: created.code || undefined,
        timeSlot: created.timeSlot,
        title: created.title,
        durationMinutes: created.durationMinutes,
        type: (created.type as any) || 'operational_cadence',
        frequency: (created.frequency as any) || 'daily',
        weekDays: Array.isArray(created.weekDays) ? (created.weekDays as number[]) : undefined,
        includeWeekends: created.includeWeekends || false,
        monthDay: created.monthDay || undefined,
        monthlyType: (created.monthlyType as any) || undefined,
        agendaItems: Array.isArray(created.agendaItems) ? (created.agendaItems as string[]) : [],
        createdAt: created.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma createDailyRitual error, fallback:', e);
    }
  }

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
  if (isDbConfigured) {
    try {
      const updated = await prisma.dailyRitual.update({
        where: { id },
        data: {
          code: data.code,
          timeSlot: data.timeSlot,
          title: data.title,
          durationMinutes: data.durationMinutes,
          type: data.type,
          frequency: data.frequency,
          weekDays: data.weekDays !== undefined ? (data.weekDays as any) : undefined,
          includeWeekends: data.includeWeekends,
          monthDay: data.monthDay,
          monthlyType: data.monthlyType,
          agendaItems: data.agendaItems !== undefined ? (data.agendaItems as any) : undefined
        }
      });
      return {
        id: updated.id,
        roleId: updated.roleId,
        code: updated.code || undefined,
        timeSlot: updated.timeSlot,
        title: updated.title,
        durationMinutes: updated.durationMinutes,
        type: (updated.type as any) || 'operational_cadence',
        frequency: (updated.frequency as any) || 'daily',
        weekDays: Array.isArray(updated.weekDays) ? (updated.weekDays as number[]) : undefined,
        includeWeekends: updated.includeWeekends || false,
        monthDay: updated.monthDay || undefined,
        monthlyType: (updated.monthlyType as any) || undefined,
        agendaItems: Array.isArray(updated.agendaItems) ? (updated.agendaItems as string[]) : [],
        createdAt: updated.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma updateDailyRitual error, fallback:', e);
    }
  }

  const store = readStore();
  const index = store.rituals.findIndex(r => r.id === id);
  if (index === -1) return null;
  store.rituals[index] = { ...store.rituals[index], ...data };
  writeStore(store);
  return store.rituals[index];
}

export async function deleteDailyRitual(id: string): Promise<boolean> {
  if (isDbConfigured) {
    try {
      await prisma.dailyRitual.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn('Prisma deleteDailyRitual error, fallback:', e);
    }
  }

  const store = readStore();
  store.rituals = store.rituals.filter(r => r.id !== id);
  writeStore(store);
  return true;
}

// =========================================================================
// 5. DISPATCH ROOM STATE & BOARD COUNCIL VOTES
// =========================================================================

export async function getDispatchRoomState(ritualId: string, dateStr: string) {
  const sessionKey = `${ritualId}_${dateStr}`;

  if (isDbConfigured) {
    try {
      const state = await prisma.dispatchState.findUnique({
        where: { id: sessionKey }
      });
      if (state) {
        return {
          notes: state.notes || '',
          checklist: (state.checklist as any) || {},
          boardVotes: (state.boardVotes as any) || {},
          resolutionNotes: (state.resolutionNotes as any) || {}
        };
      }
    } catch (e) {
      console.warn('Prisma getDispatchRoomState error, fallback:', e);
    }
  }

  const store = readStore();
  return store.dispatchNotes?.[sessionKey] || { notes: '', checklist: {}, boardVotes: {}, resolutionNotes: {} };
}

export async function saveDispatchRoomState(
  ritualId: string,
  dateStr: string,
  notes: string,
  checklist: { [itemIndex: number]: boolean },
  boardVotes?: { [itemIndex: number]: { [voterName: string]: 'favorable' | 'contrary' | 'abstention' } },
  resolutionNotes?: { [itemIndex: number]: string }
) {
  const sessionKey = `${ritualId}_${dateStr}`;

  if (isDbConfigured) {
    try {
      await prisma.dispatchState.upsert({
        where: { id: sessionKey },
        update: {
          notes,
          checklist: checklist as any,
          boardVotes: (boardVotes as any) ?? undefined,
          resolutionNotes: (resolutionNotes as any) ?? undefined
        },
        create: {
          id: sessionKey,
          ritualId,
          date: dateStr,
          notes,
          checklist: checklist as any,
          boardVotes: (boardVotes as any) ?? undefined,
          resolutionNotes: (resolutionNotes as any) ?? undefined
        }
      });
    } catch (e) {
      console.warn('Prisma saveDispatchRoomState error, fallback:', e);
    }
  }

  const store = readStore();
  if (!store.dispatchNotes) {
    store.dispatchNotes = {};
  }
  store.dispatchNotes[sessionKey] = {
    notes,
    checklist,
    boardVotes: boardVotes || {},
    resolutionNotes: resolutionNotes || {}
  };
  writeStore(store);
  return store.dispatchNotes[sessionKey];
}

// =========================================================================
// 6. GOVERNANCE MINUTES (LIVRO DE ATAS)
// =========================================================================

export async function getMinutes(): Promise<GovernanceMinute[]> {
  if (isDbConfigured) {
    try {
      const dbMinutes = await prisma.governanceMinute.findMany({
        orderBy: { createdAt: 'desc' }
      });
      if (dbMinutes.length > 0) {
        return dbMinutes.map(m => ({
          id: m.id,
          ritualId: m.ritualId || '',
          roleId: m.roleId || '',
          date: m.date,
          title: m.title,
          deliberations: m.deliberations,
          agendaCheckedCount: m.agendaCheckedCount || 0,
          agendaTotalCount: m.agendaTotalCount || 0,
          signedBy: m.signedBy,
          signedAt: m.signedAt,
          participants: Array.isArray(m.participants) ? (m.participants as string[]) : []
        }));
      }
    } catch (e) {
      console.warn('Prisma getMinutes error, fallback:', e);
    }
  }

  const store = readStore();
  return store.minutes || [];
}

export async function createMinute(data: Omit<GovernanceMinute, 'id'>): Promise<GovernanceMinute> {
  if (isDbConfigured) {
    try {
      const created = await prisma.governanceMinute.create({
        data: {
          ritualId: data.ritualId,
          roleId: data.roleId,
          date: data.date,
          title: data.title,
          deliberations: data.deliberations,
          agendaCheckedCount: data.agendaCheckedCount,
          agendaTotalCount: data.agendaTotalCount,
          signedBy: data.signedBy,
          signedAt: data.signedAt,
          participants: data.participants
        }
      });
      return {
        id: created.id,
        ritualId: created.ritualId || '',
        roleId: created.roleId || '',
        date: created.date,
        title: created.title,
        deliberations: created.deliberations,
        agendaCheckedCount: created.agendaCheckedCount || 0,
        agendaTotalCount: created.agendaTotalCount || 0,
        signedBy: created.signedBy,
        signedAt: created.signedAt,
        participants: Array.isArray(created.participants) ? (created.participants as string[]) : []
      };
    } catch (e) {
      console.warn('Prisma createMinute error, fallback:', e);
    }
  }

  const store = readStore();
  if (!store.minutes) {
    store.minutes = [];
  }
  const newMinute: GovernanceMinute = {
    id: `min-${Date.now()}`,
    ...data
  };
  store.minutes.unshift(newMinute);
  writeStore(store);
  return newMinute;
}

export async function deleteMinute(id: string): Promise<boolean> {
  if (isDbConfigured) {
    try {
      await prisma.governanceMinute.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn('Prisma deleteMinute error, fallback:', e);
    }
  }

  const store = readStore();
  if (!store.minutes) return true;
  store.minutes = store.minutes.filter(m => m.id !== id);
  writeStore(store);
  return true;
}

// =========================================================================
// 6.5. GOVERNANCE ACTIONS (5W2H) & PLANOS DE AÇÃO
// =========================================================================

export async function getActions(filterRoleId?: string): Promise<GovernanceAction[]> {
  const store = readStore();
  let list = store.actions || [];
  if (filterRoleId && filterRoleId !== 'all') {
    list = list.filter(a => a.roleId === filterRoleId);
  }
  return list.sort((a, b) => {
    // Ordena por status (pendentes/em curso primeiro) e depois por prazo
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

export async function createAction(data: Omit<GovernanceAction, 'id' | 'createdAt'>): Promise<GovernanceAction> {
  const store = readStore();
  if (!store.actions) {
    store.actions = [];
  }
  const newAction: GovernanceAction = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...data,
    createdAt: new Date().toISOString()
  };
  store.actions.unshift(newAction);
  writeStore(store);
  return newAction;
}

export async function updateAction(id: string, updates: Partial<GovernanceAction>): Promise<GovernanceAction | null> {
  const store = readStore();
  if (!store.actions) return null;
  const index = store.actions.findIndex(a => a.id === id);
  if (index === -1) return null;

  store.actions[index] = {
    ...store.actions[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeStore(store);
  return store.actions[index];
}

export async function deleteAction(id: string): Promise<boolean> {
  const store = readStore();
  if (!store.actions) return true;
  store.actions = store.actions.filter(a => a.id !== id);
  writeStore(store);
  return true;
}

export async function addActionNote(
  actionId: string, 
  note: { authorName: string; content: string }
): Promise<GovernanceAction | null> {
  const store = readStore();
  if (!store.actions) return null;
  const action = store.actions.find(a => a.id === actionId);
  if (!action) return null;

  if (!action.historyNotes) {
    action.historyNotes = [];
  }

  const newNote: ActionNote = {
    id: `note-${Date.now()}`,
    authorName: note.authorName || 'Diretoria / CEO',
    content: note.content,
    createdAt: new Date().toISOString()
  };

  action.historyNotes.unshift(newNote);
  // Atualiza também a anotação principal rápida
  action.notes = note.content;
  action.updatedAt = new Date().toISOString();

  writeStore(store);
  return action;
}

// =========================================================================
// 7. SYSTEM USERS & IAM ACCESS CONTROL
// =========================================================================

export async function getUsers(): Promise<SystemUser[]> {
  if (isDbConfigured) {
    try {
      const dbUsers = await prisma.systemUser.findMany({
        orderBy: { createdAt: 'asc' }
      });
      if (dbUsers.length > 0) {
        return dbUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          password: (u as any).password || '123456',
          mustChangePassword: (u as any).mustChangePassword !== undefined ? (u as any).mustChangePassword : true,
          roleType: u.roleType as any,
          jobTitle: u.jobTitle || '',
          department: u.department || '',
          allowedRoleIds: Array.isArray(u.allowedRoleIds) ? (u.allowedRoleIds as string[]) : [],
          defaultRoleId: u.defaultRoleId || undefined,
          active: u.active,
          avatarColor: u.avatarColor || undefined,
          createdAt: u.createdAt.toISOString()
        }));
      }
    } catch (e) {
      console.warn('Prisma getUsers error, fallback:', e);
    }
  }

  const store = readStore();
  return store.users || INITIAL_USERS;
}

export async function createUser(data: Omit<SystemUser, 'id' | 'createdAt'>): Promise<SystemUser> {
  if (isDbConfigured) {
    try {
      const created = await prisma.systemUser.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password || '123456',
          mustChangePassword: data.mustChangePassword !== undefined ? data.mustChangePassword : true,
          roleType: data.roleType,
          jobTitle: data.jobTitle || '',
          department: data.department || '',
          allowedRoleIds: data.allowedRoleIds || [],
          defaultRoleId: data.defaultRoleId || null,
          active: data.active !== undefined ? data.active : true,
          avatarColor: data.avatarColor || null
        } as any
      });
      return {
        id: created.id,
        name: created.name,
        email: created.email,
        password: (created as any).password || '123456',
        mustChangePassword: (created as any).mustChangePassword !== undefined ? (created as any).mustChangePassword : true,
        roleType: created.roleType as any,
        jobTitle: created.jobTitle || '',
        department: created.department || '',
        allowedRoleIds: Array.isArray(created.allowedRoleIds) ? (created.allowedRoleIds as string[]) : [],
        defaultRoleId: created.defaultRoleId || undefined,
        active: created.active,
        avatarColor: created.avatarColor || undefined,
        createdAt: created.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma createUser error, fallback:', e);
    }
  }

  const store = readStore();
  if (!store.users) store.users = INITIAL_USERS;
  const newUser: SystemUser = {
    id: `user-${Date.now()}`,
    password: data.password || '123456',
    mustChangePassword: data.mustChangePassword !== undefined ? data.mustChangePassword : true,
    ...data,
    createdAt: new Date().toISOString()
  };
  store.users.push(newUser);
  writeStore(store);
  return newUser;
}

export async function updateUser(id: string, data: Partial<SystemUser>): Promise<SystemUser | null> {
  if (isDbConfigured) {
    try {
      const updatePayload: any = {
        name: data.name,
        email: data.email,
        roleType: data.roleType,
        jobTitle: data.jobTitle,
        department: data.department,
        allowedRoleIds: data.allowedRoleIds !== undefined ? (data.allowedRoleIds as any) : undefined,
        defaultRoleId: data.defaultRoleId,
        active: data.active,
        avatarColor: data.avatarColor
      };
      if (data.password !== undefined) updatePayload.password = data.password;
      if (data.mustChangePassword !== undefined) updatePayload.mustChangePassword = data.mustChangePassword;

      const updated = await prisma.systemUser.update({
        where: { id },
        data: updatePayload
      });
      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        password: (updated as any).password || '123456',
        mustChangePassword: (updated as any).mustChangePassword !== undefined ? (updated as any).mustChangePassword : false,
        roleType: updated.roleType as any,
        jobTitle: updated.jobTitle || '',
        department: updated.department || '',
        allowedRoleIds: Array.isArray(updated.allowedRoleIds) ? (updated.allowedRoleIds as string[]) : [],
        defaultRoleId: updated.defaultRoleId || undefined,
        active: updated.active,
        avatarColor: updated.avatarColor || undefined,
        createdAt: updated.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('Prisma updateUser error, fallback:', e);
    }
  }

  const store = readStore();
  if (!store.users) store.users = INITIAL_USERS;
  const index = store.users.findIndex(u => u.id === id);
  if (index === -1) return null;
  store.users[index] = { ...store.users[index], ...data };
  writeStore(store);
  return store.users[index];
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isDbConfigured) {
    try {
      await prisma.systemUser.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn('Prisma deleteUser error, fallback:', e);
    }
  }

  const store = readStore();
  if (!store.users) return true;
  store.users = store.users.filter(u => u.id !== id);
  writeStore(store);
  return true;
}

// Aliases for Governance Minutes
export async function getGovernanceMinutes(roleId?: string): Promise<GovernanceMinute[]> {
  const all = await getMinutes();
  if (roleId) {
    return all.filter(m => !m.roleId || m.roleId === roleId);
  }
  return all;
}

export const createGovernanceMinute = createMinute;

// =========================================================================
// 8. RESET & SEED
// =========================================================================

export async function resetToDefaultSeed(): Promise<void> {
  const initial = getInitialStore();
  writeStore(initial);

  if (isDbConfigured) {
    try {
      for (const role of initial.roles) {
        await prisma.operationalRole.upsert({
          where: { id: role.id },
          update: { code: role.code, title: role.title, department: role.department, description: role.description },
          create: { id: role.id, code: role.code, title: role.title, department: role.department, description: role.description }
        });
      }
      for (const block of initial.blocks) {
        await prisma.routineBlock.upsert({
          where: { id: block.id },
          update: { roleId: block.roleId, code: block.code, version: block.version, homologatedBy: block.homologatedBy, timeWindow: block.timeWindow, title: block.title, deliverable: block.deliverable, sopMarkdown: block.sopMarkdown, frequency: block.frequency as any, orderIndex: block.orderIndex },
          create: { id: block.id, roleId: block.roleId, code: block.code, version: block.version, homologatedBy: block.homologatedBy, timeWindow: block.timeWindow, title: block.title, deliverable: block.deliverable, sopMarkdown: block.sopMarkdown, frequency: block.frequency as any, orderIndex: block.orderIndex }
        });
      }
      for (const ritual of initial.rituals) {
        await prisma.dailyRitual.upsert({
          where: { id: ritual.id },
          update: { roleId: ritual.roleId, code: ritual.code, timeSlot: ritual.timeSlot, title: ritual.title, durationMinutes: ritual.durationMinutes, type: ritual.type, frequency: ritual.frequency, weekDays: (ritual.weekDays as any) ?? undefined, includeWeekends: ritual.includeWeekends, agendaItems: ritual.agendaItems },
          create: { id: ritual.id, roleId: ritual.roleId, code: ritual.code, timeSlot: ritual.timeSlot, title: ritual.title, durationMinutes: ritual.durationMinutes, type: ritual.type, frequency: ritual.frequency, weekDays: (ritual.weekDays as any) ?? undefined, includeWeekends: ritual.includeWeekends, agendaItems: ritual.agendaItems }
        });
      }
      for (const user of initial.users) {
        await prisma.systemUser.upsert({
          where: { id: user.id },
          update: { name: user.name, email: user.email, roleType: user.roleType, jobTitle: user.jobTitle, department: user.department, allowedRoleIds: user.allowedRoleIds, defaultRoleId: user.defaultRoleId, active: user.active, avatarColor: user.avatarColor },
          create: { id: user.id, name: user.name, email: user.email, roleType: user.roleType, jobTitle: user.jobTitle, department: user.department, allowedRoleIds: user.allowedRoleIds, defaultRoleId: user.defaultRoleId, active: user.active, avatarColor: user.avatarColor }
        });
      }
    } catch (e) {
      console.warn('Prisma resetToDefaultSeed error:', e);
    }
  }
}
