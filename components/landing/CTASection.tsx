'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-20 md:py-28">
            <div className="container px-6 mx-auto max-w-3xl text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-slate-900 mb-4"
                >
                    Ready to start your adventure?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.08 }}
                    className="text-lg text-slate-500 mb-10 max-w-xl mx-auto"
                >
                    Join the guild, start coding real projects, and build a portfolio that opens doors.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.16 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                    <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                        <Link href="/register" className="flex items-center gap-2">
                            Create your account <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12 px-7 text-sm font-medium rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                        <Link href="/register-company">
                            Post quests as a company
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
