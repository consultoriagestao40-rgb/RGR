import { NextResponse } from 'next/server';
import { updateDailyRitual, deleteDailyRitual } from '@/lib/store';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateDailyRitual(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Ritual not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ritual' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteDailyRitual(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ritual' }, { status: 500 });
  }
}
