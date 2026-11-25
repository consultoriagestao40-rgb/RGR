import { NextRequest, NextResponse } from 'next/server';
import { getUsers, updateUser, getAllBlocks, getAllRituals, getRoles } from '@/lib/store';
import { isBlockScheduledForDate, isRitualScheduledForDate } from '@/lib/frequency';
import { OperationalRole, RoutineBlock, DailyRitual, SystemUser } from '@/lib/types';

// Função auxiliar para renovar o access_token se estiver expirado
async function getValidAccessToken(user: SystemUser): Promise<string | null> {
  let token = user.googleCalendarToken;
  const refreshToken = user.googleRefreshToken;

  if (!token && !refreshToken) return null;

  // Testa se o token atual é válido fazendo uma chamada leve
  if (token) {
    const testRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (testRes.ok) return token;
  }

  // Se falhou ou não tem access_token, renova usando o refresh_token
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, date } = body;

    const targetDate = date || new Date().toISOString().split('T')[0];

    const users = await getUsers();
    const targetUser = users.find(u => u.id === userId);

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (!targetUser.googleConnectedEmail) {
      return NextResponse.json({ error: 'Conta do Google Agenda não está conectada para este usuário' }, { status: 400 });
    }

    const accessToken = await getValidAccessToken(targetUser);
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Sessão do Google Calendar expirada. Por favor, reconecte sua conta do Google Agenda.' 
      }, { status: 401 });
    }

    // 1. Busca cadeiras atribuídas ao usuário
    const allRoles: OperationalRole[] = await getRoles();
    const allowedRoleIds: string[] = targetUser.allowedRoleIds || [];
    const isGlobal = targetUser.roleType === 'admin' || allowedRoleIds.includes('*');
    const userRoles: OperationalRole[] = isGlobal 
      ? allRoles 
      : allRoles.filter((r: OperationalRole) => allowedRoleIds.includes(r.id));

    const userRoleIds: string[] = userRoles.map((r: OperationalRole) => r.id);

    // 2. Busca blocos e ritos programados para a data especificada
    const [allBlocks, allRituals]: [RoutineBlock[], DailyRitual[]] = await Promise.all([
      getAllBlocks(),
      getAllRituals()
    ]);

    const scheduledBlocks = allBlocks.filter((b: RoutineBlock) => 
      userRoleIds.includes(b.roleId) && isBlockScheduledForDate(b, targetDate)
    );

    const scheduledRituals = allRituals.filter((r: DailyRitual) => 
      userRoleIds.includes(r.roleId) && isRitualScheduledForDate(r, targetDate)
    );

    // 3. Busca eventos existentes no Google Calendar para o dia alvo (para evitar duplicatas)
    const timeMin = `${targetDate}T00:00:00Z`;
    const timeMax = `${targetDate}T23:59:59Z`;
    
    const existingEventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const existingEventsData = await existingEventsRes.json();
    const existingEvents = existingEventsData.items || [];

    let createdCount = 0;
    let updatedCount = 0;

    // 4. Cria ou atualiza RITOS DE GESTÃO / DESPACHO no Google Calendar
    for (const ritual of scheduledRituals) {
      const role = allRoles.find((r: OperationalRole) => r.id === ritual.roleId);
      const rolePrefix = role ? `[${role.code || role.title}] ` : '';
      const summary = `🏛️ ${rolePrefix}${ritual.title}`;
      
      const timeSlot = ritual.timeSlot || '09:00';
      const startDateTime = new Date(`${targetDate}T${timeSlot}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (ritual.durationMinutes || 30) * 60000);

      const description = [
        `Rito de Gestão / Governança RGR`,
        `Cadeira: ${role?.title || 'Operacional'} (${role?.code || ''})`,
        `Duração: ${ritual.durationMinutes || 30} min`,
        `\nPauta Prevista:`,
        ...(ritual.agendaItems || []).map((item: string, i: number) => `${i + 1}. ${item}`),
        `\nLink do RGR: https://rgr-liart-eight.vercel.app`
      ].join('\n');

      const existing = existingEvents.find((e: any) => 
        (e.description && e.description.includes(`ritual_id:${ritual.id}`)) || e.summary === summary
      );

      // Se a cadeira tem e-mail do operador configurado, adiciona como participante/convidado
      const attendees: { email: string }[] = [];
      if (role?.googleCalendarEmail && role.googleCalendarEmail.includes('@')) {
        attendees.push({ email: role.googleCalendarEmail.trim() });
      }

      const eventPayload: any = {
        summary,
        description: `${description}\n\n[rgr_meta: ritual_id:${ritual.id} | date:${targetDate}]`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        colorId: '9' // Bold Blue para governança
      };

      if (attendees.length > 0) {
        eventPayload.attendees = attendees;
      }

      if (existing) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existing.id}?sendUpdates=all`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        });
        updatedCount++;
      } else {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        });
        createdCount++;
      }
    }

    // 5. Cria ou atualiza BLOCOS DE ROTINA / POPS no Google Calendar
    for (const block of scheduledBlocks) {
      const role = allRoles.find((r: OperationalRole) => r.id === block.roleId);
      const rolePrefix = role ? `[${role.code || role.title}] ` : '';
      const summary = `📋 ${rolePrefix}${block.title}`;

      let startTime = '08:00';
      let endTime = '09:00';
      if (block.timeWindow) {
        const parts = block.timeWindow.split('-').map((s: string) => s.trim());
        if (parts[0]) startTime = parts[0];
        if (parts[1]) endTime = parts[1];
      }

      const startDateTime = new Date(`${targetDate}T${startTime}:00`);
      let endDateTime = new Date(`${targetDate}T${endTime}:00`);
      if (endDateTime <= startDateTime) {
        endDateTime = new Date(startDateTime.getTime() + 60 * 60000);
      }

      const description = [
        `Bloco Operacional de Rotina Falconi (RGR)`,
        `Cadeira: ${role?.title || 'Operacional'} (${role?.code || ''})`,
        `Janela de Execução: ${block.timeWindow}`,
        `Entregável: ${block.deliverable}`,
        block.code ? `Código do POP: ${block.code} (${block.version || 'v1.0'})` : '',
        `\nLink do RGR: https://rgr-liart-eight.vercel.app`
      ].filter(Boolean).join('\n');

      const existing = existingEvents.find((e: any) => 
        (e.description && e.description.includes(`block_id:${block.id}`)) || e.summary === summary
      );

      // Se a cadeira tem e-mail do operador configurado, adiciona como participante/convidado
      const attendees: { email: string }[] = [];
      if (role?.googleCalendarEmail && role.googleCalendarEmail.includes('@')) {
        attendees.push({ email: role.googleCalendarEmail.trim() });
      }

      const eventPayload: any = {
        summary,
        description: `${description}\n\n[rgr_meta: block_id:${block.id} | date:${targetDate}]`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        colorId: '2' // Verde sálvia para rotina diária
      };

      if (attendees.length > 0) {
        eventPayload.attendees = attendees;
      }

      if (existing) {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${existing.id}?sendUpdates=all`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        });
        updatedCount++;
      } else {
        await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      targetDate,
      email: targetUser.googleConnectedEmail,
      stats: {
        scheduledRituals: scheduledRituals.length,
        scheduledBlocks: scheduledBlocks.length,
        created: createdCount,
        updated: updatedCount,
        totalEventsSynced: createdCount + updatedCount
      }
    });

  } catch (err: any) {
    console.error('Calendar sync error:', err);
    return NextResponse.json({ error: err.message || 'Erro durante sincronização da agenda' }, { status: 500 });
  }
}
