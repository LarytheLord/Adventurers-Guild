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

        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm">Last updated: March 2026</p>
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
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly when creating an account,
              completing your Guild profile, applying for Quests, or communicating
              with other users.
            </p>
            <p>
              This may include your name, email address, username, password hash,
              profile image, role, skills, portfolio links, social profiles,
              Quest history, reviews, XP, rank, badges, and payment-related details.
            </p>
            <p>
              We may also collect technical information such as browser type,
              device type, IP address, login timestamps, pages visited, referral
              sources, and general usage patterns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to operate, maintain, and improve Adventurers
              Guild. This includes creating your account, matching you with relevant
              Quests, displaying your Guild Card, calculating XP and ranks, processing
              payments, and sending account-related notifications.
            </p>
            <p>
              We may also use your information to monitor platform health, prevent
              fraud, improve security, personalize your experience, and analyze how
              users interact with the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. Public Profile Information
            </h2>
            <p>
              Certain information on your Guild profile may be publicly visible to
              other users, companies, recruiters, and visitors.
            </p>
            <p>
              Public information may include your display name, profile image,
              rank, XP, completed Quests, badges, skills, reviews, and portfolio
              links.
            </p>
            <p>
              Sensitive information such as your email address, password,
              payment details, and private messages is never shown publicly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Information Sharing
            </h2>
            <p>
              We do not sell your personal information to advertisers or third
              parties.
            </p>
            <p>
              We may share limited information with trusted service providers who
              help us operate the platform, including hosting providers, analytics
              services, payment processors, authentication providers, and customer
              support tools.
            </p>
            <p>
              We may also disclose information if required by law, court order,
              legal process, or to protect the rights, safety, and security of
              Adventurers Guild and its users.
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
              5. Data Storage and Security
            </h2>
            <p>
              Your information is stored securely using modern cloud infrastructure,
              including Neon PostgreSQL databases hosted on AWS services.
            </p>
            <p>
              We use industry-standard protections such as encrypted connections
              (TLS), hashed passwords, secure authentication tokens, access controls,
              and internal monitoring systems.
            </p>
            <p>
              While we work hard to protect your information, no online service can
              guarantee absolute security.
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
              6. Cookies and Session Data
            </h2>
            <p>
              We use cookies and similar technologies to keep you signed in,
              remember preferences, improve performance, and understand platform
              usage.
            </p>
            <p>
              Authentication cookies are generally HTTP-only and secure. You can
              disable or clear cookies through your browser settings, although some
              features of the platform may stop working properly.
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
              7. Data Retention
            </h2>
            <p>
              We retain your information for as long as your account remains active
              or as needed to provide services, comply with legal obligations,
              resolve disputes, and enforce our agreements.
            </p>
            <p>
              Certain information, such as Quest records, payment history, or
              moderation logs, may be retained for a limited period even after an
              account is deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain your data as long as necessary to provide services and
              comply with legal obligations.
              8. Your Rights and Choices
            </h2>
            <p>
              You may request access to the personal information we hold about you,
              update inaccurate details, download your data, or request account
              deletion.
            </p>
            <p>
              You may also manage profile visibility, notification preferences,
              marketing emails, and certain privacy settings directly through your
              account.
            </p>
            <p>
              Requests related to privacy or account deletion are generally processed
              within 30 days.
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
              9. Children's Privacy
            </h2>
            <p>
              Adventurers Guild is not intended for children under the age of 13.
              We do not knowingly collect personal information from children.
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
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Continued use of
              the platform after changes become effective means you accept the
              revised policy.
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
              For privacy questions, data access requests, or account deletion
              requests, contact us at{' '}
              <span className="text-orange-400">
                privacy@adventurersguild.space
              </span>
              .
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
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Common questions about how your data is collected, used, stored,
              and protected.
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is my email address public?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                No. Your email address is kept private and is never displayed on
                your public Guild profile.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What information is visible on my Guild Card?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Your display name, profile image, rank, XP, skills, completed
                Quests, badges, and reviews may be publicly visible.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Do you sell my personal data?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                No. Adventurers Guild does not sell personal data to advertisers,
                recruiters, or third parties.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I delete my account?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Yes. You can request account deletion at any time by contacting
                our privacy team.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                How are passwords protected?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Passwords are stored as secure hashes and are never stored in
                plain text.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I download my data?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Yes. You can request a copy of your personal data, profile
                information, and Quest history.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
}

