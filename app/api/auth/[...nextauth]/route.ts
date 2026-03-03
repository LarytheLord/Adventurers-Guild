import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

type NextAuthRouteContext = { params: Promise<Record<string, string[]>> };

async function GET(req: NextRequest, context: NextAuthRouteContext) {
  const params = await context.params;
  return handler(req as Parameters<typeof handler>[0], { params } as Parameters<typeof handler>[1]);
}

async function POST(req: NextRequest, context: NextAuthRouteContext) {
  const params = await context.params;
  return handler(req as Parameters<typeof handler>[0], { params } as Parameters<typeof handler>[1]);
}

export { GET, POST };
