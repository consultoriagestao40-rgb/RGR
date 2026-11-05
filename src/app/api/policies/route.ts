import { NextResponse } from 'next/server';
import { getAllPolicies, createPolicy } from '@/lib/store';

export async function GET() {
  try {
    const policies = await getAllPolicies();
    return NextResponse.json(policies);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar políticas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.code || !body.title || !body.category) {
      return NextResponse.json(
        { error: 'Código, Título e Categoria são obrigatórios' },
        { status: 400 }
      );
    }

    const policy = await createPolicy({
      code: body.code,
      title: body.title,
      category: body.category,
      description: body.description || '',
      contentMarkdown: body.contentMarkdown || '',
      version: body.version || 'v1.0',
      status: body.status || 'draft',
      targetApproverBody: body.targetApproverBody || 'CONS-ADM',
      authorName: body.authorName || 'Proponente da Diretoria',
      authorRoleTitle: body.authorRoleTitle || 'Membro do Colegiado',
      submittedAt: body.submittedAt || undefined,
      homologatedBy: body.homologatedBy || 'Conselho de Administração',
      approvedAt: body.approvedAt || undefined,
      minuteSessionCode: body.minuteSessionCode || '',
      approvalNotes: body.approvalNotes || '',
      nextReviewDate: body.nextReviewDate || '',
      images: body.images || []
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar política' }, { status: 500 });
  }
}
