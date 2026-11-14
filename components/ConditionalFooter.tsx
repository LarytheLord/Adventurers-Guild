'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const FOOTER_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/quests',
  '/faq',
  '/audit',
  '/audit/sample-report',
  '/checklist',
  '/guides',
  '/ai-risk-tier',
  '/launch-check',
  '/indic-ai-qa',
  '/dpdp-readiness',
  '/privacy',
  '/terms',
]);

const FOOTER_ROUTE_PREFIXES = ['/legal'];

// The footer is passed in as children so it stays a server-rendered tree and
// only this pathname check ships as client JS.
export default function ConditionalFooter({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const shouldShowFooter = pathname
    ? FOOTER_ROUTES.has(pathname) ||
      FOOTER_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    : false;

  if (!shouldShowFooter) {
    return null;
  }

  return <>{children}</>;
}
