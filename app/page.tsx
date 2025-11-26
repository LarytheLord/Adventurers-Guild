'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Trophy,
  Zap,
  Target,
  User,
  Terminal,
  Github,
  Globe,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: email.split('@')[0],
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("You've joined the guild! Check your email.");
        setEmail('');
      } else {
        toast.error(data.message || "Failed to join. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <motion.div
            className="flex flex-col items-center text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="px-4 py-1 text-sm border-primary/50 text-primary bg-primary/10 mb-4">
                <Terminal className="w-3 h-3 mr-2 inline-block" />
                v1.0 Beta Access
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary max-w-4xl"
              variants={itemVariants}
            >
              Level Up Your Coding Journey with Real Quests
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              The Adventurers Guild connects ambitious students with real-world company projects. Earn XP, climb the ranks, and get paid to learn.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto mt-8"
              variants={itemVariants}
            >
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email to join..."
                  className="bg-background/50 backdrop-blur-sm border-primary/20 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Join <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            <motion.p className="text-sm text-muted-foreground" variants={itemVariants}>
              Join 500+ adventurers waiting for their first quest.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Join The Guild?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop building to-do apps. Start solving real problems for real companies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Real World Quests</CardTitle>
                <CardDescription>
                  Work on actual tickets from partner companies. Fix bugs, build features, and ship code that matters.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle>Rank Up System</CardTitle>
                <CardDescription>
                  Progress from F-Rank to S-Rank based on your performance. Unlock harder quests and higher rewards as you level up.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Earn While Learning</CardTitle>
                <CardDescription>
                  Get paid for completed quests. Build your portfolio and your bank account simultaneously.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold">Your Journey to S-Rank</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
                    <p className="text-muted-foreground">Showcase your skills, GitHub stats, and areas of interest.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Accept a Quest</h3>
                    <p className="text-muted-foreground">Browse the quest board and pick a task that matches your rank and skills.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Submit & Get Reviewed</h3>
                    <p className="text-muted-foreground">Submit your PR. Get code review from senior devs and company mentors.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">4</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Get Paid & Level Up</h3>
                    <p className="text-muted-foreground">Receive payment and XP upon approval. Unlock better quests.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full" />
              <div className="relative bg-card border border-border rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">Adventurer #42</div>
                      <div className="text-xs text-muted-foreground">Level 5 • B-Rank</div>
                    </div>
                  </div>
                  <Badge>Online</Badge>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-secondary rounded-full" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>XP Progress</span>
                    <span>750 / 1000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-xs text-muted-foreground">Quests Done</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-500">$450</div>
                      <div className="text-xs text-muted-foreground">Earned</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Guild Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Zap key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "I learned more in 2 weeks of doing quests than I did in a whole semester of college. The code reviews are brutal but incredibly helpful."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20" />
                  <div>
                    <div className="font-bold">Sarah J.</div>
                    <div className="text-xs text-muted-foreground">A-Rank Adventurer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Zap key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "Finally a way to get real experience without needing 5 years of experience first. The payment system is just the cherry on top."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20" />
                  <div>
                    <div className="font-bold">Mike T.</div>
                    <div className="text-xs text-muted-foreground">B-Rank Adventurer</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Zap key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  "As a startup, we get our backlog cleared and help students learn. It's a win-win. The quality of work has been surprisingly high."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20" />
                  <div>
                    <div className="font-bold">TechCorp Inc.</div>
                    <div className="text-xs text-muted-foreground">Guild Partner</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The Guild is accepting new members. Claim your spot and start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Join the Waitlist
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg" asChild>
              <Link href="/login">
                Member Login
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">AG</span>
                </div>
                <span className="font-bold">The Adventurers Guild</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering the next generation of developers through gamified real-world experience.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Quests</Link></li>
                <li><Link href="#" className="hover:text-primary">Rankings</Link></li>
                <li><Link href="#" className="hover:text-primary">Companies</Link></li>
                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Community</Link></li>
                <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Globe className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Cpu className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 The Adventurers Guild. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}