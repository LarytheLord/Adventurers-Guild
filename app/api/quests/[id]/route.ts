import { createAdminSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: any
) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('id', context.params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quest: data });
}
