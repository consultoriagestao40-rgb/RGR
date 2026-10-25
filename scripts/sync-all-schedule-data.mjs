import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function syncAll() {
  console.log('🔄 Sincronizando todas as atividades, blocos e ritos no banco de dados...');

  const storePath = path.join(__dirname, '../data/store.json');
  if (!fs.existsSync(storePath)) {
    console.error('❌ data/store.json não encontrado');
    process.exit(1);
  }

  const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));

  // 1. Roles
  for (const role of store.roles || []) {
    await prisma.operationalRole.upsert({
      where: { id: role.id },
      update: {
        code: role.code,
        title: role.title,
        department: role.department,
        description: role.description
      },
      create: {
        id: role.id,
        code: role.code,
        title: role.title,
        department: role.department,
        description: role.description
      }
    });
  }
  console.log(`✅ ${(store.roles || []).length} Cadeiras sincronizadas.`);

  // 2. Routine Blocks / POPs
  for (const block of store.blocks || []) {
    await prisma.routineBlock.upsert({
      where: { id: block.id },
      update: {
        roleId: block.roleId,
        code: block.code,
        version: block.version || 'v3.0',
        homologatedBy: block.homologatedBy,
        timeWindow: block.timeWindow,
        title: block.title,
        deliverable: block.deliverable,
        sopMarkdown: block.sopMarkdown,
        frequency: block.frequency || 'daily',
        dayOfWeek: block.dayOfWeek !== undefined ? block.dayOfWeek : null,
        dayOfMonth: block.dayOfMonth !== undefined ? block.dayOfMonth : null,
        orderIndex: block.orderIndex || 0
      },
      create: {
        id: block.id,
        roleId: block.roleId,
        code: block.code,
        version: block.version || 'v3.0',
        homologatedBy: block.homologatedBy,
        timeWindow: block.timeWindow,
        title: block.title,
        deliverable: block.deliverable,
        sopMarkdown: block.sopMarkdown,
        frequency: block.frequency || 'daily',
        dayOfWeek: block.dayOfWeek !== undefined ? block.dayOfWeek : null,
        dayOfMonth: block.dayOfMonth !== undefined ? block.dayOfMonth : null,
        orderIndex: block.orderIndex || 0
      }
    });
  }
  console.log(`✅ ${(store.blocks || []).length} POPs e Procedimentos sincronizados.`);

  // 3. Daily Rituals
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
        monthDay: ritual.monthDay !== undefined ? ritual.monthDay : null,
        monthlyType: ritual.monthlyType || null,
        agendaItems: ritual.agendaItems || []
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
        monthDay: ritual.monthDay !== undefined ? ritual.monthDay : null,
        monthlyType: ritual.monthlyType || null,
        agendaItems: ritual.agendaItems || []
      }
    });
  }
  console.log(`✅ ${(store.rituals || []).length} Ritos sincronizados com frequências e dias definidos.`);

  // Validation
  const monthlyBlocks = await prisma.routineBlock.findMany({
    where: { frequency: 'monthly' }
  });
  console.log(`🔎 POPs Mensais no Banco com dayOfMonth:`, monthlyBlocks.map(b => `${b.code}: dia ${b.dayOfMonth}`).join(', '));

  const monthlyRituals = await prisma.dailyRitual.findMany({
    where: { frequency: 'monthly' }
  });
  console.log(`🔎 Ritos Mensais no Banco com monthDay:`, monthlyRituals.map(r => `${r.code}: dia ${r.monthDay}`).join(', '));

  await prisma.$disconnect();
  console.log('🎉 Sincronização concluída com sucesso!');
}

syncAll().catch(e => {
  console.error('❌ Erro na sincronização:', e);
  process.exit(1);
});
