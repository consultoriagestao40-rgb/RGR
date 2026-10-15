import { NextResponse } from 'next/server';
import { getGovernanceMinutes, createGovernanceMinute } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId') || undefined;
    const minutes = await getGovernanceMinutes(roleId);
    return NextResponse.json(minutes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch minutes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.ritualId || !body.roleId || !body.title) {
      return NextResponse.json({ error: 'ritualId, roleId, and title are required' }, { status: 400 });
    }

    const minute = await createGovernanceMinute({
      ritualId: body.ritualId,
      roleId: body.roleId,
      date: body.date || new Date().toISOString().split('T')[0],
      title: body.title,
      deliberations: body.deliberations || '',
      agendaCheckedCount: body.agendaCheckedCount || 0,
      agendaTotalCount: body.agendaTotalCount || 0,
      signedBy: body.signedBy || 'Diretoria Executiva',
      signedAt: body.signedAt || new Date().toISOString(),
      participants: Array.isArray(body.participants) ? body.participants : ['Diretoria Executiva', 'Liderança de Cadeira']
    });

    return NextResponse.json(minute, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create minute' }, { status: 500 });
  }
}
