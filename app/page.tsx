import type { Metadata } from 'next';
import AssuranceHome from '@/components/landing/AssuranceHome';
import HomeRedirect from '@/components/landing/HomeRedirect';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, organizationJsonLd } from '@/lib/seo';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/lib/home/content';

export const metadata: Metadata = buildPageMetadata({
  path: '/',
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <HomeRedirect />
      <AssuranceHome />
    </>
  );
}
