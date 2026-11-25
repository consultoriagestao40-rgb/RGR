import { NextRequest, NextResponse } from 'next/server';
import { getUsers, updateUser } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Função para obter token válido
async function getValidAccessToken(user: any): Promise<string | null> {
  let token = user.googleCalendarToken;
  const refreshToken = user.googleRefreshToken;

  if (!token && !refreshToken) return null;

  if (token) {
    const testRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (testRes.ok) return token;
  }

  if (refreshToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId || '',
        client_secret: clientSecret || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    const refreshData = await refreshRes.json();
    if (refreshRes.ok && refreshData.access_token) {
      await updateUser(user.id, {
        googleCalendarToken: refreshData.access_token
      });
      return refreshData.access_token;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const users = await getUsers();
    // Se userId for passado, procura por ele. Se não ou se o usuário não tiver conexão, procura o usuário conectado (ex: admin/CEO)
    let targetUser = userId ? users.find(u => u.id === userId) : null;
    if (!targetUser || !targetUser.googleConnectedEmail) {
      targetUser = users.find(u => u.googleConnectedEmail && (u.googleCalendarToken || u.googleRefreshToken)) || null;
    }

    if (!targetUser || !targetUser.googleConnectedEmail) {
      return NextResponse.json({ events: [] });
    }

    const accessToken = await getValidAccessToken(targetUser);
    if (!accessToken) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const timeMin = `${date}T00:00:00Z`;
    const timeMax = `${date}T23:59:59Z`;

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!res.ok) {
      return NextResponse.json({ events: [] });
    }

    const data = await res.json();
    const items = data.items || [];

    // Formata os eventos para a interface do RGR
    const googleEvents = items.map((it: any) => {
      // Extrai horários
      let startTime = '09:00';
      let endTime = '10:00';

      if (it.start?.dateTime) {
        // Ex: "2026-11-25T17:30:00-03:00"
        const d = new Date(it.start.dateTime);
        startTime = it.start.dateTime.split('T')[1]?.slice(0, 5) || '09:00';
      }
      if (it.end?.dateTime) {
        endTime = it.end.dateTime.split('T')[1]?.slice(0, 5) || '10:00';
      }

      const isRgrEvent = (it.description && it.description.includes('[rgr_meta:')) || (it.summary && (it.summary.startsWith('📋') || it.summary.startsWith('🏛️')));

      return {
        id: it.id,
        summary: it.summary || 'Compromisso sem título',
        description: it.description || '',
        location: it.location || '',
        htmlLink: it.htmlLink || '',
        startTime,
        endTime,
        isRgrEvent,
        attendeesCount: it.attendees ? it.attendees.length : 0
      };
    });

    return NextResponse.json({
      success: true,
      date,
      events: googleEvents
    });

  } catch (err: any) {
    console.error('Error fetching google events:', err);
    return NextResponse.json({ events: [], error: err.message }, { status: 500 });
  }
}
