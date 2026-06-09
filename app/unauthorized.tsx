import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-lg space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">401</h1>
          <h2 className="text-2xl font-bold text-white mb-3">Unauthorized</h2>
          <p className="text-slate-400 text-lg">
            You need to be logged in to access this resource. Please sign in to your account.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">Next steps:</span>
          </p>
          <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
            <li>Sign in to your Guild account</li>
            <li>If you don&apos;t have an account, create one to get started</li>
            <li>Your session may have expired &mdash; try signing in again</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-900"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
