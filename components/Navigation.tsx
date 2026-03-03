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
import { Menu, X, User, LogOut, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/home' || pathname === '/';
  const isDashboard =
    pathname?.startsWith('/dashboard') || pathname === '/admin';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dashboard and admin have their own navigation systems
  if (isDashboard) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/home' });
  };

  const userRole = session?.user?.role;

  // On the home page before scroll, overlay the dark shader hero
  const isTransparent = isHome && !scrolled;

  const renderAuthButtons = () => {
    if (status === 'loading') {
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-9 w-24 bg-white/10 rounded-lg animate-pulse" />
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
                  'relative h-9 w-9 rounded-full transition-all',
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
            'text-sm font-medium transition-colors',
            isTransparent
              ? 'text-white/80 hover:text-white'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          Sign In
        </Link>
        <Button
          asChild
          size="sm"
          className="h-9 px-5 text-sm font-semibold rounded-full bg-orange-500 hover:bg-orange-600 text-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
        >
          <Link href="/register">Join Guild</Link>
        </Button>
      </div>
    );
  };

  const renderNavLinks = () => {
    if (status === 'authenticated' && session?.user) {
      return (
        <div className="hidden lg:flex items-center gap-8">
          <NavLink
            href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}
            transparent={isTransparent}
          >
            Dashboard
          </NavLink>
          {userRole !== 'company' && (
            <NavLink href="/dashboard/quests" transparent={isTransparent}>
              Quests
            </NavLink>
          )}
          {userRole === 'company' && (
            <NavLink href="/dashboard/company/create-quest" transparent={isTransparent}>
              Post Quest
            </NavLink>
          )}
        </div>
      );
    }

    return (
      <div className="hidden lg:flex items-center gap-8">
        <NavLink href="/#how-it-works" transparent={isTransparent}>
          How It Works
        </NavLink>
        <NavLink href="/#features" transparent={isTransparent}>
          Features
        </NavLink>
        <NavLink href="/register-company" transparent={isTransparent}>
          For Companies
        </NavLink>
      </div>
    );
  };

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isTransparent
          ? 'py-5'
          : 'bg-white/95 backdrop-blur-lg border-b border-slate-200/60 py-3 shadow-sm'
      )}
    >
      <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
        {/* Logo */}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {status === 'authenticated' ? (
              <>
                <MobileNavLink
                  href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                {userRole !== 'company' && (
                  <MobileNavLink
                    href="/dashboard/quests"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Quests
                  </MobileNavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left text-red-600 font-medium py-2.5 px-3 text-sm rounded-lg hover:bg-red-50 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <MobileNavLink href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </MobileNavLink>
                <MobileNavLink href="/#features" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </MobileNavLink>
                <MobileNavLink href="/register-company" onClick={() => setMobileMenuOpen(false)}>
                  For Companies
                </MobileNavLink>
                <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </MobileNavLink>
                <div className="pt-2 pb-1">
                  <Button
                    asChild
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl"
                  >
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
    </nav>
  );
}

function NavLink({
  href,
  children,
  transparent,
}: {
  href: string;
  children: React.ReactNode;
  transparent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors',
        transparent
          ? 'text-white/75 hover:text-white'
          : 'text-slate-500 hover:text-slate-900'
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
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}
