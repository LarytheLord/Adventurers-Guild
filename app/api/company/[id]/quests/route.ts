import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { withRoleProtection } from '@/lib/protectedRouteHandler';

async function getCompanyQuests(
  request: NextRequest,
  context: { user: any, profile: any, params: { id: string } }
) {
  // Only company users or admins can view their own quests
  if (context.profile.role !== 'company' && context.profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Companies can only view their own quests, admins can view any
  if (context.profile.role === 'company' && context.profile.id !== context.params.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('company_id', context.params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quests: data });
}

export const GET = withRoleProtection(getCompanyQuests, ['company', 'admin']);
