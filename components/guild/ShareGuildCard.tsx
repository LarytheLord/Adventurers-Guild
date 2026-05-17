'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export function ShareGuildCard({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/guild/${username}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/guild/${username}`}>
          <Share2 className="h-4 w-4 mr-1" />
          My Guild Card
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
        {copied ? 'Guild Card link copied!' : 'Copy link'}
      </Button>
    </div>
  );
}
