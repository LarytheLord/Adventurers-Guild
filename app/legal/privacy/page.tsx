import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Guild',
  description: 'Privacy policy for Guild platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: May 4, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-2">1.1 Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, password (hashed)</li>
              <li>Role (Adventurer, Company, Admin)</li>
              <li>Profile information (bio, location, GitHub/LinkedIn URLs)</li>
            </ul>
            <h3 className="text-xl font-medium mb-2">1.2 Adventurer Profile</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Skills, specialization, availability status</li>
              <li>XP, rank, skill points, completion rates</li>
              <li>Quest history and performance metrics</li>
            </ul>
            <h3 className="text-xl font-medium mb-2">1.3 Company Profile</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Company name, website, industry, size</li>
              <li>Quest posting history and spending</li>
            </ul>
            <h3 className="text-xl font-medium mb-2">1.4 Payment Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Razorpay contact and fund account IDs (bank account details are stored by Razorpay, not us)</li>
              <li>Transaction history and payment status</li>
            </ul>
            <h3 className="text-xl font-medium mb-2">1.5 Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address, browser type, device information</li>
              <li>Pages visited, features used, time spent</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the Platform</li>
              <li>Match Adventurers with suitable Quests</li>
              <li>Process payments and send notifications</li>
              <li>Calculate XP, rank, and leaderboards</li>
              <li>Detect fraud and ensure platform security</li>
              <li>Send transactional emails (not marketing unless opted in)</li>
              <li>Improve our services through analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p>We share information only as necessary to operate the Platform:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Between Users:</strong> Companies see Adventurer profiles when reviewing applications</li>
              <li><strong>Payment Processors:</strong> Razorpay receives necessary payment and bank details</li>
              <li><strong>Service Providers:</strong> Neon (database), Vercel (hosting), SMTP provider (email)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights/safety</li>
            </ul>
            <p>We do NOT sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Passwords are hashed using bcrypt (12 rounds)</li>
              <li>JWT tokens for session management (30-day expiry)</li>
              <li>HTTPS encryption for all data transmission</li>
              <li>Database hosted on Neon (SOC 2 compliant)</li>
              <li>Regular security updates and monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Object to or restrict processing</li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <a href="mailto:abid@guilds.work" className="text-orange-500 hover:text-orange-400">
                abid@guilds.work
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p>
              We retain your information while your account is active. Upon account deletion:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal identifiers are removed or anonymized</li>
              <li>Transaction records are retained for 7 years (legal compliance)</li>
              <li>Quest completion history may be retained for platform statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p>
              We use essential cookies for authentication (NextAuth session). We may use analytics cookies
              (Google Analytics) if configured. You can control cookies through browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
            <p>
              The Platform is not intended for users under 16. We do not knowingly collect data from children.
              If we become aware of such data, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Users</h2>
            <p>
              The Platform is operated from India. If you access from other regions, be aware that your data
              may be transferred to and processed in India, which may have different privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy. We will notify users of material changes via email or platform
              notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p>
              For privacy-related questions or to exercise your rights:
              <br />
              <strong>Email:</strong> admin@adventurersguild.com
              <br />
              <strong>Address:</strong> Guild, Gandhinagar, Gujarat, India
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
