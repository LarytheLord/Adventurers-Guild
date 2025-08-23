import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
            <span className="text-xl font-bold">Privacy Policy</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Introduction</h2>
          <p>
            The Adventurers Guild (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our platform.
          </p>

          <h2>Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Name and email address</li>
            <li>Profile information (bio, skills, experience)</li>
            <li>Contact information</li>
            <li>Payment information (processed securely through third-party providers)</li>
          </ul>

          <h3>Usage Information</h3>
          <ul>
            <li>Quest applications and submissions</li>
            <li>Platform usage analytics</li>
            <li>Communication records</li>
            <li>Device and browser information</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To process quest applications and payments</li>
            <li>To communicate with you about your account and quests</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li>With quest givers when you apply for their quests</li>
            <li>With service providers who assist in platform operations</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or acquisition</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
            <li>Request data portability</li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and provide personalized content. You can manage cookie preferences through your browser settings.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            Our platform may integrate with third-party services (authentication providers, payment processors). 
            These services have their own privacy policies that govern their use of your information.
          </p>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Our platform is not intended for children under 13. We do not knowingly collect 
            personal information from children under 13.
          </p>

          <h2>International Users</h2>
          <p>
            If you are accessing our platform from outside the United States, please be aware 
            that your information may be transferred to and processed in the United States.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@adventurersguild.com</li>
            <li>Address: [Company Address]</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
