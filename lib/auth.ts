import NextAuth, { AuthOptions } from 'next-auth';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { env } from '@/lib/env';
import { UserRole, UserRank } from '@prisma/client';
import { consumeRateLimit } from '@/lib/rate-limit';

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_REQUESTS = 10;

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<{ id: string; email: string; name: string; role: UserRole; rank: UserRank; xp: number } | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const normalizedEmail = credentials.email.trim().toLowerCase();
        const loginRateLimit = consumeRateLimit('login-attempts', normalizedEmail, {
          windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
          maxRequests: LOGIN_RATE_LIMIT_MAX_REQUESTS,
        });

        if (!loginRateLimit.allowed) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          return null;
        }
        if (!user.isActive) {
          throw new Error('This account has been deactivated. Contact support if you believe this is a mistake.');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValidPassword) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? '',
          role: user.role as UserRole,
          rank: user.rank as UserRank,
          xp: user.xp,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.rank = user.rank;
        token.xp = user.xp;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.rank = token.rank as UserRank;
        session.user.xp = token.xp as number;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === 'true',
};

export default NextAuth(authOptions);
