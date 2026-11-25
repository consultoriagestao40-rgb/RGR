import { NextRequest, NextResponse } from 'next/server';
import { updateUser, getUsers } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateStr = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rgr-liart-eight.vercel.app';
  const host = request.headers.get('host') || '';
  const redirectOrigin = host.includes('localhost') ? `http://${host}` : baseUrl;

  if (error || !code) {
    return NextResponse.redirect(`${redirectOrigin}/?calendar_auth=error&reason=${encodeURIComponent(error || 'missing_code')}`);
  }

  let userId = '';
  try {
    if (stateStr) {
      const parsed = JSON.parse(stateStr);
      userId = parsed.userId || '';
    }
  } catch (e) {
    console.error('Failed to parse OAuth state:', e);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = host.includes('localhost') 
    ? `http://${host}/api/auth/google/callback`
    : `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Troca o authorization code pelos tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      return NextResponse.redirect(`${redirectOrigin}/?calendar_auth=error&reason=token_exchange_failed`);
    }

    const { access_token, refresh_token } = tokenData;

    // 2. Busca o perfil do usuário no Google para saber qual e-mail foi autenticado
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const profileData = await profileResponse.json();
    const googleEmail = profileData.email || '';

    // 3. Localiza o usuário correspondente no RGR
    // Se userId foi passado, usa ele. Se não, tenta bater pelo e-mail do usuário
    const allUsers = await getUsers();
    let targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser && googleEmail) {
      targetUser = allUsers.find(u => u.email.toLowerCase() === googleEmail.toLowerCase());
    }
    if (!targetUser && allUsers.length > 0) {
      // Fallback para o primeiro usuário ativo caso não encontre
      targetUser = allUsers[0];
    }

    if (targetUser) {
      await updateUser(targetUser.id, {
        googleCalendarToken: access_token,
        googleRefreshToken: refresh_token || targetUser.googleRefreshToken,
        googleConnectedEmail: googleEmail,
        googleCalendarId: 'primary',
        googleConnectedAt: new Date().toISOString()
      });
    }

    return NextResponse.redirect(`${redirectOrigin}/?calendar_auth=success&email=${encodeURIComponent(googleEmail)}`);
  } catch (err: any) {
    console.error('OAuth callback execution error:', err);
    return NextResponse.redirect(`${redirectOrigin}/?calendar_auth=error&reason=${encodeURIComponent(err?.message || 'unknown')}`);
  }
}
