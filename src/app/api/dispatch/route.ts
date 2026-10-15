import { NextResponse } from 'next/server';
import { getDispatchRoomState, saveDispatchRoomState } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ritualId = searchParams.get('ritualId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!ritualId) {
      return NextResponse.json({ error: 'ritualId is required' }, { status: 400 });
    }

    const state = await getDispatchRoomState(ritualId, date);
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dispatch state' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ritualId, date, notes, checklist, boardVotes, resolutionNotes } = body;

    if (!ritualId || !date) {
      return NextResponse.json({ error: 'ritualId and date are required' }, { status: 400 });
    }

    const state = await saveDispatchRoomState(
      ritualId, 
      date, 
      notes || '', 
      checklist || {}, 
      boardVotes || {}, 
      resolutionNotes || {}
    );
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save dispatch state' }, { status: 500 });
  }
}
