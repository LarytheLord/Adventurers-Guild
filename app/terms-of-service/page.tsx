import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={32} height={32} />
            <span className="text-xl font-bold">Terms of Service</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Agreement to Terms</h2>
          <p>
            By accessing and using The Adventurers Guild platform, you agree to be bound by these 
            Terms of Service and all applicable laws and regulations. If you do not agree with 
            any of these terms, you are prohibited from using this platform.
          </p>

          <h2>Platform Description</h2>
          <p>
            The Adventurers Guild is a platform that connects developers (&quot;Adventurers&quot;) with 
            companies and individuals (&quot;Quest Givers&quot;) who need development work completed. 
            We facilitate these connections but are not a party to the actual work agreements.
          </p>

          <h2>User Accounts</h2>
          <h3>Registration</h3>
          <ul>
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must be at least 18 years old to use our platform</li>
            <li>One person may not maintain multiple accounts</li>
          </ul>

          <h3>Account Types</h3>
          <ul>
            <li><strong>Adventurers:</strong> Developers who complete quests and earn XP</li>
            <li><strong>Quest Givers:</strong> Companies or individuals who post development projects</li>
          </ul>

          <h2>Platform Rules</h2>
          <h3>Prohibited Activities</h3>
          <ul>
            <li>Posting false or misleading information</li>
            <li>Attempting to circumvent our ranking or payment systems</li>
            <li>Harassing or discriminating against other users</li>
            <li>Posting content that violates intellectual property rights</li>
            <li>Using the platform for illegal activities</li>
          </ul>

          <h3>Quest Guidelines</h3>
          <ul>
            <li>Quest descriptions must be accurate and complete</li>
            <li>Payment terms must be clearly specified</li>
            <li>Work requirements must be reasonable and achievable</li>
            <li>All parties must communicate professionally and respectfully</li>
          </ul>

          <h2>Ranking System</h2>
          <p>
            Our ranking system (F through S) is based on completed quests, quality of work, 
            and community feedback. Rankings are determined algorithmically and may be subject 
            to manual review for higher ranks (B-S).
          </p>

          <h2>Payments and Fees</h2>
          <h3>Platform Fees</h3>
          <ul>
            <li>We charge a service fee on completed quest payments</li>
            <li>Fee structure is clearly disclosed before quest acceptance</li>
            <li>Fees may vary based on quest value and user ranking</li>
          </ul>

          <h3>Payment Processing</h3>
          <ul>
            <li>Payments are processed through secure third-party providers</li>
            <li>Quest Givers pay upon quest completion and approval</li>
            <li>Disputes are handled through our resolution process</li>
          </ul>

          <h2>Intellectual Property</h2>
          <h3>User Content</h3>
          <ul>
            <li>You retain ownership of work you create</li>
            <li>Quest Givers receive agreed-upon rights to commissioned work</li>
            <li>You grant us license to display your work for platform purposes</li>
          </ul>

          <h3>Platform Content</h3>
          <ul>
            <li>Our platform design, features, and content are protected by copyright</li>
            <li>You may not copy, modify, or distribute our proprietary content</li>
          </ul>

          <h2>Dispute Resolution</h2>
          <p>
            Disputes between users should first be resolved directly. If resolution is not possible, 
            our support team can mediate. For legal disputes, binding arbitration may be required 
            as specified in your jurisdiction.
          </p>

          <h2>Platform Availability</h2>
          <p>
            We strive to maintain platform availability but cannot guarantee uninterrupted service. 
            We reserve the right to modify, suspend, or discontinue features with reasonable notice.
          </p>

          <h2>Privacy and Data</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy to understand 
            how we collect, use, and protect your information.
          </p>

          <h2>Termination</h2>
          <p>
            We may terminate or suspend accounts that violate these terms. Users may also 
            delete their accounts at any time, subject to completion of ongoing obligations.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            The Adventurers Guild provides a platform for connecting users but is not responsible 
            for the quality, legality, or outcome of work performed. Our liability is limited 
            to the maximum extent permitted by law.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Material changes will be communicated 
            to users with reasonable advance notice. Continued use of the platform constitutes 
            acceptance of updated terms.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by the laws of [Jurisdiction]. Any legal proceedings 
            must be brought in the courts of [Jurisdiction].
          </p>

          <h2>Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
          </p>
          <ul>
            <li>Email: legal@adventurersguild.com</li>
            <li>Address: [Company Address]</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
