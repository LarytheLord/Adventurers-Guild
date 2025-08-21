import { createAdminSupabaseClient } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  context: any
) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('quest_giver_id', context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quests: data });
}
