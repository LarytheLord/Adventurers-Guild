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
import { Menu, X, User, LogOut, Code2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const userRole = session?.user?.role;

  const renderAuthButtons = () => {
    if (status === 'loading') {
      return (
        <div className="flex items-center space-x-3">
          <div className="h-9 w-16 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      );
    }

    if (status === 'authenticated' && session?.user) {
      return (
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-slate-200 hover:ring-slate-300 transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-semibold">
                    {session.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-slate-500">{session.user.email}</p>
                  {userRole && (
                    <Badge variant="secondary" className="w-fit mt-1 text-xs">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Log in
        </Link>
        <Button asChild size="sm" className="h-9 px-5 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800">
          <Link href="/register">Get Started</Link>
        </Button>
      </div>
    );
  };

  const renderNavLinks = () => {
    if (status === 'authenticated' && session?.user) {
      return (
        <div className="hidden lg:flex items-center space-x-8">
          <NavLink href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}>
            {userRole === 'company' ? 'Company Dashboard' : 'Dashboard'}
          </NavLink>
          {userRole !== 'company' && (
            <>
              <NavLink href="/dashboard/quests">Quests</NavLink>
              <NavLink href="/dashboard/skill-tree">Skill Tree</NavLink>
            </>
          )}
          {userRole === 'company' && (
            <NavLink href="/dashboard/company/create-quest">Create Quest</NavLink>
          )}
        </div>
      );
    }

    return (
      <div className="hidden lg:flex items-center space-x-8">
        <NavLink href="/#how-it-works">How It Works</NavLink>
        <NavLink href="/#features">Features</NavLink>
        <NavLink href="/#quests">Quests</NavLink>
      </div>
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-200",
        scrolled || !isHome
          ? "bg-white/80 backdrop-blur-lg border-b border-slate-200/60 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight group">
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white group-hover:bg-slate-800 transition-colors">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-slate-900">Adventurers Guild</span>
        </Link>

        {renderNavLinks()}

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            {renderAuthButtons()}
          </div>

          <button
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 p-4 flex flex-col gap-1 shadow-lg">
          {status === 'authenticated' ? (
            <>
              <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink href="/dashboard/quests" onClick={() => setMobileMenuOpen(false)}>Quests</MobileNavLink>
              <button onClick={handleLogout} className="text-left text-red-600 font-medium py-2.5 px-3 text-sm">Log Out</button>
            </>
          ) : (
            <>
              <MobileNavLink href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</MobileNavLink>
              <MobileNavLink href="/#features" onClick={() => setMobileMenuOpen(false)}>Features</MobileNavLink>
              <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)}>Login</MobileNavLink>
              <div className="pt-2">
                <Button asChild size="sm" className="w-full h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
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
