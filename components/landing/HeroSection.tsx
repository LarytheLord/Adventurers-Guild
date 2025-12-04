'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function HeroSection() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("You've joined the guild! Check your email.");
            setEmail('');
        } catch (error) {
            toast.error("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Dynamic Background */}
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 bg-black">
                <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[128px] animate-pulse-subtle mix-blend-screen" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[128px] animate-pulse-subtle delay-1000 mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] animate-pulse-subtle delay-500" />
            </div>

            <div className="container px-4 mx-auto relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium mb-8 hover:bg-white/10 transition-colors cursor-default"
                >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                        New Quests Available
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-6xl md:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
                >
                    Code Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-shine bg-[length:200%_auto]">Quests</span>.
                    <br />
                    Get Paid. Level Up.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Stop building to-do apps. Join the guild to work on real-world projects from top companies, earn XP, and build a career-defining portfolio.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col items-center gap-6"
                >
                    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl shadow-purple-500/10">
                        <Input
                            type="email"
                            placeholder="Enter your email..."
                            className="bg-transparent border-none focus-visible:ring-0 h-12 text-base placeholder:text-muted-foreground/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 px-8 rounded-xl bg-white text-black hover:bg-gray-200 transition-all duration-300 font-medium"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    Join <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-white/10 border border-black flex items-center justify-center text-xs font-medium">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p>Join 500+ other adventurers</p>
                    </div>
                </motion.div>
            </div>

            {/* Floating Elements 3D Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ y: [-20, 20, -20] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-[10%] w-64 h-40 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hidden lg:block rotate-[-6deg]"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-white/10 rounded" />
                        <div className="h-2 w-1/2 bg-white/10 rounded" />
                        <div className="h-2 w-full bg-white/10 rounded" />
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [20, -20, 20] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-[10%] w-56 h-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hidden lg:block rotate-[6deg]"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-green-400">+$500.00</span>
                        <span className="text-[10px] text-muted-foreground">Just now</span>
                    </div>
                    <div className="text-sm font-medium">Quest Completed</div>
                    <div className="text-xs text-muted-foreground">API Integration Fix</div>
                </motion.div>
            </div>
        </section>
    );
}
