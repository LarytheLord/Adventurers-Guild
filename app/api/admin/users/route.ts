// app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required', success: false }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isVerified = searchParams.get('is_verified');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        rank,
        xp,
        skill_points,
        level,
        is_active,
        is_verified,
        created_at,
        last_login_at,
        bio,
        location,
        website,
        discord,
        github,
        linkedin,
        adventurer_profiles (
          specialization,
          primary_skills,
          availability_status,
          quest_completion_rate,
          total_quests_completed
        ),
        company_profiles (
          company_name,
          company_website,
          is_verified
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }
    if (isVerified !== null) {
      query = query.eq('is_verified', isVerified === 'true');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ users: data, success: true });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users', success: false }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required', success: false }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, role, is_verified, is_active } = body;

    if (!user_id) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ user: data, success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user', success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required', success: false }, { status: 403 });
    }

    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', user_id);

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ message: 'User deactivated successfully', success: true });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return Response.json({ error: 'Failed to deactivate user', success: false }, { status: 500 });
  }
}