// app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-auth';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isVerified = searchParams.get('is_verified');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Build query
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

    // Add filters if provided
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
    const authUser = await requireAuth('admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, role, is_verified, is_active } = body;

    // Validate required fields
    if (!user_id) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Update the user
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
    const authUser = await requireAuth('admin');
    if (!authUser) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const { user_id } = body;

    // Validate required field
    if (!user_id) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Delete the user (in reality, you'd want to de-activate rather than hard delete)
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