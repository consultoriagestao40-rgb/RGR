import { NextResponse } from 'next/server';
import { getRitualsForRole, getAllRituals, createDailyRitual } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId');

    if (roleId) {
      const rituals = await getRitualsForRole(roleId);
      return NextResponse.json(rituals);
    } else {
      const all = await getAllRituals();
      return NextResponse.json(all);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rituals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.roleId || !body.timeSlot || !body.title) {
      return NextResponse.json(
        { error: 'roleId, timeSlot, and title are required' },
        { status: 400 }
      );
    }

    const ritual = await createDailyRitual({
      roleId: body.roleId,
      code: body.code,
      timeSlot: body.timeSlot,
      title: body.title,
      type: body.type || 'operational_cadence',
      frequency: body.frequency || 'daily',
      weekDays: Array.isArray(body.weekDays) ? body.weekDays : (body.frequency === 'daily' && !body.includeWeekends ? [1, 2, 3, 4, 5] : undefined),
      includeWeekends: Boolean(body.includeWeekends),
      monthDay: body.monthDay ? Number(body.monthDay) : undefined,
      monthlyType: body.monthlyType,
      durationMinutes: body.durationMinutes || 15,
      agendaItems: Array.isArray(body.agendaItems) ? body.agendaItems : []
    });

    return NextResponse.json(ritual, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ritual' }, { status: 500 });
  }
}
