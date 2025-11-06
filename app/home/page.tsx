'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Users, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect based on role
    if (status === 'authenticated' && session?.user) {
      const userRole = session.user.role;
      
      if (userRole === 'company') {
        router.push('/dashboard/company');
      } else if (userRole === 'admin') {
        router.push('/admin');
      } else {
        // Default to adventurer dashboard
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, show public home page
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">AG</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">
              The Adventurers Guild
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Join Guild</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Forge Your Path as a Digital Pioneer
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The Adventurers Guild connects students with real-world projects from companies. 
            Earn XP, climb the ranks, and build your portfolio with meaningful work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Join as Adventurer</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register-company">Join as Company</Link>
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <CardHeader className="p-0">
              <CardTitle>Real Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CardDescription>
                Work on actual projects commissioned by real companies, not just academic exercises.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <CardHeader className="p-0">
              <CardTitle>Earn XP & Ranks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CardDescription>
                Progress from F-Rank to S-Rank by completing quests and mastering skills.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <CardHeader className="p-0">
              <CardTitle>Build Community</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CardDescription>
                Join a community of ambitious developers, collaborate, and grow together.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        <section className="bg-muted rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Adventure?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of adventurers who are already building their skills and portfolios 
            with real-world projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Create Adventurer Account</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register-company">Register Company</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} The Adventurers Guild. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
