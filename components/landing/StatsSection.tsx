'use client';

import { useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function Counter({ value, label, prefix = "", suffix = "" }: {
    value: number;
    label: string;
    prefix?: string;
    suffix?: string;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isInView) {
            const duration = 1500;
            const steps = 40;
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
            <div className="text-3xl md:text-4xl font-bold text-slate-900 tabular-nums mb-1">
                {prefix}{count.toLocaleString()}{suffix}
            </div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
}

export default function StatsSection() {
    return (
        <section className="py-16 md:py-20 border-y border-slate-100 bg-slate-50/60">
            <div className="container px-6 mx-auto max-w-4xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <Counter value={500} label="Adventurers" suffix="+" />
                    <Counter value={50} label="Paid out" prefix="$" suffix="k+" />
                    <Counter value={120} label="Quests completed" suffix="+" />
                    <Counter value={15} label="Companies" />
                </div>
            </div>
        </section>
    );
}
