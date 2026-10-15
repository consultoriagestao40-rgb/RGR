import { PrismaClient } from '@prisma/client';
import { INITIAL_ROLES, INITIAL_BLOCKS, INITIAL_RITUALS } from '../src/lib/seed-data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma Neon PostgreSQL Seed for RGR...');

  for (const role of INITIAL_ROLES) {
    await prisma.operationalRole.upsert({
      where: { id: role.id },
      update: {
        title: role.title,
        department: role.department,
        description: role.description,
      },
      create: {
        id: role.id,
        title: role.title,
        department: role.department,
        description: role.description,
      },
    });
    console.log(`✅ Upserted Role: ${role.title}`);
  }

  for (const block of INITIAL_BLOCKS) {
    await prisma.routineBlock.upsert({
      where: { id: block.id },
      update: {
        roleId: block.roleId,
        timeWindow: block.timeWindow,
        title: block.title,
        deliverable: block.deliverable,
        sopMarkdown: block.sopMarkdown,
        frequency: block.frequency,
        orderIndex: block.orderIndex,
      },
      create: {
        id: block.id,
        roleId: block.roleId,
        timeWindow: block.timeWindow,
        title: block.title,
        deliverable: block.deliverable,
        sopMarkdown: block.sopMarkdown,
        frequency: block.frequency,
        orderIndex: block.orderIndex,
      },
    });
    console.log(`✅ Upserted Routine Block: ${block.timeWindow} - ${block.title}`);
  }

  for (const ritual of INITIAL_RITUALS) {
    await prisma.dailyRitual.upsert({
      where: { id: ritual.id },
      update: {
        roleId: ritual.roleId,
        timeSlot: ritual.timeSlot,
        title: ritual.title,
        durationMinutes: ritual.durationMinutes,
        agendaItems: ritual.agendaItems,
      },
      create: {
        id: ritual.id,
        roleId: ritual.roleId,
        timeSlot: ritual.timeSlot,
        title: ritual.title,
        durationMinutes: ritual.durationMinutes,
        agendaItems: ritual.agendaItems,
      },
    });
    console.log(`✅ Upserted Daily Ritual: ${ritual.timeSlot} - ${ritual.title}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
