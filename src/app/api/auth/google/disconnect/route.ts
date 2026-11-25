import { NextRequest, NextResponse } from 'next/server';
import { updateUser, getUsers } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updated = await updateUser(userId, {
      googleCalendarToken: '',
      googleRefreshToken: '',
      googleConnectedEmail: '',
      googleCalendarId: '',
      googleConnectedAt: undefined
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to disconnect Google Calendar' }, { status: 500 });
  }
}
