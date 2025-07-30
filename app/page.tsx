"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Zap,
  Target,
  Users,
  Trophy,
  Compass,
  Shield,
  Sword,
  ChevronRight,
  CheckCircle,
  Github,
  Linkedin,
  Twitter,
  ArrowRight,
  Star,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdventurersGuildLanding() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/30 backdrop-blur-xl border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/guild-logo.png"
              alt="The Adventurers Guild"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-foreground">
              The Adventurers Guild
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Benefits
            </Link>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-semibold transition-all duration-300 ease-out"
              onClick={() =>
                document
                  .getElementById("waitlist")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Join Waitlist
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-6 py-4 space-y-4">
              <Link
                href="#how-it-works"
                className="block text-muted-foreground hover:text-foreground font-medium"
              >
                How It Works
              </Link>
              <Link
                href="#benefits"
                className="block text-muted-foreground hover:text-foreground font-medium"
              >
                Benefits
              </Link>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 ease-out">
                Join Waitlist
              </Button>
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.png"
            alt="Digital Adventure Landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left Badge */}
          <div className="absolute top-32 left-8 md:left-16 lg:left-24 floating-animation">
            <div className="bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold transform -rotate-12 shadow-lg">
              QUEST BUILD
            </div>
          </div>

          {/* Top Right Badge */}
          <div
            className="absolute top-24 right-8 md:right-16 lg:right-24 floating-animation"
            style={{ animationDelay: "1s" }}
          >
            <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-4 transform rotate-6 shadow-xl">
              <div className="text-center">
                <Sword className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-xs font-bold text-white">DIGITAL</div>
                <div className="text-xs font-bold text-white">PIONEERS</div>
              </div>
            </div>
          </div>

          {/* Bottom Left Compass */}
          <div
            className="absolute bottom-32 left-12 md:left-20 lg:left-32 floating-animation"
            style={{ animationDelay: "2s" }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-6 transform -rotate-45 shadow-2xl">
              <Compass className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Bottom Right Code Element */}
          <div
            className="absolute bottom-40 right-12 md:right-20 lg:right-32 floating-animation"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="bg-gray-900/80 backdrop-blur-sm text-green-400 px-3 py-2 rounded-lg text-xs font-mono transform rotate-3 shadow-lg border border-green-400/30">
              {"<adventure />"}
            </div>
          </div>

          {/* Floating XP Badge */}
          <div
            className="absolute top-1/2 left-4 md:left-8 transform -translate-y-1/2 floating-animation"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="bg-purple-600/90 backdrop-blur-sm text-white rounded-full w-16 h-16 flex items-center justify-center transform -rotate-12 shadow-lg">
              <div className="text-center">
                <div className="text-xs font-bold">XP</div>
                <div className="text-lg font-black">∞</div>
              </div>
            </div>
          </div>

          {/* Guild Rank Badge */}
          <div
            className="absolute top-1/2 right-4 md:right-8 transform -translate-y-1/2 floating-animation"
            style={{ animationDelay: "2.5s" }}
          >
            <div className="bg-yellow-500/90 backdrop-blur-sm text-gray-900 rounded-lg px-3 py-2 transform rotate-6 shadow-lg">
              <div className="text-center">
                <Star className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-bold">S-RANK</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-7xl mx-auto px-6">
          <Badge className="mb-8 bg-primary text-primary-foreground border-0 px-4 py-2 text-sm font-semibold">
            REVOLUTIONARY CS COMMUNITY
          </Badge>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 text-foreground leading-none tracking-tight">
            ADVENTURERS
            <br />
            GUILD
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl font-bold mb-12 text-foreground/90 max-w-4xl mx-auto leading-tight">
            FORGING DIGITAL PIONEERS
          </p>

          {/* Circular Badge */}
          <div className="mb-12 animate-pulse">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary bg-primary/10 backdrop-blur-xl shadow-2xl hover:scale-110 transition-all duration-500">
              <div className="text-center">
                <div className="text-sm font-bold text-foreground">EST</div>
                <div className="text-2xl font-black text-primary">2025</div>
                <ChevronRight className="w-4 h-4 text-foreground mx-auto mt-1 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-xl font-bold transition-all duration-300 ease-out"
              onClick={() =>
                document
                  .getElementById("waitlist")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              JOIN THE GUILD
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-foreground leading-tight">
            WE'RE NOT JUST CODING.
            <br />
            WE'RE CHARTING THE UNSEEN.
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            Transform your computer science education into an epic quest. Gain
            real-world skills, earn XP, and ascend the ranks from F to S by
            tackling challenges commissioned by real companies.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-foreground">
              THE PROBLEM
            </h2>
            <p className="text-2xl text-muted-foreground font-medium">
              Traditional CS education is broken
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {[
              {
                title: "Theory Without Practice",
                desc: "Students graduate with knowledge but no real-world experience. Employers want skills, not just grades.",
                number: "01",
              },
              {
                title: "Passive Learning",
                desc: "Lectures and textbooks don't prepare you for the dynamic, collaborative nature of modern tech work.",
                number: "02",
              },
              {
                title: "No Industry Connection",
                desc: "Universities operate in isolation from the companies that will eventually hire their graduates.",
                number: "03",
              },
              {
                title: "Unclear Progression",
                desc: "Students have no clear path to measure their growth or understand what skills they need next.",
                number: "04",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start space-x-6 hover:translate-y-[-4px] transition-transform duration-300 ease-out"
              >
                <div className="text-6xl font-black text-primary/20">
                  {item.number}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section
        id="how-it-works"
        className="py-24 px-6 bg-card text-card-foreground"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              THE SOLUTION
            </h2>
            <p className="text-2xl text-muted-foreground font-medium">
              Gamified, real-world CS education
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Image
                src="/images/quest-board.png"
                alt="Quest Board"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-12">
              {[
                {
                  title: "Real Quests",
                  desc: "Work on actual projects commissioned by real companies. Build solutions that matter.",
                  icon: "🎯",
                },
                {
                  title: "XP & Rankings",
                  desc: "Earn experience points and climb from F-Rank to S-Rank. Clear progression, real rewards.",
                  icon: "⭐",
                },
                {
                  title: "Guild Community",
                  desc: "Join a community of ambitious developers. Collaborate, compete, and grow together.",
                  icon: "🛡️",
                },
                {
                  title: "Industry Mentorship",
                  desc: "Get guidance from experienced professionals who've walked the path before you.",
                  icon: "🗡️",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-6 hover:translate-y-[-4px] transition-transform duration-300 ease-out"
                >
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6 text-foreground">
              WHY JOIN?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Build Real Skills",
                desc: "Work on projects that actually matter. Build a portfolio that stands out.",
                icon: "💻",
              },
              {
                title: "Network & Mentorship",
                desc: "Connect with industry professionals and experienced developers.",
                icon: "🤝",
              },
              {
                title: "Stand Out",
                desc: "Demonstrate proven skills that employers actually want to see.",
                icon: "🚀",
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="text-center hover:translate-y-[-8px] transition-transform duration-300 ease-out"
              >
                <div className="text-6xl mb-6">{benefit.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section
        id="waitlist"
        className="py-24 px-6 bg-gradient-to-b from-[#e11d48] to-[#b91c1c] dark:from-[#0f0f0f] dark:to-[#1a1a1a] transition-colors duration-500"
      >
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-md">
            Ready to Begin?
          </h2>
          <p className="text-xl md:text-2xl text-white/80 font-medium mb-12">
            Join the waitlist and be among the first to embark on your adventure
          </p>

          <Card className="bg-white dark:bg-[#0e1117] border border-transparent dark:border-[#262a31] rounded-3xl shadow-2xl transition-all duration-500 hover:scale-[1.02] max-w-xl mx-auto">
            <CardContent className="p-8 md:p-10 space-y-8">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 text-base rounded-xl bg-gray-50 dark:bg-[#1a1f27] text-gray-900 dark:text-white border border-gray-200 dark:border-[#3a3f4b] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 text-base rounded-xl bg-gray-50 dark:bg-[#1a1f27] text-gray-900 dark:text-white border border-gray-200 dark:border-[#3a3f4b] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-md hover:shadow-lg hover:brightness-110 transition-all"
                  >
                    ENLIST NOW
                  </Button>
                </form>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to the Guild!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Your adventure begins soon. Keep an eye on your inbox for
                    next steps!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-card text-card-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-8 md:mb-0">
              <Image
                src="/images/guild-logo.png"
                alt="The Adventurers Guild"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <div className="text-xl font-bold">The Adventurers Guild</div>
                <div className="text-muted-foreground">
                  Forging Digital Pioneers
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link
                href="https://www.linkedin.com/company/adventurers-guild"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </Link>
              <Link
                href="https://github.com/LarytheLord/Adventurers-Guild"
                className="text-muted-foreground hover:text-card-foreground transition-colors"
              >
                <Github className="w-6 h-6" />
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            © {new Date().getFullYear()} The Adventurers Guild. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
