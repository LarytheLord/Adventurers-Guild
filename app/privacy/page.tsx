import { Eye, Lock, Mail, Server } from 'lucide-react';
import {
  InfoPageAside,
  InfoPageProse,
  InfoPageShell,
} from '@/components/public/info-page-shell';

export const metadata = { title: 'Privacy Policy - Guild' };

export default function PrivacyPage() {
  return (
    <InfoPageShell
      eyebrow="Privacy"
      title="How Guild handles the information behind every quest, profile, and rank."
      description="This page explains what we collect, why we collect it, what can become public on the platform, and how we protect the parts that should stay private."
      updatedAt="March 2026"
      aside={
        <>
          <InfoPageAside title="At A Glance">
            <div className="flex items-start gap-3">
              <Eye className="mt-1 h-4 w-4 text-orange-500" />
              <p>Public profile details can include your display name, rank, XP, skills, badges, and quest history.</p>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="mt-1 h-4 w-4 text-orange-500" />
              <p>Email, passwords, payment details, and private messages are not shown publicly.</p>
            </div>
            <div className="flex items-start gap-3">
              <Server className="mt-1 h-4 w-4 text-orange-500" />
              <p>We use modern hosted infrastructure, encrypted transport, and role-based access controls.</p>
            </div>
          </InfoPageAside>
          <InfoPageAside title="Contact">
            <div className="inline-flex items-center gap-2 text-slate-900">
              <Mail className="h-4 w-4 text-orange-500" />
              privacy@adventurersguild.space
            </div>
            <p>For privacy requests, data access, or deletion questions, contact the team here.</p>
          </InfoPageAside>
        </>
      }
    >
      <InfoPageProse>
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly when creating an account, completing your
            Guild profile, applying for quests, or communicating with other users.
          </p>
          <p>
            This may include your name, email address, username, password hash, profile image,
            role, skills, portfolio links, social profiles, quest history, reviews, XP, rank,
            badges, and payment-related details.
          </p>
          <p>
            We may also collect technical information such as browser type, device type, IP
            address, login timestamps, pages visited, referral sources, and general usage
            patterns.
          </p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>
            We use your information to operate, maintain, and improve Adventurers Guild. This
            includes creating your account, matching you with relevant quests, displaying your
            Guild Card, calculating XP and ranks, processing payments, and sending
            account-related notifications.
          </p>
          <p>
            We may also use your information to monitor platform health, prevent fraud, improve
            security, personalize your experience, and analyze how users interact with the
            platform.
          </p>
        </section>

        <section>
          <h2>3. Public Profile Information</h2>
          <p>
            Certain information on your Guild profile may be publicly visible to other users,
            companies, recruiters, and visitors.
          </p>
          <p>
            Public information may include your display name, profile image, rank, XP, completed
            quests, badges, skills, reviews, and portfolio links.
          </p>
          <p>
            Sensitive information such as your email address, password, payment details, and
            private messages is never shown publicly.
          </p>
        </section>

        <section>
          <h2>4. Information Sharing</h2>
          <p>We do not sell your personal information to advertisers or third parties.</p>
          <p>
            We may share limited information with trusted service providers who help us operate
            the platform, including hosting providers, analytics services, payment processors,
            authentication providers, and customer support tools.
          </p>
          <p>
            We may also disclose information if required by law, court order, legal process, or
            to protect the rights, safety, and security of Guild and its users.
          </p>
        </section>

        <section>
          <h2>5. Data Storage and Security</h2>
          <p>
            Your information is stored securely using modern cloud infrastructure, including Neon
            PostgreSQL databases hosted on AWS services.
          </p>
          <p>
            We use industry-standard protections such as encrypted connections, hashed passwords,
            secure authentication tokens, access controls, and internal monitoring systems.
          </p>
          <p>
            While we work hard to protect your information, no online service can guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2>6. Cookies and Session Data</h2>
          <p>
            We use cookies and similar technologies to keep you signed in, remember preferences,
            improve performance, and understand platform usage.
          </p>
          <p>
            Authentication cookies are generally HTTP-only and secure. You can disable or clear
            cookies through your browser settings, although some features of the platform may stop
            working properly.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your information for as long as your account remains active or as needed to
            provide services, comply with legal obligations, resolve disputes, and enforce our
            agreements.
          </p>
          <p>
            Certain information, such as quest records, payment history, or moderation logs, may
            be retained for a limited period even after an account is deleted.
          </p>
        </section>

        <section>
          <h2>8. Your Rights and Choices</h2>
          <p>
            You may request access to the personal information we hold about you, update
            inaccurate details, download your data, or request account deletion.
          </p>
          <p>
            You may also manage profile visibility, notification preferences, marketing emails,
            and certain privacy settings directly through your account.
          </p>
          <p>Requests related to privacy or account deletion are generally processed within 30 days.</p>
        </section>

        <section>
          <h2>9. Children&apos;s Privacy</h2>
          <p>
            Guild is not intended for children under the age of 13. We do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Continued use of the platform
            after changes become effective means you accept the revised policy.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            For privacy questions, data access requests, or account deletion requests, contact us
            at <strong>privacy@adventurersguild.space</strong>.
          </p>
        </section>
      </InfoPageProse>
    </InfoPageShell>
  );
}
