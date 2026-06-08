import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryQuestsClient from './client';

const categoryMeta: Record<string, { title: string; description: string; dbValue: string }> = {
  'web-development': {
    title: 'Web Development Quests',
    description: 'Full-stack, frontend, and backend web development quests.',
    dbValue: 'web_development',
  },
  'mobile-development': {
    title: 'Mobile Development Quests',
    description: 'iOS, Android, and cross-platform mobile development quests.',
    dbValue: 'mobile_development',
  },
  'ai-ml': {
    title: 'AI & ML Quests',
    description: 'Machine learning, NLP, computer vision, and AI integration quests.',
    dbValue: 'ai_ml',
  },
  'devops': {
    title: 'DevOps & Infrastructure Quests',
    description: 'CI/CD, cloud infrastructure, Kubernetes, and SRE quests.',
    dbValue: 'devops',
  },
  'data-engineering': {
    title: 'Data Engineering Quests',
    description: 'Data pipelines, ETL, analytics engineering, and warehouse quests.',
    dbValue: 'data_engineering',
  },
  'security': {
    title: 'Security Quests',
    description: 'Penetration testing, code audits, and security hardening quests.',
    dbValue: 'security',
  },
  'blockchain': {
    title: 'Blockchain & Web3 Quests',
    description: 'Smart contracts, DeFi protocols, and Web3 integration quests.',
    dbValue: 'blockchain',
  },
  'open-source': {
    title: 'Open Source Quests',
    description: 'Contribute to real open source projects and build your public portfolio.',
    dbValue: 'open_source',
  },
  'design-systems': {
    title: 'Design Systems Quests',
    description: 'Component libraries, design tokens, and UI engineering quests.',
    dbValue: 'design_systems',
  },
  'api-integration': {
    title: 'API Integration Quests',
    description: 'Third-party API integrations, webhooks, and platform connectors.',
    dbValue: 'api_integration',
  },
};

export async function generateStaticParams() {
  return Object.keys(categoryMeta).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = categoryMeta[slug];
  if (!meta) return {};
  return {
    title: `${meta.title} — Adventurers Guild`,
    description: meta.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = categoryMeta[slug];
  if (!meta) notFound();

  return (
    <CategoryQuestsClient
      slug={slug}
      title={meta.title}
      description={meta.description}
      dbCategory={meta.dbValue}
    />
  );
}
