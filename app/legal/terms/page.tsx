import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Guild',
  description: 'Terms and conditions for using Guild platform',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: May 4, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Guild (the &ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service
              (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Guild is a gamified developer marketplace connecting Adventurers (developers) with Companies
              (clients) for coding projects called &ldquo;Quests.&rdquo; The Platform facilitates project posting, application,
              completion, and payment processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium mb-2">3.1 Registration</h3>
            <p>
              You must register for an account to use the Platform. You agree to provide accurate, current, and complete
              information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            <h3 className="text-xl font-medium mb-2">3.2 Account Types</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Adventurer:</strong> Developers who complete Quests and earn XP, rank, and payment</li>
              <li><strong>Company:</strong> Clients who post Quests and pay for completed work</li>
              <li><strong>Admin:</strong> Platform administrators managing users and Quests</li>
            </ul>
            <h3 className="text-xl font-medium mb-2">3.3 Account Security</h3>
            <p>
              You are responsible for safeguarding your password and for all activity that occurs under your account.
              Notify us immediately at {process.env.NEXT_PUBLIC_APP_URL || 'admin@adventurersguild.com'} of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Quest System</h2>
            <h3 className="text-xl font-medium mb-2">4.1 Posting Quests</h3>
            <p>
              Companies may post Quests describing work to be completed. Quests must include clear requirements,
              deliverables, deadlines, and reward amounts.
            </p>
            <h3 className="text-xl font-medium mb-2">4.2 Accepting Quests</h3>
            <p>
              Adventurers may apply for or be assigned to Quests based on their rank, skills, and availability.
              Multi-participant Quests may have multiple Adventurers assigned.
            </p>
            <h3 className="text-xl font-medium mb-2">4.3 Quest Completion</h3>
            <p>
              Adventurers submit completed work for Company review. Companies may approve, request rework, or reject
              submissions. Approval triggers XP awards and payment processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Payments</h2>
            <h3 className="text-xl font-medium mb-2">5.1 Platform Fee</h3>
            <p>
              Guild charges a 15% platform fee on all completed Quest payments. The fee is automatically
              deducted before payout to Adventurers.
            </p>
            <h3 className="text-xl font-medium mb-2">5.2 Payment Processing</h3>
            <p>
              Payments are processed through Razorpay. Companies pay upon Quest posting or approval.
              Adventurers receive payouts to linked bank accounts after Quest approval.
            </p>
            <h3 className="text-xl font-medium mb-2">5.3 Refunds</h3>
            <p>
              Refund requests must be submitted within 7 days of payment. Refunds are evaluated on a case-by-case
              basis and may be issued for incomplete or substandard work.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Ranking and XP System</h2>
            <p>
              Adventurers earn Experience Points (XP) and Skill Points for completed Quests. XP determines rank
              (F → E → D → C → B → A → S), which affects Quest eligibility. Rankings are calculated automatically
              based on XP thresholds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Code of Conduct</h2>
            <p>Users agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide original work and respect intellectual property rights</li>
              <li>Communicate professionally and respectfully</li>
              <li>Meet deadlines and deliver quality work</li>
              <li>Not engage in fraudulent activity or misrepresentation</li>
              <li>Not share account credentials or allow others to use their account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
            <p>
              Upon Quest completion and payment, the Company receives ownership of the delivered code.
              Adventurers retain no rights to completed work unless otherwise agreed in writing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p>
              Guild is provided &ldquo;as is&rdquo; without warranties. We are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Disputes between Companies and Adventurers</li>
              <li>Quality or timeliness of delivered work</li>
              <li>Payment failures or processing delays</li>
              <li>Service interruptions or data loss</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p>
              We may suspend or terminate accounts for violations of these Terms. Users may delete their account
              at any time through account settings. Termination does not affect completed Quest obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Continued use of the Platform after changes constitutes
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
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
