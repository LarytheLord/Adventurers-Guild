import { UserRole, UserRank } from '@prisma/client';
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      rank: UserRank;
      xp: number;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
    rank: UserRank;
    xp: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    rank: UserRank;
    xp: number;
  }
}