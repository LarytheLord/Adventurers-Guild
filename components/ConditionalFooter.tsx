'use client';

import { usePathname } from 'next/navigation';
import { Component as GuildFooter } from '@/components/ui/footer-taped-design';

const FOOTER_ROUTES = new Set([
  '/',
  '/business',
  '/login',
  '/register',
  '/quests',
  '/faq',
  '/privacy',
  '/terms',
]);

const FOOTER_ROUTE_PREFIXES = ['/legal'];

export default function ConditionalFooter() {
  const pathname = usePathname();

  const shouldShowFooter = pathname
    ? FOOTER_ROUTES.has(pathname) ||
      FOOTER_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;

  if (!shouldShowFooter) {
    return null;
  }

  return <GuildFooter />;
}
