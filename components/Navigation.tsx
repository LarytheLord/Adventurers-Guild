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
import { Menu, X, User, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/home' || pathname === '/';
  const isDashboard = pathname?.startsWith('/dashboard') || pathname === '/admin';

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

  // Dashboard and admin have their own navigation systems
  if (isDashboard || !mounted) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/home' });
  };

  const userRole = session?.user?.role;

  // Keep the header translucent over hero before scroll.
  const isTransparent = isHome && !scrolled && !mobileMenuOpen;

  const marketingLinks = [
    { href: '/home#how-it-works', label: 'How It Works' },
    { href: '/home#features', label: 'Features' },
    { href: '/register-company', label: 'For Companies' },
  ];

  const memberLinks =
    userRole === 'company'
      ? [
          { href: '/dashboard/company', label: 'Dashboard' },
          { href: '/dashboard/company/create-quest', label: 'Post Quest' },
        ]
      : [{ href: '/dashboard', label: 'Dashboard' }, { href: '/dashboard/quests', label: 'Quests' }];

  const activeHref = (href: string) => {
    if (href.startsWith('/home#')) return isHome;
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
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
            <Sparkles className="h-3.5 w-3.5" />
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
          'mx-auto max-w-6xl rounded-2xl border backdrop-blur-xl transition-all duration-300',
          isTransparent
            ? 'border-white/15 bg-black/25 shadow-[0_16px_48px_-28px_rgba(15,23,42,0.85)]'
            : 'border-slate-200/80 bg-white/90 shadow-[0_18px_35px_-28px_rgba(15,23,42,0.45)]'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
              <span className="text-black font-bold text-sm">AG</span>
            </div>
            <span
              className={cn(
                'font-bold text-lg tracking-tight transition-colors hidden sm:block',
                isTransparent ? 'text-white' : 'text-slate-900'
              )}
            >
              Adventurers Guild
            </span>
          </Link>

          {renderNavLinks()}

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">{renderAuthButtons()}</div>
            <button
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
