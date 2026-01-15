import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    const data = await response.json();
    
    const users = data.users?.map((user: any) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
    })) || [];

    return NextResponse.json(users, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400, headers: corsHeaders });
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to create user' }, { status: response.status, headers: corsHeaders });
    }

    return NextResponse.json({
      id: data.id,
      email: data.email,
      created_at: data.created_at,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500, headers: corsHeaders });
  }
}
