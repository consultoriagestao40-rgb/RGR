import { NextResponse } from 'next/server';
import { getPolicyById, updatePolicy, deletePolicy } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const policy = await getPolicyById(params.id);
    if (!policy) {
      return NextResponse.json({ error: 'Política não encontrada' }, { status: 404 });
    }
    return NextResponse.json(policy);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar política' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await updatePolicy(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Política não encontrada' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar política' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const success = await deletePolicy(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Política não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir política' }, { status: 500 });
  }
}
