import { NextResponse } from 'next/server';
import { updateRoutineBlock, deleteRoutineBlock } from '@/lib/store';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateRoutineBlock(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteRoutineBlock(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 });
  }
}
