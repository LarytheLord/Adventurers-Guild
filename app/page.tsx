import type { Metadata } from 'next';
import AssuranceHome from '@/components/landing/AssuranceHome';
import HomeRedirect from '@/components/landing/HomeRedirect';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/lib/home/content';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.guilds.work'),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: '/',
    siteName: 'Guild',
    type: 'website',
  },
  twitter: { card: 'summary', title: HOME_TITLE, description: HOME_DESCRIPTION },
};

export default function HomePage() {
  return (
    <>
      <HomeRedirect />
      <AssuranceHome />
    </>
  );
}
