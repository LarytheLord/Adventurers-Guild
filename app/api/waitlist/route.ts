import sql from '@/lib/db';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const waitlist = await sql`SELECT * FROM waitlist ORDER BY created_at ASC`;
    return NextResponse.json(waitlist);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const [newUser] = await sql`INSERT INTO waitlist (email) VALUES (${email}) RETURNING *`;
    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
