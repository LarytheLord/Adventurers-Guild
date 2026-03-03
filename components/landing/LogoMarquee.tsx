'use client';

const tags = [
  "Neon Postgres",
  "Next.js 15",
  "TypeScript",
  "Prisma ORM",
  "Stripe-ready payouts",
  "Quest-based workflows",
  "Human QA reviews",
  "Rank progression F to S",
];

export default function LogoMarquee() {
  return (
    <section className="overflow-hidden border-y border-slate-200 bg-slate-50 py-6">
      <div className="mx-auto mb-4 w-full max-w-6xl px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Built For Serious Delivery
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-slate-50 to-transparent" />

        <div className="animate-scroll flex items-center whitespace-nowrap">
          {tags.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              className="mx-2 select-none rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >
              {tag}
            </div>
          ))}
        </div>
        <div className="absolute top-0 animate-scroll flex items-center whitespace-nowrap" aria-hidden="true">
          {tags.map((tag, index) => (
            <div
              key={`${tag}-clone-${index}`}
              className="mx-2 select-none rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
