import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

// Next.js 15 passes params as a Promise. Await them before forwarding
// so the sync-dynamic-APIs warning about params.nextauth is silenced.
async function GET(req: NextRequest, context: { params: Promise<Record<string, string[]>> }) {
  await context.params; // resolve the promise; NextAuth reads nextauth from the URL
  return handler(req as Parameters<typeof handler>[0], context as Parameters<typeof handler>[1]);
}

async function POST(req: NextRequest, context: { params: Promise<Record<string, string[]>> }) {
  await context.params;
  return handler(req as Parameters<typeof handler>[0], context as Parameters<typeof handler>[1]);
}

export { GET, POST };
