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
import { Menu, X, User, LogOut, Home, Briefcase, Trophy, Target, Code2 } from 'lucide-react';
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
        <div className="flex items-center space-x-4">
          <div className="h-10 w-20 bg-white/5 rounded-md animate-pulse"></div>
          <div className="h-10 w-20 bg-white/5 rounded-md animate-pulse"></div>
        </div>
      );
    }

    if (status === 'authenticated' && session?.user) {
      return (
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {session.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10 text-white" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                  {userRole && (
                    <Badge variant="secondary" className="w-fit mt-1 bg-primary/20 text-primary border-none">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                <Link href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-500/20 focus:text-red-400 cursor-pointer text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-4">
        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
          Login
        </Link>
        <Button asChild size="sm" className="bg-white text-black hover:bg-white/90 font-semibold rounded-full px-6">
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
        <NavLink href="/#quests">Quests</NavLink>
        <NavLink href="/#about">About</NavLink>
        <NavLink href="/#how-it-works">How It Works</NavLink>
      </div>
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        scrolled || !isHome
          ? "bg-black/60 backdrop-blur-xl border-white/5 py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <span className="text-white">Adventurers Guild</span>
        </Link>

        {renderNavLinks()}

        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            {renderAuthButtons()}
          </div>

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {status === 'authenticated' ? (
            <>
              <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink href="/dashboard/quests" onClick={() => setMobileMenuOpen(false)}>Quests</MobileNavLink>
              <button onClick={handleLogout} className="text-left text-red-400 font-medium py-2">Log Out</button>
            </>
          ) : (
            <>
              <MobileNavLink href="/#quests" onClick={() => setMobileMenuOpen(false)}>Quests</MobileNavLink>
              <MobileNavLink href="/login" onClick={() => setMobileMenuOpen(false)}>Login</MobileNavLink>
              <MobileNavLink href="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</MobileNavLink>
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
      className="text-sm font-medium text-muted-foreground hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-lg font-medium text-white/80 hover:text-white py-2 border-b border-white/5"
    >
      {children}
    </Link>
  );
}