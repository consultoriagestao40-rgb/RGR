import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GOOGLE_CLIENT_ID not configured' }, { status: 500 });
  }

  // Define a URL base para callback
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rgr-liart-eight.vercel.app';
  // Se for ambiente local, usa a origem da requisição
  const host = request.headers.get('host') || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = host.includes('localhost') 
    ? `http://${host}/api/auth/google/callback`
    : `${baseUrl}/api/auth/google/callback`;

  // Scopes necessários para gerenciar e sincronizar a agenda do usuário
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  // State preserva o userId para associar na volta do OAuth
  const state = JSON.stringify({ userId: userId || '' });

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent'); // garante que retorne refresh_token
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
