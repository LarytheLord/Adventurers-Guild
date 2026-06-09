'use client';

import { InfiniteSlider } from '@/components/ui/infinite-slider';

const partners = [
  { name: 'GssOC', src: '/partners/gssoc.png' },
  { name: 'Nsoc', src: '/partners/nsoc.png' },
  { name: 'OpenPaws', src: '/partners/openpaws.png' },
  { name: 'AiGrants', src: '/partners/aigrants.png' },
  { name: 'BharatCode', src: 'https://bharatcode.ai/brand/refresh-v5/bharatcode-mark.svg' },
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
