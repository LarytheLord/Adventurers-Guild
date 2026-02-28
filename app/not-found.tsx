import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Code2, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white group-hover:bg-slate-800 transition-colors">
              <Code2 className="w-5 h-5" />
            </div>
            <span className="text-slate-900">Adventurers Guild</span>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Quest Not Found</h1>
          <p className="text-slate-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to a different realm.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-slate-900 hover:bg-slate-800">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
