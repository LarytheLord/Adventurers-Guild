import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { CategoryQuestsClient } from './client';
import type { Metadata } from 'next';

const categoryMeta: Record<string, { label: string; description: string; color: string }> = {
  frontend: {
    label: 'Frontend',
    description: 'Build UIs with React, Vue, Angular, and modern CSS. Create responsive, accessible interfaces that users love.',
    color: 'from-sky-500/20 to-blue-600/5',
  },
  backend: {
    label: 'Backend',
    description: 'Design APIs, databases, and server logic. Work with Node.js, Python, Go, Rust, and more.',
    color: 'from-emerald-500/20 to-green-600/5',
  },
  fullstack: {
    label: 'Full Stack',
    description: 'Own the entire stack — from database schema to polished UI. End-to-end feature development.',
    color: 'from-violet-500/20 to-purple-600/5',
  },
  mobile: {
    label: 'Mobile',
    description: 'Build native and cross-platform apps with React Native, Flutter, Swift, or Kotlin.',
    color: 'from-rose-500/20 to-pink-600/5',
  },
  ai_ml: {
    label: 'AI/ML',
    description: 'Train models, build RAG pipelines, deploy LLM apps. ML engineering and data science tasks.',
    color: 'from-orange-500/20 to-amber-600/5',
  },
  devops: {
    label: 'DevOps',
    description: 'Automate infrastructure, set up CI/CD, manage Kubernetes, and optimize cloud deployments.',
    color: 'from-cyan-500/20 to-teal-600/5',
  },
  security: {
    label: 'Security',
    description: 'Pen-test, audit code, implement auth, and build secure systems from the ground up.',
    color: 'from-red-500/20 to-rose-600/5',
  },
  qa: {
    label: 'QA',
    description: 'Write tests, automate E2E suites, perform regression testing, and ensure production quality.',
    color: 'from-yellow-500/20 to-orange-600/5',
  },
  design: {
    label: 'Design',
    description: 'Create UI/UX mockups, design systems, prototypes, and production-grade visual assets.',
    color: 'from-pink-500/20 to-fuchsia-600/5',
  },
  data_science: {
    label: 'Data Science',
    description: 'Analyze data, build dashboards, create models, and extract actionable insights.',
    color: 'from-indigo-500/20 to-blue-600/5',
  },
};

const slugToDb = (slug: string): string =>
  slug === 'ai-ml' ? 'ai_ml' : slug;

const dbToSlug = (category: string): string =>
  category === 'ai_ml' ? 'ai-ml' : category;

export async function generateStaticParams() {
  const categories = await prisma.quest.findMany({
    where: { track: 'OPEN' },
    select: { questCategory: true },
    distinct: ['questCategory'],
  });
  return categories.map((c) => ({ slug: dbToSlug(c.questCategory) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const dbSlug = slugToDb(slug);
  const meta = categoryMeta[dbSlug];

  if (!meta) {
    return { title: 'All Quests — Adventurers Guild' };
  }

  return {
    title: `${meta.label} Quests — Adventurers Guild`,
    description: `Browse open ${meta.label.toLowerCase()} quests for developers. Earn XP, climb ranks, get paid. Join the guild today.`,
  };
}

export default async function CategoryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const dbSlug = slugToDb(slug);
  const meta = categoryMeta[dbSlug];

  if (!meta) {
    redirect('/quests');
  }

  const count = await prisma.quest.count({
    where: { questCategory: dbSlug as any, status: 'available', track: 'OPEN' },
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/60 pt-24 pb-16 md:pt-32 md:pb-20">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${meta.color.includes('sky') ? 'rgba(14,165,233,0.06)' : 'rgba(99,102,241,0.06)'}, transparent)`,
          }}
        />

        <div className="relative container mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium bg-gradient-to-r ${meta.color} border-slate-700/30 text-slate-300`}>
              {count} open {meta.label.toLowerCase()} quest{count !== 1 ? 's' : ''}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              {meta.label}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Quests
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-500">
              {meta.description}
            </p>
          </div>
        </div>
      </section>

      {/* Quest grid — client-rendered */}
      <CategoryQuestsClient slug={dbSlug} label={meta.label} />
    </div>
  );
}
