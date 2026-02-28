'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Compass, Code2 } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
            {/* Floating background elements — desktop only */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
                {/* XP Badge - top left */}
                <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[18%] left-[6%] flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 shadow-sm rotate-[-6deg]"
                >
                    <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">XP</span>
                    </div>
                    <span className="text-xs font-bold text-violet-600">+800</span>
                </motion.div>

                {/* S-RANK Badge - top right */}
                <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[14%] right-[8%] px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 shadow-sm rotate-[6deg] text-center"
                >
                    <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <span className="text-xs font-bold text-amber-700 tracking-wide">S-RANK</span>
                </motion.div>

                {/* Compass - left mid */}
                <motion.div
                    animate={{ y: [5, -5, 5], rotate: [0, 5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-[45%] left-[3%] w-12 h-12 rounded-full bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center"
                >
                    <Compass className="w-5 h-5 text-slate-400" />
                </motion.div>

                {/* Code tag - bottom right */}
                <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[25%] right-[5%] px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm rotate-[4deg]"
                >
                    <code className="text-xs font-mono font-medium text-emerald-600">{'<adventure />'}</code>
                </motion.div>

                {/* EST badge - bottom left */}
                <motion.div
                    animate={{ y: [4, -4, 4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute bottom-[30%] left-[8%] w-16 h-16 rounded-full border-2 border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center rotate-[-4deg]"
                >
                    <span className="text-[8px] font-medium text-slate-400 uppercase tracking-wider">Est</span>
                    <span className="text-sm font-bold text-slate-700">2025</span>
                </motion.div>
            </div>

            <div className="container px-6 mx-auto max-w-6xl relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-600 mb-8 shadow-sm"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Season 1 is live &mdash; 12 open quests
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] text-slate-900 leading-[1.08] mb-6"
                    >
                        Real coding quests.
                        <br />
                        Real companies.
                        <br />
                        <span className="text-indigo-600">Real rewards.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.16 }}
                        className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed"
                    >
                        Take on development tasks from real companies, earn money
                        and XP, rank up from F to S, and build a portfolio that matters.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.24 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
                    >
                        <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm">
                            <Link href="/register" className="flex items-center gap-2">
                                Start your adventure
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 px-7 text-sm font-medium rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                            <Link href="/dashboard/quests">
                                Browse quests
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Social proof */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-sm text-slate-400"
                    >
                        500+ developers already leveling up
                    </motion.p>
                </div>

                {/* Product visual — quest board */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="mt-16 md:mt-20 max-w-5xl mx-auto"
                >
                    <div className="rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 overflow-hidden">
                        {/* Window chrome */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                </div>
                                <span className="text-xs text-slate-400 ml-2 font-mono">guild / quest-board</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs text-slate-400">3 available</span>
                            </div>
                        </div>

                        {/* Quest rows */}
                        <div className="divide-y divide-slate-100">
                            <QuestRow
                                rank="D"
                                rankColor="bg-blue-50 text-blue-600 border-blue-200"
                                title="Fix authentication redirect bug"
                                company="TechCorp"
                                tags={['React', 'Auth']}
                                xp={800}
                                reward={150}
                            />
                            <QuestRow
                                rank="C"
                                rankColor="bg-violet-50 text-violet-600 border-violet-200"
                                title="Build REST API endpoint for user analytics"
                                company="StartupX"
                                tags={['Node.js', 'Express', 'PostgreSQL']}
                                xp={1500}
                                reward={350}
                                active
                            />
                            <QuestRow
                                rank="B"
                                rankColor="bg-amber-50 text-amber-700 border-amber-200"
                                title="Optimize database query performance"
                                company="DataFlow"
                                tags={['PostgreSQL', 'Performance']}
                                xp={3000}
                                reward={600}
                            />
                            <QuestRow
                                rank="E"
                                rankColor="bg-emerald-50 text-emerald-600 border-emerald-200"
                                title="Add responsive layout to dashboard"
                                company="PixelCraft"
                                tags={['CSS', 'Tailwind']}
                                xp={400}
                                reward={80}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function QuestRow({
    rank,
    rankColor,
    title,
    company,
    tags,
    xp,
    reward,
    active,
}: {
    rank: string;
    rankColor: string;
    title: string;
    company: string;
    tags: string[];
    xp: number;
    reward: number;
    active?: boolean;
}) {
    return (
        <div className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60 ${active ? 'bg-indigo-50/40' : ''}`}>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${rankColor} shrink-0`}>
                {rank}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{company}</p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
                {tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                        {tag}
                    </span>
                ))}
            </div>
            <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs">
                <span className="text-indigo-600 font-semibold">{xp.toLocaleString()} XP</span>
                <span className="text-emerald-600 font-semibold">${reward}</span>
            </div>
        </div>
    );
}
