import NextAuth, { AuthOptions } from 'next-auth';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma, withDbRetry } from './db';
import { env } from '@/lib/env';
import { UserRole, UserRank } from '@prisma/client';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
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
        try {
          const normalizedEmail = credentials.email.trim().toLowerCase();

          const user = await withDbRetry(() =>
            prisma.user.findUnique({ where: { email: normalizedEmail } })
          );

          if (!user) {
            if (process.env.NODE_ENV === 'development') console.log('[Auth] User not found:', normalizedEmail);
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValidPassword) {
            if (process.env.NODE_ENV === 'development') console.log('[Auth] Invalid password for:', credentials.email);
            return null;
          }

          // Non-blocking — a cold-start failure here must not block a valid login
          prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            .catch(e => console.warn('[Auth] lastLoginAt update failed:', e));

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? '',
            role: user.role as UserRole,
            rank: user.rank as UserRank,
            xp: user.xp,
          };
        } catch (error) {
          console.error('[Auth] authorize error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const normalizedEmail = user.email.trim().toLowerCase();
        let dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!dbUser) {
          // Auto-create adventurer account for Google sign-in
          const username = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 1000);
          dbUser = await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: user.name ?? '',
              username,
              passwordHash: '',
              role: 'adventurer' as UserRole,
              rank: 'F' as UserRank,
              xp: 0,
            },
          });
        }
        // Attach DB user info to the user object for JWT callback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).id = dbUser.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).role = dbUser.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).rank = dbUser.rank;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).xp = dbUser.xp;
        // Update last login
        await prisma.user.update({ where: { id: dbUser.id }, data: { lastLoginAt: new Date() } });
      }
      return true;
    },
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
