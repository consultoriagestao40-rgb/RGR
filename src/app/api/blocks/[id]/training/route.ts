import { NextResponse } from 'next/server';
import { updateRoutineBlock, getBlocksForRole } from '@/lib/store';
import { PopTrainingRecord } from '@/lib/types';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { userName, userRoleTitle, userId, notes, recyclingPeriodDays } = body;

    if (!userName) {
      return NextResponse.json({ error: 'Nome do colaborador é obrigatório' }, { status: 400 });
    }

    const daysValid = recyclingPeriodDays || 180; // Padrão Falconi: 6 meses (180 dias)
    const completedDate = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + daysValid);

    const newRecord: PopTrainingRecord = {
      id: `train-${Date.now()}`,
      userId: userId || undefined,
      userName: userName.trim(),
      userRoleTitle: userRoleTitle || 'Operador',
      completedAt: completedDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      type: 'initial',
      status: 'valid',
      notes: notes || 'Capacitação formal realizada no Procedimento Operacional Padrão.'
    };

    // Atualiza bloco
    const updated = await updateRoutineBlock(params.id, {
      trainingRecords: [newRecord]
    });

    return NextResponse.json({ success: true, record: newRecord, block: updated });
  } catch (error) {
    console.error('Erro ao registrar treinamento:', error);
    return NextResponse.json({ error: 'Erro interno ao registrar treinamento' }, { status: 500 });
  }
}
