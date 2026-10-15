import { NextResponse } from 'next/server';
import { resetToDefaultSeed } from '@/lib/store';

export async function POST() {
  try {
    await resetToDefaultSeed();
    return NextResponse.json({ success: true, message: 'Dados restaurados com sucesso!' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao restaurar dados' }, { status: 500 });
  }
}
