import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Target, Users, Zap, Trophy, Github, Linkedin } from 'lucide-react'

export default function AboutPage() {
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
          <Badge className="mb-4 bg-primary text-primary-foreground">About Our Mission</Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Forging Digital Pioneers
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing computer science education by bridging the gap between 
            theoretical knowledge and real-world industry experience through gamified learning.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <Target className="w-12 h-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To transform aspiring developers into industry-ready problem-solvers by connecting 
                them with real-world commissioned projects from companies, creating a merit-based 
                ecosystem where skills are developed through practical application.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-12 h-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To establish a new standard for skill development, portfolio building, and talent 
                sourcing in the tech industry, where every line of code leads to real impact and 
                measurable growth.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* The Problem We Solve */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">The Problem We Solve</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Theory-Practice Gap",
                description: "Students graduate with strong theoretical knowledge but lack hands-on, industry-relevant experience."
              },
              {
                title: "Passive Learning",
                description: "Traditional education methods often lead to disengagement and missed opportunities for practical skill development."
              },
              {
                title: "Talent Shortage",
                description: "Companies struggle to find junior talent with verifiable project experience and practical problem-solving skills."
              }
            ].map((problem, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Our Solution */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Solution: The Guild System</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Gamified Real-World Learning</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "Merit-Based Progression",
                    description: "Students advance through F-S ranks based on completed quests and demonstrated skills."
                  },
                  {
                    icon: <Trophy className="w-6 h-6" />,
                    title: "Real Commissioned Projects",
                    description: "Companies post actual development challenges that students solve for XP and compensation."
                  },
                  {
                    icon: <Target className="w-6 h-6" />,
                    title: "Skill-Based Matching",
                    description: "Advanced algorithms match students with quests that challenge and develop their abilities."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="text-primary mt-1">{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold mb-1">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
              <h4 className="text-xl font-bold mb-4">By the Numbers</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Rank Levels", value: "7" },
                  { label: "Skill Categories", value: "10+" },
                  { label: "Quest Types", value: "50+" },
                  { label: "Success Rate", value: "95%" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Meet the Founders</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "LaryTheLord",
                role: "Founder & CEO",
                bio: "Passionate about bridging the gap between education and industry through innovative technology solutions.",
                avatar: "/placeholder-user.jpg",
                github: "https://github.com/LarytheLord",
                linkedin: "https://linkedin.com/in/larythelord"
              }
            ].map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image 
                      src={member.avatar} 
                      alt={member.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                  <div className="flex justify-center space-x-4">
                    <Link href={member.github} className="text-muted-foreground hover:text-foreground">
                      <Github className="w-5 h-5" />
                    </Link>
                    <Link href={member.linkedin} className="text-muted-foreground hover:text-foreground">
                      <Linkedin className="w-5 h-5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Guild?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a student ready to level up your skills or a company looking for talented developers, 
            The Adventurers Guild is your gateway to the future of tech education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3">
                Join as Student
              </Button>
            </Link>
            <Link href="/commission">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Post a Quest
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}