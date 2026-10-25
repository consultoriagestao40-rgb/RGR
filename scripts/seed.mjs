import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Helper to load seed-data directly
async function getSeedData() {
  const storePath = path.join(__dirname, '../data/store.json');
  if (fs.existsSync(storePath)) {
    try {
      const content = fs.readFileSync(storePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.warn('Could not read store.json, using fallback data');
    }
  }
  return null;
}

async function main() {
  console.log('🌱 Conectando e populando banco de dados Neon PostgreSQL...');

  const store = await getSeedData();
  if (!store) {
    console.error('❌ Não foi possível carregar os dados de seed.');
    return;
  }

  // 1. Roles
  for (const role of store.roles || []) {
    await prisma.operationalRole.upsert({
      where: { id: role.id },
      update: {
        code: role.code,
        title: role.title,
        department: role.department,
        description: role.description,
      },
      create: {
        id: role.id,
        code: role.code,
        title: role.title,
        department: role.department,
        description: role.description,
      },
    });
    console.log(`✅ Cadeira sincronizada: [${role.code || role.id}] ${role.title}`);
  }

  // 2. Blocks
  for (const block of store.blocks || []) {
    await prisma.routineBlock.upsert({
      where: { id: block.id },
      update: {
        roleId: block.roleId,
        code: block.code,
        version: block.version || 'v1.0',
        homologatedBy: block.homologatedBy,
        timeWindow: block.timeWindow,
        title: block.title,
        deliverable: block.deliverable,
        sopMarkdown: block.sopMarkdown,
        frequency: block.frequency || 'daily',
        dayOfWeek: block.dayOfWeek !== undefined ? block.dayOfWeek : null,
        dayOfMonth: block.dayOfMonth || null,
        orderIndex: block.orderIndex || 0,
      },
      create: {
        id: block.id,
        roleId: block.roleId,
        code: block.code,
        version: block.version || 'v1.0',
        homologatedBy: block.homologatedBy,
        timeWindow: block.timeWindow,
        title: block.title,
        deliverable: block.deliverable,
        sopMarkdown: block.sopMarkdown,
        frequency: block.frequency || 'daily',
        dayOfWeek: block.dayOfWeek !== undefined ? block.dayOfWeek : null,
        dayOfMonth: block.dayOfMonth || null,
        orderIndex: block.orderIndex || 0,
      },
    });
  }
  console.log(`✅ ${(store.blocks || []).length} POPs e Procedimentos sincronizados.`);

  // 3. Rituals
  for (const ritual of store.rituals || []) {
    await prisma.dailyRitual.upsert({
      where: { id: ritual.id },
      update: {
        roleId: ritual.roleId,
        code: ritual.code,
        timeSlot: ritual.timeSlot,
        title: ritual.title,
        durationMinutes: ritual.durationMinutes,
        type: ritual.type || 'operational_cadence',
        frequency: ritual.frequency || 'daily',
        weekDays: ritual.weekDays || null,
        includeWeekends: ritual.includeWeekends || false,
        monthDay: ritual.monthDay || null,
        monthlyType: ritual.monthlyType || null,
        agendaItems: ritual.agendaItems,
      },
      create: {
        id: ritual.id,
        roleId: ritual.roleId,
        code: ritual.code,
        timeSlot: ritual.timeSlot,
        title: ritual.title,
        durationMinutes: ritual.durationMinutes,
        type: ritual.type || 'operational_cadence',
        frequency: ritual.frequency || 'daily',
        weekDays: ritual.weekDays || null,
        includeWeekends: ritual.includeWeekends || false,
        monthDay: ritual.monthDay || null,
        monthlyType: ritual.monthlyType || null,
        agendaItems: ritual.agendaItems,
      },
    });
  }
  console.log(`✅ ${(store.rituals || []).length} Ritos Diários e Pautas de Conselho sincronizados.`);

  // 4. Users
  for (const user of store.users || []) {
    await prisma.systemUser.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        roleType: user.roleType || 'operator',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        allowedRoleIds: user.allowedRoleIds || [],
        defaultRoleId: user.defaultRoleId || null,
        active: user.active !== undefined ? user.active : true,
        avatarColor: user.avatarColor || null,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleType: user.roleType || 'operator',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        allowedRoleIds: user.allowedRoleIds || [],
        defaultRoleId: user.defaultRoleId || null,
        active: user.active !== undefined ? user.active : true,
        avatarColor: user.avatarColor || null,
      },
    });
  }
  console.log(`✅ ${(store.users || []).length} Usuários e Perfis de Acesso IAM sincronizados.`);

  // 5. Minutes
  for (const min of store.minutes || []) {
    await prisma.governanceMinute.upsert({
      where: { id: min.id },
      update: {
        ritualId: min.ritualId || null,
        roleId: min.roleId || null,
        date: min.date,
        title: min.title || 'Ata de Sessão Ordinária',
        deliberations: min.deliberations || '',
        agendaCheckedCount: min.agendaCheckedCount || 0,
        agendaTotalCount: min.agendaTotalCount || 0,
        signedBy: min.signedBy || 'Diretoria Executiva',
        signedAt: min.signedAt || new Date().toISOString(),
        participants: min.participants || [],
      },
      create: {
        id: min.id,
        ritualId: min.ritualId || null,
        roleId: min.roleId || null,
        date: min.date,
        title: min.title || 'Ata de Sessão Ordinária',
        deliberations: min.deliberations || '',
        agendaCheckedCount: min.agendaCheckedCount || 0,
        agendaTotalCount: min.agendaTotalCount || 0,
        signedBy: min.signedBy || 'Diretoria Executiva',
        signedAt: min.signedAt || new Date().toISOString(),
        participants: min.participants || [],
      },
    });
  }
  console.log(`✅ ${(store.minutes || []).length} Atas de Governança sincronizadas.`);

  console.log('🎉 Banco de dados Neon PostgreSQL sincronizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed no Neon:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
