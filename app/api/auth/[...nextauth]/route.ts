// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

// Wrap handlers to support Next.js 15 async params
async function GET(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params;
  return handler(req, { params } as any);
}

async function POST(req: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params;
  return handler(req, { params } as any);
}

export { GET, POST };
