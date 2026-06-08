'use client';

import { useEffect, useRef, useState } from 'react';

interface Company {
  id: string;
  name: string;
}

export default function SocialProof() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/public/quests?limit=100');
        if (res.ok) {
          const data = await res.json();
          const quests = data.quests || [];
          // Extract unique companies from quests
          const companyMap = new Map<string, { id: string; name: string }>();
          quests.forEach((quest: any) => {
            if (quest.company?.name) {
              const key = quest.company.name.toLowerCase();
              if (!companyMap.has(key)) {
                companyMap.set(key, {
                  id: quest.company.id || key,
                  name: quest.company.name,
                });
              }
            }
          });
          setCompanies(Array.from(companyMap.values()));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

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
          Companies posting quests
        </p>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex overflow-x-hidden scrollbar-none"
      >
        <div className="flex items-center gap-8 px-8">
          {loading ? (
            <div className="text-xs text-slate-500">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="text-xs text-slate-500">No companies yet</div>
          ) : (
            items.map((company, i) => (
              <div
                key={`${company.id}-${i}`}
                className="flex shrink-0 items-center gap-2.5 rounded-xl border border-slate-800/60 bg-slate-900/80 px-4 py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-slate-300">
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <span className="whitespace-nowrap text-xs font-medium text-slate-400">
                  {company.name}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
