import { NextResponse } from 'next/server';

import { getPublicAdventurerProfile } from '@/lib/public-adventurer-profile';

export async function GET(
  _request: Request,
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;
  const profile = await getPublicAdventurerProfile(username);

  if (!profile) {
    return NextResponse.json({ error: 'Adventurer not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}
