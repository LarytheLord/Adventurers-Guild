'use client';

import { useEffect, useRef, useState } from 'react';

const companies = [
  { name: 'Stripe', symbol: 'S' },
  { name: 'Vercel', symbol: 'V' },
  { name: 'Linear', symbol: 'L' },
  { name: 'Supabase', symbol: 'S' },
  { name: 'Railway', symbol: 'R' },
  { name: 'Cal.com', symbol: 'C' },
  { name: 'Figma', symbol: 'F' },
  { name: 'Notion', symbol: 'N' },
];

export default function SocialProof() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    let animationId: number;

    function animate() {
      if (!scrollEl || isPaused) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      scrollEl.scrollLeft += 0.5;
      if (scrollEl.scrollLeft >= scrollEl.scrollWidth / 2) {
        scrollEl.scrollLeft = 0;
      }
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const items = [...companies, ...companies];

  return (
    <section className="border-t border-slate-800/60 bg-slate-900/50 py-12">
      <div className="mx-auto mb-6 max-w-6xl px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-600">
          Trusted by developers building for
        </p>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex overflow-x-hidden scrollbar-none"
      >
        <div className="flex items-center gap-8 px-8">
          {items.map((company, i) => (
            <div
              key={`${company.name}-${i}`}
              className="flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-800/60 bg-slate-900/80 px-4 py-2.5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-slate-300">
                {company.symbol}
              </div>
              <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
