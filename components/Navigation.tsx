'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
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
import { Badge } from '@/components/ui/badge';
import { Menu, X, User, LogOut, ShieldAlert} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'ranks' | 'how-it-works' | 'quests' | 'join'>('home');
  const pathname = usePathname();
  const normalizedPath = pathname ? pathname.replace(/\/+$/, '') || '/' : null;

  const isHome = normalizedPath === '/';
  const isDashboard = !!normalizedPath && (normalizedPath.startsWith('/dashboard') || normalizedPath.startsWith('/admin'));
  const authRoutePrefixes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthPage = !!normalizedPath && authRoutePrefixes.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isHome) {
      setActiveSection('home');
      return;
    }

    const updateActiveSection = () => {
      if (window.scrollY < 160) {
        setActiveSection('home');
        return;
      }

      const orderedSections: Array<'ranks' | 'how-it-works' | 'quests' | 'join'> = ['ranks', 'how-it-works', 'quests', 'join'];
      let nextSection: 'home' | 'ranks' | 'how-it-works' | 'quests' | 'join' = 'home';

      for (const sectionId of orderedSections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        if (window.scrollY >= section.offsetTop - 180) {
          nextSection = sectionId;
        }
      }

      setActiveSection(nextSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [isHome]);

  // Dashboard screens have dedicated layouts
  if (isDashboard || !mounted) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const userRole = session?.user?.role;

  // Keep the header translucent over hero before scroll.
  const isTransparent = isHome && !scrolled && !mobileMenuOpen;

  const marketingLinks = [
    { href: '/', label: 'Home' },
    { href: '/#ranks', label: 'Ranks' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/register?tab=company', label: 'For Companies' },
  ];

  const memberLinks =
    userRole === 'company'
      ? [
          { href: '/dashboard/company', label: 'Dashboard' },
          { href: '/dashboard/company/create-quest', label: 'Post Quest' },
        ]
      : [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/dashboard/quests', label: 'Quests' },
          { href: '/dashboard/leaderboard', label: 'Leaderboard' },
        ];

  const activeHref = (href: string) => {
    if (!pathname) return false;

    const [route, hash] = href.split('#');

    if (route === '/' && isHome) {
      if (!hash) return activeSection === 'home';
      return activeSection === hash;
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  };

  const renderAuthButtons = () => {
    if (status === 'loading') {
      return (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'h-9 w-16 rounded-lg animate-pulse',
              isTransparent ? 'bg-white/15' : 'bg-slate-200'
            )}
          />
          <div
            className={cn(
              'h-9 w-24 rounded-lg animate-pulse',
              isTransparent ? 'bg-white/15' : 'bg-slate-200'
            )}
          />
        </div>
      );
    }

    if (status === 'authenticated' && session?.user) {
      return (
        <div className="flex items-center gap-3">
          <NotificationBell userId={session.user.id} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'relative h-9 w-9 rounded-full transition-all hover:bg-transparent',
                  isTransparent
                    ? 'ring-1 ring-white/30 hover:ring-white/60'
                    : 'ring-1 ring-slate-200 hover:ring-slate-300'
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={session.user.image || ''}
                    alt={session.user.name || 'User'}
                  />
                  <AvatarFallback
                    className={cn(
                      'text-sm font-semibold',
                      isTransparent
                        ? 'bg-white/10 text-white'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {session.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                  {userRole && (
                    <Badge variant="secondary" className="w-fit mt-1 text-xs capitalize">
                      {userRole}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              {userRole === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            isTransparent
              ? 'text-white/85 hover:text-white hover:bg-white/10'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          Sign In
        </Link>
        <Button
          asChild
          size="sm"
          className="h-9 rounded-full px-5"
        >
          <Link href="/register" className="inline-flex items-center gap-1.5">
            Join Guild
          </Link>
        </Button>
      </div>
    );
  };

  const renderNavLinks = () => {
    if (status === 'authenticated' && session?.user) {
      return (
        <div className="hidden lg:flex items-center gap-2">
          {memberLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              transparent={isTransparent}
              active={activeHref(link.href)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      );
    }

    return (
      <div className="hidden lg:flex items-center gap-2">
        {marketingLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            transparent={isTransparent}
            active={activeHref(link.href)}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    );
  };

  return (
    <nav className="fixed inset-x-0 top-3 z-50 px-3 sm:px-6">
      <div
        className={cn(
          'mx-auto max-w-6xl rounded-full border backdrop-blur-xl transition-all duration-300',
          isTransparent
            ? 'border-white/15 bg-black/25 shadow-[0_16px_48px_-28px_rgba(15,23,42,0.85)]'
            : 'border-slate-200/80 bg-white/90 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]'
        )}
      >
        <div className="flex h-14 items-center justify-between px-3 sm:px-5">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo/guild-logo.png"
              alt="Guild"
              className="h-10 w-10 flex-shrink-0 object-contain"
            />
          </Link>

          {renderNavLinks()}

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">{renderAuthButtons()}</div>
            <button
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors relative w-9 h-9 flex items-center justify-center',
                isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5 flex-shrink-0">
                <X className={`w-5 h-5 absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
                <Menu className={`w-5 h-5 absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
              </div>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className={cn(
              'lg:hidden border-t px-4 pb-4 pt-3',
              isTransparent ? 'border-white/15 bg-black/45' : 'border-slate-200 bg-white/95'
            )}
          >
            <div className="flex flex-col gap-1">
              {status === 'authenticated' ? (
                <>
                  {memberLinks.map((link) => (
                    <MobileNavLink
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      transparent={isTransparent}
                      active={activeHref(link.href)}
                    >
                      {link.label}
                    </MobileNavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'text-left font-medium py-2.5 px-3 text-sm rounded-lg transition-colors',
                      isTransparent
                        ? 'text-red-300 hover:bg-red-500/15'
                        : 'text-red-600 hover:bg-red-50'
                    )}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  {marketingLinks.map((link) => (
                    <MobileNavLink
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      transparent={isTransparent}
                      active={activeHref(link.href)}
                    >
                      {link.label}
                    </MobileNavLink>
                  ))}
                  <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)} transparent={isTransparent}>
                    Sign In
                  </MobileNavLink>
                  <div className="pt-2 pb-1">
                    <Button asChild className="w-full h-11 rounded-xl">
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        Join the Guild
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  transparent,
  active,
}: {
  href: string;
  children: React.ReactNode;
  transparent?: boolean;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        transparent
          ? 'text-white/80 hover:text-white hover:bg-white/10'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        active &&
          (transparent
            ? 'bg-white/15 text-white'
            : 'bg-slate-900 text-white hover:bg-slate-900 hover:text-white')
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
  transparent,
  active,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  transparent?: boolean;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-sm font-medium py-2.5 px-3 rounded-lg transition-colors',
        transparent
          ? 'text-white/85 hover:text-white hover:bg-white/10'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
        active &&
          (transparent
            ? 'bg-white/15 text-white'
            : 'bg-slate-900 text-white hover:bg-slate-900 hover:text-white')
      )}
    >
      {children}
    </Link>
  );
}
