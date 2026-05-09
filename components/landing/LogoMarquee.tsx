'use client';

const tech = [
  'Next.js 15',
  'TypeScript',
  'Prisma ORM',
  'Neon Postgres',
  'NextAuth.js',
  'Tailwind CSS',
  'Framer Motion',
  'shadcn/ui',
  'Vercel',
  'Stripe',
  'Razorpay',
  'GitHub Actions',
];

export default function LogoMarquee() {
  return (
    <section className="border-t border-slate-200 bg-white py-10">
      <div className="container mx-auto max-w-5xl px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
          Built with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {tech.map((t) => (
            <span key={t} className="text-xs font-medium text-slate-500">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
