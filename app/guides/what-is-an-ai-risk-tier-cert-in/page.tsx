import type { Metadata } from 'next';
import { AnswerPageView } from '@/components/guides/answer-page';
import { ANSWER_PAGES } from '@/lib/answer-pages/content';
import { buildPageMetadata } from '@/lib/seo';

const PAGE = ANSWER_PAGES.find((p) => p.path === '/guides/what-is-an-ai-risk-tier-cert-in')!;

export const metadata: Metadata = buildPageMetadata({
  path: PAGE.path,
  title: `${PAGE.title} - Guild`,
  description: PAGE.description,
  type: 'article',
});

export default function Page() {
  return <AnswerPageView page={PAGE} />;
}
