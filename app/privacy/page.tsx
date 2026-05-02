import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Adventurers Guild',
  description:
    'Learn how Adventurers Guild collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-20">
      <div className="container max-w-5xl mx-auto px-6">

        {/* Back */}
        <div className="mb-10">
          <Link
            href="/home"
            className="text-sm text-slate-500 hover:text-orange-400 transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-slate max-w-none space-y-10 text-slate-300 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information when you register, create a profile,
              participate in Quests, or communicate on the platform.
            </p>
            <p>
              This includes personal identifiers such as name, email,
              username, profile image, and professional details.
            </p>
            <p>
              We also collect technical data including IP address, device,
              browser type, and interaction logs.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. How We Use Data
            </h2>
            <p>
              Data is used to provide services, match users with Quests,
              and improve user experience.
            </p>
            <p>
              We also use data for analytics, fraud prevention, and
              platform optimization.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Public Profile
            </h2>
            <p>
              Some information is publicly visible including name,
              rank, XP, and completed Quests.
            </p>
            <p>
              Sensitive data like email and passwords remain private.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Sharing
            </h2>
            <p>
              We do not sell personal data.
            </p>
            <p>
              We share limited data with trusted services (hosting,
              analytics, authentication).
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Security
            </h2>
            <p>
              We use encryption, secure authentication, and monitoring.
            </p>
            <p>
              No system is 100% secure.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Cookies
            </h2>
            <p>
              Cookies help maintain sessions and improve performance.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Retention
            </h2>
            <p>
              Data is stored as long as necessary for service and legal compliance.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Rights
            </h2>
            <p>
              You can request access, correction, or deletion of your data.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Children
            </h2>
            <p>
              Not intended for users under 13.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Changes
            </h2>
            <p>
              Policy may change over time.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              11. Contact
            </h2>
            <p>
              Contact{' '}
              <span className="text-orange-400">
                privacy@adventurersguild.space
              </span>
            </p>
          </section>

        </div>

        {/* FAQ */}
        <section className="mt-24 border-t border-slate-800 pt-16">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">
              Privacy FAQ
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Common questions about your data.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              { q: 'Is email public?', a: 'No.' },
              { q: 'Sell data?', a: 'Never.' },
              { q: 'Delete account?', a: 'Yes.' },
              { q: 'Passwords safe?', a: 'Yes.' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {item.q}
                </h3>
                <p className="text-slate-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}