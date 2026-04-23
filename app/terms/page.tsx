import Link from 'next/link';

export const metadata = { title: 'Terms of Service — Adventurers Guild' };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-20">
      <div className="container max-w-5xl mx-auto px-6">
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
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm">Last updated: March 2026</p>
        </div>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Adventurers Guild platform, you agree to be bound by
              these Terms of Service. If you do not agree with these terms, you should not
              use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Platform Description</h2>
            <p>
              Adventurers Guild is a platform that connects developers, designers,
              researchers, and other contributors with companies and organizations that
              need project work completed.
            </p>
            <p>
              We provide the infrastructure, Quest system, ranking tools, public Guild
              Cards, communication features, and payment facilitation. However, Adventurers
              Guild is not a direct employer, contractor, or client in the agreements made
              between Adventurers and Companies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and
              password. You agree to provide accurate information during registration and
              keep your profile updated.
            </p>
            <p>
              You are also responsible for all activity that occurs under your account.
              Sharing accounts, impersonating others, or creating misleading profiles is
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Quests and Work</h2>
            <p>
              Companies are responsible for clearly defining Quest requirements,
              deliverables, timelines, and rewards. Adventurers are responsible for
              submitting original, complete, and high-quality work.
            </p>
            <p>
              Failure to meet Quest requirements, repeated missed deadlines, plagiarism,
              or fraudulent submissions may result in penalties, reduced visibility,
              suspension, or account termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Payments and Rewards</h2>
            <p>
              Some Quests may provide monetary rewards, while others may provide XP,
              recognition, internship consideration, or portfolio experience.
            </p>
            <p>
              Adventurers Guild may facilitate payment processing but does not guarantee
              payment for incomplete work, disputed work, or Quests cancelled by a Company.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. XP, Ranks, and Badges</h2>
            <p>
              XP, badges, ranks, streaks, and Guild achievements are digital platform
              features designed to recognize contribution and activity.
            </p>
            <p>
              These items do not have monetary value, cannot be redeemed for cash, and
              cannot be transferred between accounts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Prohibited Conduct</h2>
            <p>
              You agree not to misuse the platform, exploit bugs, submit stolen work,
              impersonate others, manipulate rankings, spam users, or engage in unlawful
              behavior.
            </p>
            <p>
              Any attempt to artificially inflate XP, reviews, Quest completions, or Guild
              rankings may lead to immediate suspension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Account Suspension or Termination</h2>
            <p>
              We reserve the right to suspend, restrict, or terminate accounts that violate
              these terms, create risk for the community, or misuse platform features.
            </p>
            <p>
              Serious violations may result in permanent removal of your account, Guild
              Card, and platform privileges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the
              platform after updates means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>
              For legal questions or concerns regarding these Terms of Service, contact us
              at <span className="text-orange-400">legal@adventurersguild.space</span>.
            </p>
          </section>
        </div>

        <section className="mt-24 border-t border-slate-800 pt-16">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Everything Adventurers, contributors, and companies need to know before
              joining the Guild.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What is Adventurers Guild?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Adventurers Guild is a platform where developers complete real-world
                Quests from startups, businesses, and organizations. Contributors earn
                XP, unlock ranks, and build verified public profiles.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Who can join the platform?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Students, freelancers, self-taught developers, open-source contributors,
                experienced engineers, startups, and companies can all join the platform.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What are Quests?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Quests are real project tasks such as building features, fixing bugs,
                designing interfaces, writing documentation, testing products, or
                contributing to open-source work.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                How do XP and ranks work?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Contributors earn XP through completed Quests, positive reviews,
                streaks, and activity. More XP unlocks higher ranks, from F-Rank to
                S-Rank.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can beginners join?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Yes. Beginner-friendly Quests, guided challenges, Bootcamp tracks,
                and community support help new contributors get started.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Are Quests paid?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Some Quests are paid while others offer XP, public recognition,
                portfolio building, or internship opportunities.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What is a Guild Card?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                A Guild Card is your public profile showing your rank, XP, completed
                Quests, skills, reviews, badges, and verified contribution history.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I work on multiple Quests?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Yes, but you are expected to manage deadlines responsibly. Missing
                deadlines repeatedly may affect your rank and future opportunities.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                How are contributors selected?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Companies may review Guild rank, XP, completed Quests, portfolio links,
                reviews, badges, and previous work history before choosing contributors.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                How are disputes handled?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                If disputes arise, the platform may review Quest details, submissions,
                and communication logs. However, the final agreement remains between
                the Company and the Adventurer.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can employers verify experience?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Yes. Employers can review completed Quest history, Guild Cards,
                badges, ranks, and verified project outcomes.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What happens if I stop using the platform?
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Your account remains available unless you request deletion. However,
                inactivity may reduce visibility, leaderboard ranking, and access to
                special opportunities.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

