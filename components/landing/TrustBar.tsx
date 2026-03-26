'use client';

import { motion } from 'framer-motion';

interface TrustBarProps {
  adventurers: number;
  openQuests: number;
  loading?: boolean;
}

const numberFormatter = new Intl.NumberFormat('en-US');

function formatValue(value: number, loading: boolean) {
  return loading ? '--' : numberFormatter.format(value);
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
      {children}
    </span>
  );
}

export default function TrustBar({ adventurers, openQuests, loading = false }: TrustBarProps) {
  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="container mx-auto max-w-6xl px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center"
        >
          <Item>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.55)]" />
            Open Source (MIT)
          </Item>
          <span className="hidden text-slate-600 sm:inline">/</span>
          <Item>Backed by Open Paws</Item>
          <span className="hidden text-slate-600 sm:inline">/</span>
          <Item>{formatValue(adventurers, loading)} Adventurers</Item>
          <span className="hidden text-slate-600 sm:inline">/</span>
          <Item>{formatValue(openQuests, loading)} Active Quests</Item>
        </motion.div>
      </div>
    </section>
  );
}
