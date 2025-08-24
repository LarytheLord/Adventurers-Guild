import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  try {
    const { data, error } = await supabase
      .from('quests')
      .select(`
        *,
        company:users!quests_company_id_fkey(name),
        applications:quest_applications(count)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const applicationsCount = Array.isArray(data?.applications)
      ? (data?.applications[0]?.count ?? 0)
      : 0;

    const quest = data
      ? {
          ...data,
          company_name: (data as any).company?.name ?? 'Unknown Company',
          applications_count: applicationsCount,
        }
      : null;

    return NextResponse.json(quest);
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const questData = await req.json();
    const questId = params.id;

    // Check if the user is the owner of the quest
    const { data: existingQuest, error: fetchError } = await supabase
      .from('quests')
      .select('company_id')
      .eq('id', questId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingQuest.company_id !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('quests')
      .update(questData)
      .eq('id', questId)
      .select()
      .single();

    if (error) {
      console.error('Error updating quest:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error parsing request body or updating quest:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const questId = params.id;

    // Check if the user is the owner of the quest
    const { data: existingQuest, error: fetchError } = await supabase
      .from('quests')
      .select('company_id')
      .eq('id', questId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existingQuest.company_id !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { error } = await supabase.from('quests').delete().eq('id', questId);

    if (error) {
      console.error('Error deleting quest:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Quest deleted successfully' });
  } catch (error) {
    console.error('Error deleting quest:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}