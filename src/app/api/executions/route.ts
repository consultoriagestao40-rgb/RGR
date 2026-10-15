import { NextResponse } from 'next/server';
import { setBlockExecution } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      routineBlockId, 
      date, 
      status, 
      observation, 
      verifiedBy,
      isDelayed,
      delayMinutes,
      delayReason,
      delayCategory
    } = body;

    if (!routineBlockId || !date || !status) {
      return NextResponse.json(
        { error: 'routineBlockId, date, and status are required' },
        { status: 400 }
      );
    }

    const execution = await setBlockExecution(
      routineBlockId, 
      date, 
      status, 
      observation,
      verifiedBy,
      {
        isDelayed: !!isDelayed,
        delayMinutes: Number(delayMinutes) || 0,
        delayReason: delayReason || null,
        delayCategory: delayCategory || null
      }
    );
    return NextResponse.json(execution);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update execution' }, { status: 500 });
  }
}
