'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Target, Code2, Rocket, Users, Star } from 'lucide-react';

const features = [
    {
        title: "Real World Quests",
        description: "Work on actual tickets from partner companies. Fix bugs, build features, and ship code that matters.",
        icon: <Target className="w-6 h-6 text-blue-400" />,
        className: "md:col-span-2",
        gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
        title: "Rank Up System",
        description: "Progress from F-Rank to S-Rank. Unlock exclusive quests and higher pay rates.",
        icon: <Trophy className="w-6 h-6 text-yellow-400" />,
        className: "md:col-span-1",
        gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
        title: "Earn While Learning",
        description: "Get paid for every completed quest. Build your portfolio and your bank account.",
        icon: <Zap className="w-6 h-6 text-purple-400" />,
        className: "md:col-span-1",
        gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
        title: "Mentorship",
        description: "Get code reviews and guidance from senior engineers at top tech companies.",
        icon: <Users className="w-6 h-6 text-green-400" />,
        className: "md:col-span-2",
        gradient: "from-green-500/20 to-emerald-500/20"
    },
];

export default function BentoGrid() {
    return (
        <section className="py-24 relative z-10">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Join the Guild?</h2>
                    <p className="text-muted-foreground text-lg">
                        More than just a freelance platform. It's a career accelerator.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 ${feature.className}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="absolute inset-0 bg-noise opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
