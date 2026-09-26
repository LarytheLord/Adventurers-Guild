import type { Metadata } from 'next';
import BusinessLanding from '@/components/landing/BusinessLanding';

export const metadata: Metadata = {
  title: 'Guild for Business — your bottleneck, fixed for a fixed price',
  description:
    'Guild scopes your operational bottleneck, builds it with an AI-augmented team under one accountable senior owner, and hands you a working system you own. Fixed price, money-back if it misses the brief. Book a free AI audit.',
};

export default function BusinessPage() {
  return <BusinessLanding />;
}
