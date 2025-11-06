'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import { Menu, X, User, LogOut, Home, Briefcase, Trophy, Target } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUserRole(session.user.role);
    } else {
      setUserRole(null);
    }
  }, [status, session]);

  const handleLogout = () => {
    // In a real implementation, you would call signOut from next-auth
    // import { signOut } from 'next-auth/react';
    // await signOut({ redirect: true, callbackUrl: '/' });
  };

  const renderAuthButtons = () => {
    if (status === 'loading') {
      return (
        <div className="flex items-center space-x-4">
          <div className="h-10 w-20 bg-muted rounded-md animate-pulse"></div>
          <div className="h-10 w-20 bg-muted rounded-md animate-pulse"></div>
        </div>
      );
    }

    if (status === 'authenticated' && session?.user) {
      return (
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={session.user.name || 'User'} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                  {userRole && (
                    <Badge variant="secondary" className="w-fit mt-1">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
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
        <Button variant="outline" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Join Guild</Link>
        </Button>
      </div>
    );
  };

  const renderNavLinks = () => {
    if (status === 'authenticated' && session?.user) {
      return (
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link
            href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}
            className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
          >
            {userRole === 'company' ? 'Company Dashboard' : 'Dashboard'}
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
          </Link>
          
          {userRole !== 'company' && (
            <>
              <Link
                href="/dashboard/quests"
                className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
              >
                Quests
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
              <Link
                href="/dashboard/skill-tree"
                className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
              >
                Skill Tree
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            </>
          )}
          
          {userRole === 'company' && (
            <Link
              href="/dashboard/company/create-quest"
              className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
            >
              Create Quest
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
        <Link
          href="/#quests"
          className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
        >
          Quests
          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
        </Link>
        <Link
          href="/#about"
          className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
        >
          About
          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
        </Link>
        <Link
          href="/#how-it-works"
          className="text-foreground hover:text-primary transition-all duration-300 ease-out font-medium text-sm xl:text-base relative group"
        >
          How It Works
          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
        </Link>
      </div>
    );
  };

  const renderMobileMenu = () => {
    if (!mobileMenuOpen) return null;

    return (
      <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="px-4 sm:px-6 py-4 space-y-4">
          {status === 'authenticated' && session?.user ? (
            <>
              <Link
                href={userRole === 'company' ? '/dashboard/company' : '/dashboard'}
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-2" />
                {userRole === 'company' ? 'Company Dashboard' : 'Dashboard'}
              </Link>
              
              {userRole !== 'company' && (
                <>
                  <Link
                    href="/dashboard/quests"
                    className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Quests
                  </Link>
                  <Link
                    href="/dashboard/skill-tree"
                    className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg flex items-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Skill Tree
                  </Link>
                </>
              )}
              
              {userRole === 'company' && (
                <Link
                  href="/dashboard/company/create-quest"
                  className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Create Quest
                </Link>
              )}
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/#quests"
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quests
              </Link>
              <Link
                href="/#about"
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/login"
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 ease-out font-medium py-3 px-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Guild
              </Link>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">AG</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">
            The Adventurers Guild
          </span>
        </div>

        {renderNavLinks()}

        <div className="flex items-center space-x-2 lg:hidden">
          {renderAuthButtons()}
          <button
            className="p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="hidden lg:block">
          {renderAuthButtons()}
        </div>
      </div>

      {renderMobileMenu()}
    </nav>
  );
}