import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { AdminRail } from '@/components/admin/AdminRail';
import { authOptions } from '@/lib/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen guild-shell">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <AdminRail />
        <main className="min-w-0 flex-1 pb-8">{children}</main>
      </div>
    </div>
  );
}
