'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const quests = [
    {
        rank: 'E',
        rankStyle: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        title: 'Build a responsive dashboard component',
        company: 'PixelCraft Studios',
        description: 'Create a reusable analytics dashboard with charts, filters, and responsive layouts.',
        xp: 500,
        reward: 120,
        deadline: '3 days',
        applicants: 4,
        tags: ['React', 'Tailwind', 'TypeScript'],
    },
    {
        rank: 'C',
        rankStyle: 'bg-violet-50 text-violet-600 border-violet-200',
        title: 'Implement OAuth2 social login flow',
        company: 'AuthGuard Inc.',
        description: 'Add Google, GitHub, and Discord OAuth2 login with proper session management.',
        xp: 2000,
        reward: 400,
        deadline: '5 days',
        applicants: 7,
        tags: ['Node.js', 'OAuth2', 'PostgreSQL'],
        featured: true,
    },
    {
        rank: 'B',
        rankStyle: 'bg-amber-50 text-amber-700 border-amber-200',
        title: 'Optimize GraphQL API performance',
        company: 'DataStream Co.',
        description: 'Fix N+1 queries, implement DataLoader patterns, and add a Redis caching layer.',
        xp: 4500,
        reward: 750,
        deadline: '7 days',
        applicants: 2,
        tags: ['GraphQL', 'Redis', 'Performance'],
    },
];

export default function QuestShowcase() {
    return (
        <section className="py-20 md:py-28">
            <div className="container px-6 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
                >
                    <div>
                        <p className="text-sm font-medium text-indigo-600 mb-3">Open quests</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-slate-900">
                            Ready to be claimed
                        </h2>
                    </div>
                    <Button asChild variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg w-fit">
                        <Link href="/dashboard/quests" className="flex items-center gap-2 text-sm">
                            View all quests <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {quests.map((quest, index) => (
                        <motion.div
                            key={quest.title}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className={`rounded-xl border bg-white p-5 hover:shadow-md hover:shadow-slate-100 transition-shadow duration-200 ${
                                quest.featured ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200'
                            }`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${quest.rankStyle}`}>
                                    {quest.rank}-Rank
                                </span>
                                {quest.featured && (
                                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Featured</span>
                                )}
                            </div>

                            {/* Content */}
                            <h3 className="text-base font-semibold text-slate-900 mb-1 leading-snug">{quest.title}</h3>
                            <p className="text-xs text-slate-400 mb-3">{quest.company}</p>
                            <p className="text-sm text-slate-500 leading-relaxed mb-4">{quest.description}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-5">
                                {quest.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-slate-500 font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-100 mb-4" />

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <Stat icon={<Zap className="w-3.5 h-3.5 text-indigo-500" />} value={`${quest.xp.toLocaleString()} XP`} />
                                <Stat icon={<DollarSign className="w-3.5 h-3.5 text-emerald-500" />} value={`$${quest.reward}`} />
                                <Stat icon={<Clock className="w-3.5 h-3.5 text-slate-400" />} value={quest.deadline} />
                                <Stat icon={<Users className="w-3.5 h-3.5 text-slate-400" />} value={`${quest.applicants} applied`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {icon}
            <span>{value}</span>
        </div>
    );
}
