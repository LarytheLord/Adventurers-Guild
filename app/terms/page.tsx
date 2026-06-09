import { Briefcase, Mail, Scale, Sword } from 'lucide-react';
import {
  InfoPageAside,
  InfoPageProse,
  InfoPageShell,
} from '@/components/public/info-page-shell';

export const metadata = { title: 'Terms of Service - Guild' };

export default function TermsPage() {
  return (
    <InfoPageShell
      eyebrow="Terms"
      title="The operating rules for companies, adventurers, quests, and reputation."
      description="These terms explain how Guild works as a marketplace, what users are responsible for, how quests and rewards are handled, and what conduct keeps the platform trustworthy."
      updatedAt="March 2026"
      aside={
        <>
          <InfoPageAside title="Core Principles">
            <div className="flex items-start gap-3">
              <Sword className="mt-1 h-4 w-4 text-orange-500" />
              <p>Adventurers are expected to submit original, complete, and reliable work.</p>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="mt-1 h-4 w-4 text-orange-500" />
              <p>Companies are responsible for defining clear scope, timelines, and rewards.</p>
            </div>
            <div className="flex items-start gap-3">
              <Scale className="mt-1 h-4 w-4 text-orange-500" />
              <p>Guild can restrict accounts that misuse rankings, submissions, or platform trust.</p>
            </div>
          </InfoPageAside>
          <InfoPageAside title="Legal Contact">
            <div className="inline-flex items-center gap-2 text-slate-900">
              <Mail className="h-4 w-4 text-orange-500" />
              legal@adventurersguild.space
            </div>
            <p>Use this address for legal questions, concerns about terms, or policy clarifications.</p>
          </InfoPageAside>
        </>
      }
    >
      <InfoPageProse>
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Guild platform, you agree to be bound by these Terms of
            Service. If you do not agree with these terms, you should not use the platform.
          </p>
        </section>

        <section>
          <h2>2. Platform Description</h2>
          <p>
            Guild is a platform that connects developers, designers, researchers, and other
            contributors with companies and organizations that need project work completed.
          </p>
          <p>
            We provide the infrastructure, quest system, ranking tools, public Guild Cards,
            communication features, and payment facilitation. However, Adventurers Guild is not a
            direct employer, contractor, or client in the agreements made between adventurers and
            companies.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password.
            You agree to provide accurate information during registration and keep your profile
            updated.
          </p>
          <p>
            You are also responsible for all activity that occurs under your account. Sharing
            accounts, impersonating others, or creating misleading profiles is prohibited.
          </p>
        </section>

        <section>
          <h2>4. Quests and Work</h2>
          <p>
            Companies are responsible for clearly defining quest requirements, deliverables,
            timelines, and rewards. Adventurers are responsible for submitting original, complete,
            and high-quality work.
          </p>
          <p>
            Failure to meet quest requirements, repeated missed deadlines, plagiarism, or
            fraudulent submissions may result in penalties, reduced visibility, suspension, or
            account termination.
          </p>
        </section>

        <section>
          <h2>5. Payments and Rewards</h2>
          <p>
            Some quests may provide monetary rewards, while others may provide XP, recognition,
            internship consideration, or portfolio experience.
          </p>
          <p>
            Guild may facilitate payment processing but does not guarantee payment for incomplete
            work, disputed work, or quests cancelled by a company.
          </p>
        </section>

        <section>
          <h2>6. XP, Ranks, and Badges</h2>
          <p>
            XP, badges, ranks, streaks, and Guild achievements are digital platform features
            designed to recognize contribution and activity.
          </p>
          <p>
            These items do not have monetary value, cannot be redeemed for cash, and cannot be
            transferred between accounts.
          </p>
        </section>

        <section>
          <h2>7. Prohibited Conduct</h2>
          <p>
            You agree not to misuse the platform, exploit bugs, submit stolen work, impersonate
            others, manipulate rankings, spam users, or engage in unlawful behavior.
          </p>
          <p>
            Any attempt to artificially inflate XP, reviews, quest completions, or Guild rankings
            may lead to immediate suspension.
          </p>
        </section>

        <section>
          <h2>8. Account Suspension or Termination</h2>
          <p>
            We reserve the right to suspend, restrict, or terminate accounts that violate these
            terms, create risk for the community, or misuse platform features.
          </p>
          <p>
            Serious violations may result in permanent removal of your account, Guild Card, and
            platform privileges.
          </p>
        </section>

        <section>
          <h2>9. Changes to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. Continued use of the platform
            after updates means you accept the revised terms.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            For legal questions or concerns regarding these Terms of Service, contact us at
            <strong> legal@adventurersguild.space</strong>.
          </p>
        </section>
      </InfoPageProse>
    </InfoPageShell>
  );
}
