'use client';

import { motion } from 'framer-motion';

const features = [
    {
        title: 'Real-world projects',
        description: 'No tutorials. Work on actual production tasks from partner companies — bug fixes, features, and integrations.',
        span: 'md:col-span-2',
        visual: (
            <div className="mt-6 space-y-2">
                {['Fix pagination bug in dashboard', 'Build webhook handler for Stripe events', 'Add rate limiting to public API'].map((task, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            i === 0 ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            i === 1 ? 'bg-violet-50 text-violet-600 border-violet-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                            {i === 0 ? 'D' : i === 1 ? 'C' : 'B'}
                        </span>
                        <span className="text-sm text-slate-600">{task}</span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        title: 'Rank up from F to S',
        description: 'Progress through 7 ranks. Higher ranks unlock exclusive quests with bigger rewards.',
        span: 'md:col-span-1',
        visual: (
            <div className="mt-6 space-y-1.5">
                {[
                    { rank: 'S', w: 'w-full', color: 'bg-red-500' },
                    { rank: 'A', w: 'w-[85%]', color: 'bg-orange-500' },
                    { rank: 'B', w: 'w-[70%]', color: 'bg-amber-500' },
                    { rank: 'C', w: 'w-[55%]', color: 'bg-violet-500' },
                    { rank: 'D', w: 'w-[40%]', color: 'bg-blue-500' },
                    { rank: 'E', w: 'w-[25%]', color: 'bg-emerald-500' },
                    { rank: 'F', w: 'w-[12%]', color: 'bg-slate-400' },
                ].map((r) => (
                    <div key={r.rank} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-3 text-center">{r.rank}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${r.color} ${r.w}`} />
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        title: 'Get paid for your code',
        description: 'Every completed quest pays real money. Build your portfolio and your bank account simultaneously.',
        span: 'md:col-span-1',
        visual: (
            <div className="mt-6 space-y-2">
                {[
                    { label: 'API Bug Fix', amount: '$150', time: '2h ago' },
                    { label: 'Dashboard Feature', amount: '$350', time: '1d ago' },
                    { label: 'DB Migration', amount: '$600', time: '3d ago' },
                ].map((e, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div>
                            <p className="text-xs text-slate-600 font-medium">{e.label}</p>
                            <p className="text-[10px] text-slate-400">{e.time}</p>
                        </div>
                        <span className="text-sm font-semibold text-emerald-600">{e.amount}</span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        title: 'Code review from senior engineers',
        description: 'Every submission gets reviewed. Get real feedback, learn best practices, and grow faster than any bootcamp.',
        span: 'md:col-span-2',
        visual: (
            <div className="mt-6 rounded-lg bg-slate-50 border border-slate-100 p-4 font-mono text-xs">
                <div className="space-y-1">
                    <div className="text-slate-400"><span className="text-slate-300 mr-3">12</span>{'  const data = await'}</div>
                    <div className="bg-red-50 text-red-600 rounded px-1.5 py-0.5 -mx-1.5"><span className="text-red-300 mr-3">{'−'}</span>{'    fetch(url);'}</div>
                    <div className="bg-emerald-50 text-emerald-700 rounded px-1.5 py-0.5 -mx-1.5"><span className="text-emerald-400 mr-3">{'+'}</span>{'    fetchWithRetry(url, 3);'}</div>
                    <div className="text-slate-400"><span className="text-slate-300 mr-3">14</span>{'  return data.json();'}</div>
                </div>
                <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg font-sans">
                    <p className="text-xs text-blue-700">
                        <span className="font-semibold">@senior_dev</span>{' '}
                        <span className="text-blue-500">Nice catch — consider adding exponential backoff for production.</span>
                    </p>
                </div>
            </div>
        ),
    },
];

export default function BentoGrid() {
    return (
        <section className="py-20 md:py-28 bg-slate-50/60">
            <div className="container px-6 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-16"
                >
                    <p className="text-sm font-medium text-indigo-600 mb-3">Why the Guild</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-slate-900">
                        Not your average coding platform
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className={`${feature.span} bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:shadow-slate-100 transition-shadow duration-200`}
                        >
                            <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{feature.description}</p>
                            {feature.visual}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
