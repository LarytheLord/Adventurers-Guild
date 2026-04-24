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
        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly when creating an account,
              completing your profile, applying for Quests, or interacting with
              other users.
            </p>
            <p>
              This may include your name, email address, username, profile image,
              role, skills, portfolio links, social profiles, Quest activity,
              reviews, XP, rank, and badges.
            </p>
            <p>
              We also collect limited technical data such as device type, browser,
              IP address, and usage activity to improve platform performance and
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              Your information is used to operate and improve the platform,
              including account creation, Quest matching, profile display,
              rankings, and communication.
            </p>
            <p>
              We may also use data to enhance security, prevent fraud, analyze
              usage trends, and improve user experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Public Profile Information
            </h2>
            <p>
              Certain profile details may be visible to other users and companies.
            </p>
            <p>
              This includes your display name, profile image, rank, XP, skills,
              completed Quests, badges, and reviews.
            </p>
            <p>
              Private data such as your email, password, and payment details are
              never publicly displayed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Information Sharing
            </h2>
            <p>
              We do not sell your personal data.
            </p>
            <p>
              We may share information with trusted third-party service providers
              (such as hosting, analytics, authentication, or support tools) strictly
              to operate the platform.
            </p>
            <p>
              We may disclose information if required by law or to protect platform
              security and user safety.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Data Security
            </h2>
            <p>
              We use industry-standard measures such as encrypted connections (TLS),
              secure authentication systems, and access controls to protect your data.
            </p>
            <p>
              However, no system can guarantee complete security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Cookies
            </h2>
            <p>
              Cookies are used to maintain sessions, improve performance, and
              understand usage patterns.
            </p>
            <p>
              You can manage cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain your data as long as necessary to provide services and
              comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Your Rights
            </h2>
            <p>
              You may request access, correction, or deletion of your data.
            </p>
            <p>
              Requests are typically processed within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Children's Privacy
            </h2>
            <p>
              This platform is not intended for users under 13 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Changes
            </h2>
            <p>
              We may update this policy periodically. Continued use means you
              accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              11. Contact
            </h2>
            <p>
              For privacy-related requests, contact{' '}
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
              Quick answers about your data and privacy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                q: 'Is my email address public?',
                a: 'No. Your email is always private.',
              },
              {
                q: 'Do you sell my data?',
                a: 'No. We do not sell personal data.',
              },
              {
                q: 'Can I delete my account?',
                a: 'Yes. You can request deletion anytime.',
              },
              {
                q: 'Are passwords secure?',
                a: 'Passwords are stored using secure hashing.',
              },
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