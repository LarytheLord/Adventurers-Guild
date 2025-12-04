'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Trophy,
  Zap,
  Target,
  Code2,
  Rocket,
  Users,
  Star
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 z-10">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Accepting New Adventurers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            Code Real <span className="text-gradient">Quests</span>.<br />
            Get Paid. Level Up.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop building to-do apps. Join the guild to work on real-world projects from top companies, earn XP, and build a career-defining portfolio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
          >
            <form onSubmit={handleSubmit} className="flex w-full gap-2 p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <Input
                type="email"
                placeholder="Enter your email..."
                className="bg-transparent border-none focus-visible:ring-0 h-12 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" size="lg" className="h-12 px-6 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Join <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
          >
            {/* Partner Logos Placeholder */}
            <div className="text-sm font-semibold tracking-widest uppercase">Trusted by Industry Leaders</div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative z-10">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Target className="w-6 h-6 text-blue-400" />}
              title="Real World Quests"
              description="Work on actual tickets from partner companies. Fix bugs, build features, and ship code that matters."
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6 text-yellow-400" />}
              title="Rank Up System"
              description="Progress from F-Rank to S-Rank. Unlock exclusive quests, higher pay rates, and mentorship as you level up."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-purple-400" />}
              title="Earn While Learning"
              description="Get paid for every completed quest. Build your portfolio and your bank account simultaneously."
            />
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatItem value="500+" label="Active Adventurers" />
            <StatItem value="$50k+" label="Paid to Students" />
            <StatItem value="120+" label="Quests Completed" />
            <StatItem value="15" label="Partner Companies" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-10 text-center">
        <div className="container px-4 mx-auto max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            The Guild is accepting new members. Claim your spot and start your journey today.
          </p>
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-gray-200">
            <Link href="/register">
              Create Your Account
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black/20">
        <div className="container px-4 mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 The Adventurers Guild. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 rounded-2xl hover:bg-white/5 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}