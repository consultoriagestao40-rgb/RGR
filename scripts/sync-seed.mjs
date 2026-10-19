import fs from 'fs';
import path from 'path';

const storePath = path.resolve('data/store.json');
const seedPath = path.resolve('src/lib/seed-data.ts');

const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));

const content = `import { OperationalRole, RoutineBlock, DailyRitual, GovernanceMinute, SystemUser } from './types';

export const INITIAL_ROLES: OperationalRole[] = ${JSON.stringify(store.roles, null, 2)};

export const INITIAL_BLOCKS: RoutineBlock[] = ${JSON.stringify(store.blocks, null, 2)};

export const INITIAL_RITUALS: DailyRitual[] = ${JSON.stringify(store.rituals, null, 2)};

export const INITIAL_MINUTES: GovernanceMinute[] = ${JSON.stringify(store.minutes || [], null, 2)};

export const INITIAL_USERS: SystemUser[] = ${JSON.stringify(store.users || [], null, 2)};
`;

fs.writeFileSync(seedPath, content, 'utf-8');
console.log('Successfully synced seed-data.ts with store.json');
