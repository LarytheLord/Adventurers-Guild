import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — Adventurers Guild' };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-20">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="mb-10">
          <Link href="/home" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
            ← Back to home
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: March 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly: name, email address, password hash, role, and optional profile details. We also collect usage data (quest activity, XP earned, login timestamps) to operate the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to operate and improve the platform, to match Adventurers with Quests, to calculate rankings and XP, and to communicate important account information to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
            <p>We do not sell your personal data. Your profile information (name, rank, XP) is visible to other users as part of the platform experience. Your email address is never displayed publicly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage</h2>
            <p>Your data is stored in a Neon PostgreSQL database hosted on AWS infrastructure. We use industry-standard security practices including encrypted connections (TLS) and hashed passwords (bcrypt).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies and Sessions</h2>
            <p>We use HTTP-only session cookies for authentication. We do not use third-party tracking cookies. You can clear cookies at any time, which will log you out.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by contacting us. We will process such requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>For privacy questions or data requests, contact us at <span className="text-orange-400">privacy@adventurersguild.space</span>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
