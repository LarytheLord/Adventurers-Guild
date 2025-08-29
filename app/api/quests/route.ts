
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

type QuestRow = Database['public']['Tables']['quests']['Row']
type Company = { name: string | null }
type ApplicationAggregate = { count: number }

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  try {
    const { data, error } = await supabase
      .from('quests')
      .select(`
        *,
        company:users!quests_company_id_fkey(name),
        applications:quest_applications(count)
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []) as Array<
      QuestRow & { company?: Company | null; applications?: ApplicationAggregate[] | null }
    >

    const quests = rows.map((q) => {
      const applicationsCount = Array.isArray(q.applications)
        ? (q.applications[0]?.count ?? 0)
        : 0;
      return {
        ...q,
        company_name: q.company?.name ?? 'Unknown Company',
        applications_count: applicationsCount,
      };
    });

    return NextResponse.json({ quests });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const questData = await req.json();

    // Add company_id from the authenticated user
    const newQuestData = {
      ...questData,
      company_id: session.user.id,
    };

    const { data, error } = await supabase
      .from('quests')
      .insert([newQuestData])
      .select()
      .single();

    if (error) {
      console.error('Error creating quest:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // shape the created quest similarly to GET response
    type CreatedQuestResponse = QuestRow & { company_name: string; applications_count: number }
    const shaped: CreatedQuestResponse = {
      ...(data as QuestRow),
      company_name: session.user.email || 'Your Company',
      applications_count: 0,
    };

    return NextResponse.json(shaped);
  } catch (error) {
    console.error('Error parsing request body or creating quest:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
