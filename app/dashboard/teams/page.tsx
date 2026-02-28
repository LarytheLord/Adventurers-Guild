'use client';

import { useSession } from 'next-auth/react';
import TeamManagement from '@/components/TeamManagement';

export default function TeamsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <TeamManagement userId={session.user.id} />
    </div>
  );
}
