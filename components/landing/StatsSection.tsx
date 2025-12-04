'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function Counter({ value, label, prefix = "", suffix = "" }: { value: number, label: string, prefix?: string, suffix?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isInView) {
            const duration = 2000; // 2 seconds
            const steps = 60;
            const stepTime = duration / steps;
            const increment = value / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current));
                }
            }, stepTime);

            return () => clearInterval(timer);
        }
        return undefined;
    }, [isInView, value]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
        </div>
    );
}

export default function StatsSection() {
    return (
        <section className="py-24 relative z-10 border-t border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
                    <Counter value={500} label="Active Adventurers" suffix="+" />
                    <Counter value={50} label="Paid to Students" prefix="$" suffix="k+" />
                    <Counter value={120} label="Quests Completed" suffix="+" />
                    <Counter value={15} label="Partner Companies" />
                </div>
            </div>
        </section>
    );
}
