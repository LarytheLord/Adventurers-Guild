import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Users, Trophy, Target, Star, Zap, CheckCircle } from 'lucide-react'

export default function HowItWorksPage() {
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
            <span className="text-xl font-bold">The Adventurers Guild</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge className="mb-4 bg-primary text-primary-foreground">How It Works</Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Your Journey from F-Rank to S-Rank
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover how The Adventurers Guild transforms traditional learning into an epic quest 
            for real-world skills and industry experience.
          </p>
        </section>

        {/* The Guild System Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">The Guild System</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle>Adventurers</CardTitle>
                <CardDescription>Students & Developers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join as an Adventurer to take on real-world quests, earn XP, 
                  and advance through our ranking system while building your portfolio.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle>Quests</CardTitle>
                <CardDescription>Real Projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Complete commissioned projects from real companies, ranging from 
                  bug fixes to full application development.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                <CardTitle>Quest Givers</CardTitle>
                <CardDescription>Companies & Clients</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Companies post real development challenges and get access to 
                  a pool of motivated, skilled developers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rank System */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">The Ranking System</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { rank: 'F', name: 'Novice', xp: '0-500', color: 'bg-gray-500' },
              { rank: 'D', name: 'Apprentice', xp: '500-1.5K', color: 'bg-brown-500' },
              { rank: 'C', name: 'Journeyman', xp: '1.5K-4K', color: 'bg-green-500' },
              { rank: 'B', name: 'Expert', xp: '4K-8K', color: 'bg-blue-500' },
              { rank: 'A', name: 'Master', xp: '8K-15K', color: 'bg-purple-500' },
              { rank: 'S', name: 'Legend', xp: '15K+', color: 'bg-yellow-500' },
              { rank: 'SS', name: 'Mythic', xp: 'Invite Only', color: 'bg-red-500' }
            ].map((rank, index) => (
              <Card key={index} className="text-center">
                <CardHeader className="pb-2">
                  <div className={`w-16 h-16 rounded-full ${rank.color} text-white flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-2xl font-bold">{rank.rank}</span>
                  </div>
                  <CardTitle className="text-lg">{rank.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{rank.xp} XP</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works - Step by Step */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Your Adventure Journey</h2>
          
          {/* For Students */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-8 text-center">For Students (Adventurers)</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Join the Guild",
                  description: "Sign up and create your adventurer profile with your skills and interests.",
                  icon: <Users className="w-8 h-8" />
                },
                {
                  step: "2", 
                  title: "Browse Quests",
                  description: "Explore available quests that match your rank and skill level.",
                  icon: <Target className="w-8 h-8" />
                },
                {
                  step: "3",
                  title: "Complete Quests",
                  description: "Work on real projects, submit your solutions, and get feedback.",
                  icon: <Zap className="w-8 h-8" />
                },
                {
                  step: "4",
                  title: "Earn XP & Rank Up",
                  description: "Gain experience points and advance through the ranking system.",
                  icon: <Star className="w-8 h-8" />
                }
              ].map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="font-bold">{step.step}</span>
                    </div>
                    <div className="text-primary mb-2">{step.icon}</div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm text-center">{step.description}</p>
                  </CardContent>
                  {index < 3 && (
                    <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* For Companies */}
          <div>
            <h3 className="text-2xl font-bold mb-8 text-center">For Companies (Quest Givers)</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Post a Quest",
                  description: "Submit your project requirements, budget, and timeline.",
                  icon: <Trophy className="w-8 h-8" />
                },
                {
                  step: "2",
                  title: "Review Applications",
                  description: "Browse applications from qualified adventurers and select the best fit.",
                  icon: <Users className="w-8 h-8" />
                },
                {
                  step: "3",
                  title: "Monitor Progress",
                  description: "Track project progress and provide feedback throughout development.",
                  icon: <Target className="w-8 h-8" />
                },
                {
                  step: "4",
                  title: "Receive Results",
                  description: "Get high-quality deliverables and pay only for approved work.",
                  icon: <CheckCircle className="w-8 h-8" />
                }
              ].map((step, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="font-bold">{step.step}</span>
                    </div>
                    <div className="text-secondary mb-2">{step.icon}</div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm text-center">{step.description}</p>
                  </CardContent>
                  {index < 3 && (
                    <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose The Adventurers Guild?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">For Students</h3>
              <div className="space-y-4">
                {[
                  "Gain real-world experience on actual projects",
                  "Build a portfolio with verified completed work",
                  "Earn money while learning and growing your skills",
                  "Get mentorship from experienced developers",
                  "Clear progression path with measurable achievements",
                  "Network with industry professionals and peers"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">For Companies</h3>
              <div className="space-y-4">
                {[
                  "Access to pre-vetted, motivated developers",
                  "Cost-effective solution for development projects",
                  "Flexible project scoping and timeline management",
                  "Quality assurance through our review process",
                  "Opportunity to identify and recruit top talent",
                  "Support the next generation of developers"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building their careers through real-world quests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3">
                Join as Adventurer
              </Button>
            </Link>
            <Link href="/commission">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Post Your First Quest
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}