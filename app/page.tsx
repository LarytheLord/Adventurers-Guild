'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Zap, Target, Users, Trophy, Compass, Shield, Sword, ChevronRight, CheckCircle, Github, Linkedin, Twitter, ArrowRight, Star, Sparkles, Menu, X, Mail, Laptop, Rocket } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { GoToTop } from "@/components/ui/go-to-top"

export default function AdventurersGuildLanding() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('') // Store the submitted email
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmittedEmail(email) // Store the email before clearing
        setIsSubmitted(true)
        setEmail('')
        setName('')
        setTimeout(() => setIsSubmitted(false), 10000)
      } else {
        throw new Error(data.message || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Something went wrong. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image 
              src="/images/guild-logo.png" 
              alt="The Adventurers Guild" 
              width={32} 
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-lg sm:text-xl font-bold text-foreground">The Adventurers Guild</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">
              How It Works
            </Link>
            <Link href="/quests" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">
              Browse Quests
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">
              About
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base">
              Login
            </Link>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 font-semibold transition-all duration-300 ease-out text-sm xl:text-base"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Waitlist
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />
            <button 
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background/95 backdrop-blur-xl border-t border-border">
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <Link 
                href="#how-it-works" 
                className="block text-muted-foreground hover:text-foreground font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="#benefits" 
                className="block text-muted-foreground hover:text-foreground font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </Link>
              <Link 
                href="#testimonials" 
                className="block text-muted-foreground hover:text-foreground font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 ease-out"
                onClick={() => {
                  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
                  setMobileMenuOpen(false)
                }}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left Badge */}
          <div className="absolute top-16 sm:top-32 left-4 sm:left-8 md:left-16 lg:left-24 floating-animation">
            <div className="bg-red-600/90 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold transform -rotate-12 shadow-lg">
              QUEST BUILD
            </div>
          </div>
          
          {/* Top Right Badge */}
          <div className="absolute top-12 sm:top-24 right-4 sm:right-8 md:right-16 lg:right-24 floating-animation" style={{ animationDelay: '1s' }}>
            <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 transform rotate-6 shadow-xl">
              <div className="text-center">
                <Sword className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-1 sm:mb-2" />
                <div className="text-xs font-bold text-white">DIGITAL</div>
                <div className="text-xs font-bold text-white">PIONEERS</div>
              </div>
            </div>
          </div>
          
          {/* Bottom Left Compass */}
          <div className="absolute bottom-16 sm:bottom-32 left-6 sm:left-12 md:left-20 lg:left-32 floating-animation" style={{ animationDelay: '2s' }}>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4 sm:p-6 transform -rotate-45 shadow-2xl">
              <Compass className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          
          {/* Bottom Right Code Element */}
          <div className="absolute bottom-20 sm:bottom-40 right-6 sm:right-12 md:right-20 lg:right-32 floating-animation" style={{ animationDelay: '0.5s' }}>
            <div className="bg-gray-900/80 backdrop-blur-sm text-green-400 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-mono transform rotate-3 shadow-lg border border-green-400/30">
              {'<adventure />'}
            </div>
          </div>
          
          {/* Floating XP Badge */}
          <div className="absolute top-1/2 left-2 sm:left-4 md:left-8 transform -translate-y-1/2 floating-animation" style={{ animationDelay: '1.5s' }}>
            <div className="bg-purple-600/90 backdrop-blur-sm text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transform -rotate-12 shadow-lg">
              <div className="text-center">
                <div className="text-xs font-bold">XP</div>
                <div className="text-base sm:text-lg font-black">∞</div>
              </div>
            </div>
          </div>
          
          {/* Guild Rank Badge */}
          <div className="absolute top-1/2 right-2 sm:right-4 md:right-8 transform -translate-y-1/2 floating-animation" style={{ animationDelay: '2.5s' }}>
            <div className="bg-yellow-500/90 backdrop-blur-sm text-gray-900 rounded-lg px-2 sm:px-3 py-1 sm:py-2 transform rotate-6 shadow-lg">
              <div className="text-center">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1" />
                <div className="text-xs font-bold">S-RANK</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-7xl mx-auto px-4 sm:px-6">
          <Badge className="mb-6 sm:mb-8 bg-primary text-primary-foreground border-0 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold">
            REVOLUTIONARY CS COMMUNITY
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 sm:mb-8 text-foreground leading-none tracking-tight">
            ADVENTURERS
            <br />
            GUILD
          </h1>
          
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-foreground/90 max-w-4xl mx-auto leading-tight px-4">
            FORGING DIGITAL PIONEERS
          </p>

          {/* Circular Badge */}
          <div className="mb-8 sm:mb-12 animate-pulse">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary bg-primary/10 backdrop-blur-xl shadow-2xl hover:scale-110 transition-all duration-500">
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold text-foreground">EST</div>
                <div className="text-lg sm:text-2xl font-black text-primary">2025</div>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mx-auto mt-1 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-bold transition-all duration-300 ease-out w-full sm:w-auto"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              JOIN THE GUILD
            </Button>
            <Link href="/login" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-bold transition-all duration-300 ease-out w-full"
              >
                ENTER GUILD
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section id="mission" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 sm:mb-8 text-foreground leading-tight">
            WE'RE NOT JUST CODING.
            <br />
            WE'RE CHARTING THE UNSEEN.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed px-4">
            Transform your computer science education into an epic quest. Gain real-world skills, 
            earn XP, and ascend the ranks from F to S by tackling challenges commissioned by real companies.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 text-foreground">
              THE PROBLEM
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              Traditional CS education is broken
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            {[
              { 
                title: "Theory Without Practice", 
                desc: "Students graduate with knowledge but no real-world experience. Employers want skills, not just grades.",
                number: "01"
              },
              { 
                title: "Passive Learning", 
                desc: "Lectures and textbooks don't prepare you for the dynamic, collaborative nature of modern tech work.",
                number: "02"
              },
              { 
                title: "No Industry Connection", 
                desc: "Universities operate in isolation from the companies that will eventually hire their graduates.",
                number: "03"
              },
              { 
                title: "Unclear Progression", 
                desc: "Students have no clear path to measure their growth or understand what skills they need next.",
                number: "04"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4 sm:space-x-6 hover:translate-y-[-4px] transition-transform duration-300 ease-out">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-primary/20 flex-shrink-0">
                  {item.number}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">{item.title}</h3>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-card text-card-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6">
              THE SOLUTION
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              Gamified, real-world CS education
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div>
              <Image 
                src="/images/quest-board.png" 
                alt="Quest Board" 
                width={600} 
                height={400}
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="space-y-8 sm:space-y-12">
              {[
                {
                  title: "Real Quests",
                  desc: "Work on actual projects commissioned by real companies. Build solutions that matter.",
                  icon: "🎯"
                },
                {
                  title: "XP & Rankings",
                  desc: "Earn experience points and climb from F-Rank to S-Rank. Clear progression, real rewards.",
                  icon: "⭐"
                },
                {
                  title: "Guild Community",
                  desc: "Join a community of ambitious developers. Collaborate, compete, and grow together.",
                  icon: "🛡️"
                },
                {
                  title: "Industry Mentorship",
                  desc: "Get guidance from experienced professionals who've walked the path before you.",
                  icon: "🗡️"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4 sm:space-x-6 hover:translate-y-[-4px] transition-transform duration-300 ease-out">
                  <div className="text-3xl sm:text-4xl text-primary flex-shrink-0">
                    <Target />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 text-foreground">
              WHY JOIN?
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                title: "Build Real Skills",
                desc: "Work on projects that actually matter. Build a portfolio that stands out.",
                icon: <Laptop />
              },
              {
                title: "Network & Mentorship",
                desc: "Connect with industry professionals and experienced developers.",
                icon: <Users />
              },
              {
                title: "Stand Out",
                desc: "Demonstrate proven skills that employers actually want to see.",
                icon: <Rocket />
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center hover:translate-y-[-8px] transition-transform duration-300 ease-out">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">{benefit.title}</h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-card text-card-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6">
              FROM THE ADVENTURERS
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="bg-background rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col justify-between 
             transform transition duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                  "The Adventurers Guild has been a game-changer for my career. I've learned more in the past three months than I did in three years of college."
                </p>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-base sm:text-lg">J.D.</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg">Jane Doe</h4>
                    <p className="text-muted-foreground text-sm">S-Rank Adventurer</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 text-primary-foreground">
            READY TO BEGIN?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-12 sm:mb-16 font-medium">
            Join the waitlist and be among the first to embark on your adventure
          </p>
          
          <Card className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 border-0">
            <CardContent className="p-6 sm:p-8 md:p-12">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      {error}
                    </div>
                  )}
                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-base sm:text-lg py-3 sm:py-4 border-2 border-border focus:border-primary"
                      disabled={isLoading}
                    />
                    <Input
                      type="email"
                      placeholder="Your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="text-base sm:text-lg py-3 sm:py-4 border-2 border-border focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 sm:py-4 text-lg sm:text-xl font-bold transition-all duration-300 ease-out disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⚡</span>
                        ENLISTING...
                      </>
                    ) : (
                      'ENLIST NOW'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Successfully Invited!</h3>
                  <p className="text-muted-foreground mb-3 sm:mb-4">
                    Welcome to The Adventurers Guild! Check your email for your welcome message with all the details about your epic journey ahead.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    📧 Welcome email sent to: <strong>{submittedEmail}</strong>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      
      {/* Trusted Partners Section */}
      <section className="py-16 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Trusted Partners and Organizations
            </h2>
          </div>
          
          {/* Scrolling Logos Container */}
          <div className="relative overflow-hidden">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 bg-card text-card-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-0">
              <Image 
                src="/images/guild-logo.png" 
                alt="The Adventurers Guild" 
                width={28} 
                height={28}
                className="w-7 h-7 sm:w-8 sm:h-8"
              />
              <div>
                <div className="text-lg sm:text-xl font-bold">The Adventurers Guild</div>
                <div className="text-muted-foreground text-sm">Forging Digital Pioneers</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link href="https://www.linkedin.com/company/adventurers-guild" className="text-muted-foreground hover:text-card-foreground transition-colors">
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link href="https://github.com/LarytheLord/Adventurers-Guild" className="text-muted-foreground hover:text-card-foreground transition-colors">
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/how-it-works" className="block text-muted-foreground hover:text-foreground">How It Works</Link>
                  <Link href="/quests" className="block text-muted-foreground hover:text-foreground">Browse Quests</Link>
                  <Link href="/commission" className="block text-muted-foreground hover:text-foreground">Post a Quest</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/about" className="block text-muted-foreground hover:text-foreground">About Us</Link>
                  <Link href="/contact" className="block text-muted-foreground hover:text-foreground">Contact</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Account</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/login" className="block text-muted-foreground hover:text-foreground">Login</Link>
                  <Link href="/signup" className="block text-muted-foreground hover:text-foreground">Sign Up</Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <div className="space-y-2 text-sm">
                  <Link href="/privacy-policy" className="block text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                  <Link href="/terms-of-service" className="block text-muted-foreground hover:text-foreground">Terms of Service</Link>
                </div>
              </div>
            </div>
            <div className="text-center text-muted-foreground text-sm">
              © {new Date().getFullYear()} The Adventurers Guild. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Go to Top Button */}
      <GoToTop />
    </div>
  )
}
