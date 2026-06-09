import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-lg space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
            <Shield className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-2">403</h1>
          <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
          <p className="text-slate-400 text-lg">
            You don&apos;t have permission to access this resource. Your account role doesn&apos;t grant access to this area.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">Why am I seeing this?</span>
          </p>
          <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
            <li>Your account role doesn&apos;t allow access to this page</li>
            <li>You may need to switch accounts or request different permissions</li>
            <li>Contact support if you believe this is a mistake</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-900"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
