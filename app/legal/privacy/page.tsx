import { FileText, Lock, Mail, Server } from 'lucide-react';
import {
  InfoPageAside,
  InfoPageProse,
  InfoPageShell,
} from '@/components/public/info-page-shell';

export const metadata = {
  title: 'Privacy Policy | Guild',
  description: 'Privacy policy for Guild platform',
};

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal Privacy"
      title="The detailed privacy reference for the Guild platform."
      description="This version covers the operational detail behind account data, platform usage, payment handling, and regional privacy expectations."
      updatedAt="May 4, 2026"
      aside={
        <>
          <InfoPageAside title="Key Areas">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-4 w-4 text-orange-500" />
              <p>Account, profile, payment, and usage data are handled differently depending on purpose.</p>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="mt-1 h-4 w-4 text-orange-500" />
              <p>Passwords are hashed and session data is protected through secure auth flows.</p>
            </div>
            <div className="flex items-start gap-3">
              <Server className="mt-1 h-4 w-4 text-orange-500" />
              <p>Infrastructure providers help run the platform but are not allowed to repurpose your data.</p>
            </div>
          </InfoPageAside>
          <InfoPageAside title="Contact">
            <div className="inline-flex items-center gap-2 text-slate-900">
              <Mail className="h-4 w-4 text-orange-500" />
              admin@adventurersguild.com
            </div>
            <p>Use this channel for formal privacy questions tied to your account or platform data.</p>
          </InfoPageAside>
        </>
      }
    >
      <InfoPageProse>
        <p>Last updated: May 4, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <h3>1.1 Account Information</h3>
          <ul>
            <li>Name, email address, password (hashed)</li>
            <li>Role (Adventurer, Company, Admin)</li>
            <li>Profile information (bio, location, GitHub and LinkedIn URLs)</li>
          </ul>
          <h3>1.2 Adventurer Profile</h3>
          <ul>
            <li>Skills, specialization, availability status</li>
            <li>XP, rank, skill points, completion rates</li>
            <li>Quest history and performance metrics</li>
          </ul>
          <h3>1.3 Company Profile</h3>
          <ul>
            <li>Company name, website, industry, size</li>
            <li>Quest posting history and spending</li>
          </ul>
          <h3>1.4 Payment Information</h3>
          <ul>
            <li>Razorpay contact and fund account IDs (bank account details are stored by Razorpay, not us)</li>
            <li>Transaction history and payment status</li>
          </ul>
          <h3>1.5 Usage Data</h3>
          <ul>
            <li>IP address, browser type, device information</li>
            <li>Pages visited, features used, time spent</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>Provide and maintain the platform</li>
            <li>Match Adventurers with suitable quests</li>
            <li>Process payments and send notifications</li>
            <li>Calculate XP, rank, and leaderboards</li>
            <li>Detect fraud and ensure platform security</li>
            <li>Send transactional emails (not marketing unless opted in)</li>
            <li>Improve our services through analytics</li>
          </ul>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>We share information only as necessary to operate the platform:</p>
          <ul>
            <li><strong>Between Users:</strong> Companies see Adventurer profiles when reviewing applications</li>
            <li><strong>Payment Processors:</strong> Razorpay receives necessary payment and bank details</li>
            <li><strong>Service Providers:</strong> Neon (database), Vercel (hosting), SMTP provider (email)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures:</p>
          <ul>
            <li>Passwords are hashed using bcrypt (12 rounds)</li>
            <li>JWT tokens for session management (30-day expiry)</li>
            <li>HTTPS encryption for all data transmission</li>
            <li>Database hosted on Neon (SOC 2 compliant)</li>
            <li>Regular security updates and monitoring</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Object to or restrict processing</li>
          </ul>
          <p>To exercise these rights, contact us at <strong>admin@adventurersguild.com</strong>.</p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>We retain your information while your account is active. Upon account deletion:</p>
          <ul>
            <li>Personal identifiers are removed or anonymized</li>
            <li>Transaction records are retained for 7 years (legal compliance)</li>
            <li>Quest completion history may be retained for platform statistics</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We use essential cookies for authentication (NextAuth session). We may use analytics
            cookies if configured. You can control cookies through browser settings.
          </p>
        </section>

        <section>
          <h2>8. Children&apos;s Privacy</h2>
          <p>
            The platform is not intended for users under 16. We do not knowingly collect data
            from children. If we become aware of such data, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2>9. International Users</h2>
          <p>
            The platform is operated from India. If you access from other regions, your data may
            be transferred to and processed in India, which may have different privacy laws.
          </p>
        </section>

        <section>
          <h2>10. Changes to Privacy Policy</h2>
          <p>
            We may update this Privacy Policy. We will notify users of material changes via email
            or platform notification. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            For privacy-related questions or to exercise your rights:
            <br />
            <strong>Email:</strong> admin@adventurersguild.com
            <br />
            <strong>Address:</strong> Guild, Gandhinagar, Gujarat, India
          </p>
        </section>
      </InfoPageProse>
    </InfoPageShell>
  );
}
