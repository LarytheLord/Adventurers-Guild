import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabase
      .from('quests')
      .select(`
        id,
        title,
        description,
        detailed_description,
        quest_type,
        status,
        difficulty,
        xp_reward,
        skill_points_reward,
        monetary_reward,
        required_skills,
        required_rank,
        max_participants,
        quest_category,
        company_id,
        created_at,
        deadline,
        users!quests_company_id_fkey (
          name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    // Transform array access
    const userData = Array.isArray(data.users) ? data.users[0] : data.users;
    const quest = { ...data, users: userData || { name: '', email: '' } };

    return NextResponse.json({ quest, quests: [quest], success: true });
  } catch (error) {
    console.error('Error fetching quest:', error);
    return NextResponse.json({ error: 'Failed to fetch quest', success: false }, { status: 500 });
  }
}
