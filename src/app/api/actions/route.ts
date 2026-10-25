import { NextRequest, NextResponse } from 'next/server';
import { 
  getActions, 
  createAction, 
  updateAction, 
  deleteAction, 
  addActionNote 
} from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId') || undefined;
    const actions = await getActions(roleId);
    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error in GET /api/actions:', error);
    return NextResponse.json({ error: 'Erro ao carregar ações' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Suporte para inserção em lote (ex: vindo da Ata ou do Agente de IA)
    if (Array.isArray(body)) {
      const createdList = [];
      for (const item of body) {
        const created = await createAction(item);
        createdList.push(created);
      }
      return NextResponse.json(createdList, { status: 201 });
    }

    if (!body.title || !body.roleId) {
      return NextResponse.json({ error: 'Título e Cadeira são obrigatórios' }, { status: 400 });
    }

    const created = await createAction(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/actions:', error);
    return NextResponse.json({ error: 'Erro ao criar ação' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, note, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da ação é obrigatório' }, { status: 400 });
    }

    // Se veio uma anotação de acompanhamento
    if (note && note.content) {
      const updated = await addActionNote(id, note);
      return NextResponse.json(updated);
    }

    const updated = await updateAction(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Ação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/actions:', error);
    return NextResponse.json({ error: 'Erro ao atualizar ação' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da ação é obrigatório' }, { status: 400 });
    }

    const success = await deleteAction(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in DELETE /api/actions:', error);
    return NextResponse.json({ error: 'Erro ao excluir ação' }, { status: 500 });
  }
}
