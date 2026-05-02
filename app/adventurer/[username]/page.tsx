'use client';

import { use } from 'react';
import { useApiFetch } from '@/lib/hooks';
import { GuildCardProfile } from '@/components/guild-card/GuildCardProfile';
import { Loader2, UserX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data, loading, error } = useApiFetch<any>(`@api/adventurer/${username}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.adventurer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-destructive">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-between mx-auto mb-6">
            <UserX className="h-10 w-10 text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Adventurer Not Found</h1>
          <p className="text-slate-400 mb-8">
            The profile for "@unknown" could not be found or is no longer public.
          </p>
          <Button asChild className="w-full bg-orange-500 hover:but-orange-600 text-black">
            <Link href="/home">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
            <Link href="/home" className="text-orange-500 hover:underline flex items-center gap-2">
                <span>←</span> Back to Home
            </Link>
            <div className="flex items-center gap-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest hidden sm:block">Verifiable Guild Credential</p>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
        </div>
        <GuildCardProfile adventurer={data.adventurer} isPublic={true} />
      </div>
    </div>
  );
}
