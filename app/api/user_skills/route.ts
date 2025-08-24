import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: userSkills, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skills (id, name, description, max_level, points_per_level, category_id)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user skills:', error);
      return NextResponse.json({ error: 'Failed to fetch user skills' }, { status: 500 });
    }

    return NextResponse.json(userSkills, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/user_skills:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}