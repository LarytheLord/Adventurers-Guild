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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  PanelLeft,
  Plus,
  Settings,
  ShieldCheck,
  Sword,
  Target,
  Trophy,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface DashboardNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedMode = window.localStorage.getItem('guild-sidebar-mode');
    setSidebarCollapsed(savedMode === 'icon');
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const toggleSidebarMode = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('guild-sidebar-mode', next ? 'icon' : 'full');
      return next;
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  const adventurerNav: DashboardNavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, exact: true },
    { name: 'Quests', href: '/dashboard/quests', icon: Target },
    { name: 'My Pipeline', href: '/dashboard/my-quests', icon: Briefcase },
    { name: 'Skill Tree', href: '/dashboard/skill-tree', icon: Zap },
    { name: 'Teams', href: '/dashboard/teams', icon: Users },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  ];

  const companyNav: DashboardNavItem[] = [
    { name: 'Dashboard', href: '/dashboard/company', icon: Home, exact: true },
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

  const isActive = (item: DashboardNavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);

  const sidebarModeLabel = sidebarCollapsed ? 'Show full sidebar' : 'Show icon sidebar';

  const renderNavLink = (item: DashboardNavItem) => {
    const Icon = item.icon;
    const active = isActive(item);

    const link = (
      <Link
        key={item.name}
        href={item.href}
        aria-label={sidebarCollapsed ? item.name : undefined}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex min-h-10 items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors',
          sidebarCollapsed && 'lg:justify-center lg:gap-0 lg:px-2',
          active
            ? 'border-orange-200 bg-orange-50 text-orange-600'
            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className={cn('truncate', sidebarCollapsed && 'lg:hidden')}>{item.name}</span>
      </Link>
    );

    if (!sidebarCollapsed) {
      return link;
    }

    return (
      <Tooltip key={item.name}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="hidden lg:block">
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen guild-shell">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-72 border-r border-slate-200 bg-white text-slate-900 transform transition-[transform,width] duration-200 ease-in-out lg:translate-x-0',
            sidebarCollapsed && 'lg:w-20',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            <div
              className={cn(
                'flex items-center justify-between p-4 border-b border-slate-200',
                sidebarCollapsed && 'lg:flex-col lg:gap-3'
              )}
            >
              <Link
                href={isCompany ? '/dashboard/company' : '/dashboard'}
                className="flex items-center space-x-2"
                aria-label="Guild dashboard"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 font-bold text-white">
                  AG
                </span>
                <span
                  className={cn(
                    'text-sm font-semibold tracking-wide text-slate-900',
                    sidebarCollapsed && 'lg:hidden'
                  )}
                >
                  Guild
                </span>
              </Link>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden text-slate-500 hover:bg-slate-100 lg:inline-flex"
                    onClick={toggleSidebarMode}
                    aria-label={sidebarModeLabel}
                    aria-pressed={sidebarCollapsed}
                  >
                    <PanelLeft className={cn('h-5 w-5 transition-transform', sidebarCollapsed && 'rotate-180')} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={sidebarCollapsed ? 'right' : 'bottom'}>
                  {sidebarModeLabel}
                </TooltipContent>
              </Tooltip>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-500 hover:bg-slate-100"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className={cn('px-4 pt-4', sidebarCollapsed && 'lg:hidden')}>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-orange-600">
                  <RoleIcon className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">{roleTitle}</p>
                </div>
                <p className="mt-2 text-xs text-slate-500">{roleSubtitle}</p>
              </div>
            </div>

            <nav className={cn('flex-1 p-4 space-y-2 overflow-y-auto', sidebarCollapsed && 'lg:px-3')}>
              {navigation.map(renderNavLink)}
              {isAdmin &&
                renderNavLink({
                  name: 'Admin Console',
                  href: '/admin',
                  icon: ShieldCheck,
                  exact: true,
                })}
            </nav>

            <div className="p-4 border-t border-slate-200">
              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3',
                  sidebarCollapsed && 'lg:justify-center lg:gap-0 lg:p-2'
                )}
              >
                <Avatar>
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback className="bg-slate-200 text-slate-700">{userInitials}</AvatarFallback>
                </Avatar>
                <div className={cn('flex-1 min-w-0', sidebarCollapsed && 'lg:hidden')}>
                  <p className="text-sm font-medium truncate text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className={cn('transition-[padding] duration-200', sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72')}>
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
            <div className="flex items-center justify-between px-4 py-3 lg:px-8">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
                <Compass className="h-4 w-4" />
                <span>{isCompany ? 'Company Dashboard' : 'Adventurer Dashboard'}</span>
                <LineChart className="h-4 w-4 text-orange-500" />
              </div>

              <div className="flex items-center space-x-2">
                <NotificationBell userId={session?.user?.id || ''} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open account menu">
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
                      onClick={() => signOut({ callbackUrl: '/' })}
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

          <main className="px-4 pb-8 pt-6 lg:px-8">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
