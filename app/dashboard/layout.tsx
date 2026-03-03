'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import {
  BarChart3,
  Briefcase,
  Building2,
  Compass,
  Home,
  LineChart,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  Sword,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  const user = session.user;
  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const isCompany = user?.role === 'company';
  const isAdmin = user?.role === 'admin';
  const profileHref = isCompany ? '/dashboard/company/profile' : '/dashboard/profile';

  const adventurerNav = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Quests', href: '/dashboard/quests', icon: Target },
    { name: 'My Pipeline', href: '/dashboard/my-quests', icon: Briefcase },
    { name: 'Skill Tree', href: '/dashboard/skill-tree', icon: Zap },
    { name: 'Teams', href: '/dashboard/teams', icon: Users },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  ];

  const companyNav = [
    { name: 'Dashboard', href: '/dashboard/company', icon: Home },
    { name: 'My Quests', href: '/dashboard/company/quests', icon: Target },
    { name: 'Create Quest', href: '/dashboard/company/create-quest', icon: Plus },
    { name: 'Rankings', href: '/dashboard/leaderboard', icon: Trophy },
    { name: 'Analytics', href: '/dashboard/company/analytics', icon: BarChart3 },
    { name: 'Company Profile', href: '/dashboard/company/profile', icon: Building2 },
  ];

  const navigation = isCompany ? companyNav : adventurerNav;
  const roleTitle = isCompany ? 'Company Command' : 'Adventurer Hub';
  const roleSubtitle = isCompany
    ? 'Manage delivery and talent pipeline'
    : 'Track progression and claim new quests';
  const roleIcon = isCompany ? Briefcase : Sword;
  const RoleIcon = roleIcon;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <div className="min-h-screen guild-shell">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 border-r border-slate-800 bg-slate-950 text-slate-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <Link
              href={isCompany ? '/dashboard/company' : '/dashboard'}
              className="flex items-center space-x-2"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-bold text-black">
                AG
              </span>
              <span className="text-sm font-semibold tracking-wide text-slate-200">
                Adventurers Guild
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-200 hover:bg-slate-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-4 pt-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="flex items-center gap-2 text-orange-300">
                <RoleIcon className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">{roleTitle}</p>
              </div>
              <p className="mt-2 text-xs text-slate-400">{roleSubtitle}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-orange-500/25 to-amber-400/20 text-white border border-orange-400/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'mt-2 flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === '/admin'
                    ? 'bg-gradient-to-r from-violet-500/30 to-indigo-500/20 text-white border border-violet-400/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <Avatar>
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-slate-800 text-slate-100">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <Compass className="h-4 w-4" />
              <span>
                {isCompany ? 'Company Dashboard' : 'Adventurer Dashboard'}
              </span>
              <LineChart className="h-4 w-4 text-orange-500" />
            </div>

            <div className="flex items-center space-x-2">
              <NotificationBell userId={session?.user?.id || ''} />
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.image || undefined} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={profileHref}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/home' })}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 pb-8 pt-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
