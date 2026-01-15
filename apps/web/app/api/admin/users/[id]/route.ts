import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${params.id}`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    const user = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { password, email } = body;

    const updateData: any = {};
    if (password) updateData.password = password;
    if (email) updateData.email = email;

    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const user = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: user.message || 'Failed to update user' }, { status: response.status, headers: corsHeaders });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${params.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: response.status, headers: corsHeaders });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500, headers: corsHeaders });
  }
}
