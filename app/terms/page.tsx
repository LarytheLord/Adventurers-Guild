import Link from 'next/link';

export const metadata = { title: 'Terms of Service — Adventurers Guild' };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-20">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="mb-10">
          <Link href="/home" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
            ← Back to home
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: March 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Adventurers Guild platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Platform Description</h2>
            <p>Adventurers Guild is a marketplace connecting developers (Adventurers) with companies (Clients) that have software development tasks (Quests). We provide the platform and tooling; we are not a party to the contracts formed between Adventurers and Clients.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information when registering and keep it up to date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Quests and Work</h2>
            <p>Companies are responsible for clearly defining Quest requirements. Adventurers are responsible for delivering work that meets those requirements. Payment disputes between parties must be resolved between those parties; Adventurers Guild facilitates but does not guarantee payment.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. XP and Rankings</h2>
            <p>XP, ranks, and skill points are platform metrics only. They do not constitute monetary value and cannot be redeemed for cash or transferred between accounts.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Prohibited Conduct</h2>
            <p>You agree not to use the platform for any unlawful purpose, to impersonate other users, to submit fraudulent work, or to attempt to manipulate the ranking or XP systems.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact</h2>
            <p>For questions about these terms, contact us at <span className="text-orange-400">legal@adventurersguild.space</span>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
