import { NextResponse } from 'next/server';
import { getRoles, createRole } from '@/lib/store';

export async function GET() {
  try {
    const roles = await getRoles();
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.department) {
      return NextResponse.json({ error: 'Title and department are required' }, { status: 400 });
    }
    const role = await createRole({
      title: body.title,
      department: body.department,
      description: body.description || ''
    });
    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
