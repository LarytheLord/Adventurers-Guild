'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-32 relative z-10 text-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container px-4 mx-auto max-w-4xl relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
                >
                    Ready to Start Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Adventure?</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
                >
                    The Guild is accepting new members. Claim your spot, start coding real projects, and level up your career today.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Button asChild size="lg" className="h-16 px-10 text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105">
                        <Link href="/register" className="flex items-center gap-2">
                            Create Your Account <ArrowRight className="w-5 h-5" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
