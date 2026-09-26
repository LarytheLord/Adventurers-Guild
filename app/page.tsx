'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BusinessLanding from '@/components/landing/BusinessLanding';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Logged-in users skip the marketing page and go straight to their workspace.
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role;
      if (userRole === 'company') router.push('/dashboard/company');
      else if (userRole === 'admin') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [status, session, router]);

  // Default landing for everyone else is the client / business page.
  return <BusinessLanding />;
}
