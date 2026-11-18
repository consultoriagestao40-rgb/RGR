import { NextResponse } from 'next/server';
import { getBlocksForRole, getAllBlocks, createRoutineBlock } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId');
    const date = searchParams.get('date') || undefined;

    if (roleId) {
      const blocks = await getBlocksForRole(roleId, date);
      return NextResponse.json(blocks);
    } else {
      const all = await getAllBlocks();
      return NextResponse.json(all);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.roleId || !body.timeWindow || !body.title || !body.deliverable) {
      return NextResponse.json(
        { error: 'roleId, timeWindow, title, and deliverable are required' },
        { status: 400 }
      );
    }
    const block = await createRoutineBlock({
      roleId: body.roleId,
      code: body.code || undefined,
      version: body.version || 'v1.0',
      homologatedBy: body.homologatedBy || undefined,
      timeWindow: body.timeWindow,
      title: body.title,
      deliverable: body.deliverable,
      sopMarkdown: body.sopMarkdown || '',
      frequency: body.frequency || 'daily',
      dayOfWeek: body.dayOfWeek ?? null,
      dayOfMonth: body.dayOfMonth ?? null,
      orderIndex: body.orderIndex || 0,
      videoUrl: body.videoUrl || undefined,
      videoTitle: body.videoTitle || undefined,
      images: body.images || undefined
    });
    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 });
  }
}
