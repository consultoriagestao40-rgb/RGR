import { NextResponse } from 'next/server';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/store';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, roleType, jobTitle, department, allowedRoleIds, defaultRoleId, active } = body;

    if (!name || !email || !roleType) {
      return NextResponse.json(
        { error: 'name, email, and roleType are required' },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      name,
      email,
      roleType,
      jobTitle: jobTitle || 'Colaborador',
      department: department || 'Geral',
      allowedRoleIds: Array.isArray(allowedRoleIds) ? allowedRoleIds : [],
      defaultRoleId: defaultRoleId || (allowedRoleIds?.[0] || ''),
      active: active !== undefined ? active : true
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updated = await updateUser(id, data);
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const success = await deleteUser(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
