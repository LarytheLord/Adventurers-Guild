'use client';

import { InfiniteSlider } from '@/components/ui/infinite-slider';

const partners = [
  { name: 'Next.js', src: 'https://svgl.app/library/nextjs_icon_dark.svg' },
  { name: 'Vercel', src: 'https://svgl.app/library/vercel_wordmark.svg' },
  { name: 'Neon', src: 'https://svgl.app/library/neon.svg' },
  { name: 'TypeScript', src: 'https://svgl.app/library/typescript.svg' },
  { name: 'Prisma', src: 'https://svgl.app/library/prisma.svg' },
  { name: 'Tailwind CSS', src: 'https://svgl.app/library/tailwindcss.svg' },
  { name: 'GitHub', src: 'https://svgl.app/library/github-dark.svg' },
  { name: 'Stripe', src: 'https://svgl.app/library/stripe.svg' },
  { name: 'Framer Motion', src: 'https://svgl.app/library/framer.svg' },
  { name: 'Radix UI', src: 'https://svgl.app/library/radix-ui.svg' },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-slate-200 bg-white py-6">
      <div className="relative mx-auto max-w-6xl">
        {/* Left fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

        <InfiniteSlider gap={56} speed={40} speedOnHover={15}>
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex shrink-0 items-center gap-2.5"
            >
              <img
                src={p.src}
                alt={p.name}
                className="h-5 w-5 object-contain"
                loading="lazy"
              />
              <span className="whitespace-nowrap text-[13px] font-medium text-slate-500">
                {p.name}
              </span>
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </section>
  );
}
