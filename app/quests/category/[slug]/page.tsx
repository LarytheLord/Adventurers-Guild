'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { PublicQuest } from '@/components/quest/PublicQuestCard';
import { PublicQuestGrid } from '@/components/quest/PublicQuestGrid';
import { Button } from '@/components/ui/button';

const SLUG_TO_CATEGORY: Record<string, { db: string; label: string; description: string }> = {
  frontend: { db: 'frontend', label: 'Frontend', description: 'UI components, responsive layouts, design systems, and browser APIs.' },
  backend: { db: 'backend', label: 'Backend', description: 'APIs, databases, server logic, authentication, and microservices.' },
  'full-stack': { db: 'fullstack', label: 'Full Stack', description: 'End-to-end features spanning frontend, backend, and DevOps.' },
  mobile: { db: 'mobile', label: 'Mobile', description: 'iOS, Android, React Native, and cross-platform mobile development.' },
  'ai-ml': { db: 'ai_ml', label: 'AI / ML', description: 'Machine learning models, NLP, computer vision, and AI integrations.' },
  devops: { db: 'devops', label: 'DevOps', description: 'CI/CD pipelines, cloud infrastructure, containerisation, and monitoring.' },
  security: { db: 'security', label: 'Security', description: 'Penetration testing, vulnerability fixes, auth, and secure coding.' },
  qa: { db: 'qa', label: 'QA', description: 'Test automation, unit tests, integration tests, and quality processes.' },
  design: { db: 'design', label: 'Design', description: 'UI/UX design, prototyping, design systems, and accessibility.' },
  'data-science': { db: 'data_science', label: 'Data Science', description: 'Data analysis, visualisation, ETL pipelines, and statistical modelling.' },
};

export default function QuestCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [quests, setQuests] = useState<PublicQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const categoryInfo = slug ? SLUG_TO_CATEGORY[slug] : null;

  useEffect(() => {
    if (!slug || !categoryInfo) return;

    document.title = `${categoryInfo.label} Quests — Adventurers Guild`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', `Browse open ${categoryInfo.label.toLowerCase()} quests for developers. Earn XP, climb ranks, get paid. Join the guild today.`);

    const fetchQuests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/public/quests?limit=60&category=${categoryInfo.db}`);
        if (!res.ok) throw new Error('Failed to load quests');
        const data = await res.json();
        setQuests(data.quests ?? []);
        setCount(data.quests?.length ?? 0);
      } catch {
        setError('Something went wrong loading quests.');
      } finally {
        setLoading(false);
      }
    };
    void fetchQuests();
  }, [slug, categoryInfo]);

  if (!slug || !categoryInfo) {
    router.replace('/quests');
    return null;
  }

  const title = `${categoryInfo.label} Quests`;

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto max-w-6xl px-6 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/quests" className="hover:text-slate-300 transition-colors">Quests</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-400">{categoryInfo.label}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="container mx-auto max-w-6xl px-6 py-12">
          <Button
            variant="ghost"
            className="mb-4 h-auto p-0 text-xs text-slate-500 hover:text-slate-300"
            asChild
          >
            <Link href="/quests">
              <ArrowLeft className="mr-1 h-3 w-3" />
              All Quests
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            {categoryInfo.description}
          </p>
          {!loading && (
            <p className="mt-2 text-xs text-slate-500">
              {count} open {count === 1 ? 'quest' : 'quests'} available
            </p>
          )}
        </div>
      </div>

      {/* Quest grid */}
      <div className="container mx-auto max-w-6xl px-6 py-10">
        <PublicQuestGrid
          quests={quests}
          loading={loading}
          error={error}
          onRetry={() => window.location.reload()}
          emptyMessage={`No ${categoryInfo.label.toLowerCase()} quests right now`}
          emptyAction={
            <Button asChild variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800 bg-transparent">
              <Link href="/quests">Browse All Quests</Link>
            </Button>
          }
        />
      </div>
    </main>
  );
}
