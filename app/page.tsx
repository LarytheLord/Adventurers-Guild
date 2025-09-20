"use client";

import { useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
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
  Instagram,
  ArrowRight,
  Star,
  Sparkles,
  Menu,
  X,
  Mail,
  Laptop,
  Rocket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GoToTop } from "@/components/ui/go-to-top";
const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function AdventurersGuildLanding() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scaleAndFade = useTransform(scrollYProgress, [0, 0.7], [1, 0.8]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const missionRef = useRef(null);
  const isMissionInView = useInView(missionRef, { once: true, amount: 0.5 });

  const problemRef = useRef(null);
  const isProblemInView = useInView(problemRef, { once: true, amount: 0.5 });

  const solutionRef = useRef(null);
  const isSolutionInView = useInView(solutionRef, { once: true, amount: 0.5 });

  const benefitsRef = useRef(null);
  const isBenefitsInView = useInView(benefitsRef, { once: true, amount: 0.5 });

  const testimonialsRef = useRef(null);
  const isTestimonialsInView = useInView(testimonialsRef, {
    once: true,
    amount: 0.5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmittedEmail(email); // Store the email before clearing
        setIsSubmitted(true);
        setEmail("");
        setName("");
        setTimeout(() => setIsSubmitted(false), 10000);
      } else {
        throw new Error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="text-lg sm:text-xl font-bold text-foreground">
              The Adventurers Guild
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base"
            >
              How It Works
            </Link>
            <Link
              href="#benefits"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base"
            >
              Benefits
            </Link>
            <Link
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm xl:text-base"
            >
              Testimonials
            </Link>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 font-semibold transition-all duration-300 ease-out text-sm xl:text-base"
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
          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
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
                  document
                    .getElementById("waitlist")
                    ?.scrollIntoView({ behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20"
      >
        {/* Background Image with Parallax */}
        <motion.div style={{ y: yParallax }} className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.png"
            alt="Digital Adventure Landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </motion.div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left Badge */}
          <div className="absolute top-16 sm:top-32 left-4 sm:left-8 md:left-16 lg:left-24 floating-animation">
            <div className="bg-red-600/90 backdrop-blur-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold transform -rotate-12 shadow-lg">
              QUEST BUILD
            </div>
          </div>

          {/* Top Right Badge */}
          <div
            className="absolute top-12 sm:top-24 right-4 sm:right-8 md:right-16 lg:right-24 floating-animation"
            style={{ animationDelay: "1s" }}
          >
            <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 transform rotate-6 shadow-xl">
              <div className="text-center">
                <Sword className="w-6 h-6 sm:w-8 sm:h-8 text-white mx-auto mb-1 sm:mb-2" />
                <div className="text-xs font-bold text-white">DIGITAL</div>
                <div className="text-xs font-bold text-white">PIONEERS</div>
              </div>
            </div>
          </div>

          {/* Bottom Left Compass */}
          <div
            className="absolute bottom-16 sm:bottom-32 left-6 sm:left-12 md:left-20 lg:left-32 floating-animation"
            style={{ animationDelay: "2s" }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-4 sm:p-6 transform -rotate-45 shadow-2xl">
              <Compass className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          {/* Bottom Right Code Element */}
          <div
            className="absolute bottom-20 sm:bottom-40 right-6 sm:right-12 md:right-20 lg:right-32 floating-animation"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="bg-gray-900/80 backdrop-blur-sm text-green-400 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-mono transform rotate-3 shadow-lg border border-green-400/30">
              {"<adventure />"}
            </div>
          </div>

          {/* Floating XP Badge */}
          <div
            className="absolute top-1/2 left-2 sm:left-4 md:left-8 transform -translate-y-1/2 floating-animation"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="bg-purple-600/90 backdrop-blur-sm text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transform -rotate-12 shadow-lg">
              <div className="text-center">
                <div className="text-xs font-bold">XP</div>
                <div className="text-base sm:text-lg font-black">∞</div>
              </div>
            </div>
          </div>

          {/* Guild Rank Badge */}
          <div
            className="absolute top-1/2 right-2 sm:right-4 md:right-8 transform -translate-y-1/2 floating-animation"
            style={{ animationDelay: "2.5s" }}
          >
            <div className="bg-yellow-500/90 backdrop-blur-sm text-gray-900 rounded-lg px-2 sm:px-3 py-1 sm:py-2 transform rotate-6 shadow-lg">
              <div className="text-center">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1" />
                <div className="text-xs font-bold">S-RANK</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content with Scroll Fade */}
        <motion.div
          style={{ scale: scaleAndFade, opacity: opacityFade }}
          className="relative z-20"
        >
          <motion.div
            className="text-center max-w-7xl mx-auto px-4 sm:px-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Transition is defined on each motion component */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Badge className="mb-6 sm:mb-8 bg-primary text-primary-foreground border-0 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold">
                REVOLUTIONARY CS COMMUNITY
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-6 sm:mb-8 text-foreground leading-none tracking-tight"
            >
              ADVENTURERS
              <br />
              GUILD
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-foreground/90 max-w-4xl mx-auto leading-tight px-4"
            >
              FORGING DIGITAL PIONEERS
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="mb-8 sm:mb-12 animate-pulse">
                <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary bg-primary/10 backdrop-blur-xl shadow-2xl hover:scale-110 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-bold text-foreground">
                      EST
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-primary">
                      2025
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-foreground mx-auto mt-1 animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-bold transition-all duration-300 ease-out w-full sm:w-auto"
                  onClick={() =>
                    document
                      .getElementById("waitlist")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  JOIN THE GUILD
                </Button>
                <Link href="/home" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="glow-on-hover border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-bold transition-all duration-300 ease-out w-full"
                  >
                    ENTER GUILD
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <motion.section
        ref={missionRef}
        initial="hidden"
        animate={isMissionInView ? "visible" : "hidden"}
        variants={fadeInUp}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 sm:mb-8 leading-tight">
            <span className="text-black dark:text-white">FORGE YOUR PATH.</span>
            <br />
            <span className="text-red-600">CONQUER THE unknown.</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed px-4">
            Your education is no longer a{" "}
            <span className="text-black dark:text-white font-semibold">
              classroom routine
            </span>{" "}
            — it’s a{" "}
            <span className="text-black dark:text-white font-semibold">
              battlefield of ideas
            </span>
            . Earn{" "}
            <span className="text-black dark:text-white font-semibold">XP</span>
            , sharpen your craft, and climb from
            <span className="text-black dark:text-white font-semibold">
              {" "}
              novice
            </span>{" "}
            to
            <span className="text-red-600 font-bold"> S-rank warrior</span> by
            tackling challenges that real companies put on the line.
          </p>
        </div>
      </motion.section>

      {/* Problem Section */}
      <motion.section
        ref={problemRef}
        initial="hidden"
        animate={isProblemInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 text-foreground">
              THE PROBLEM
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              Traditional CS education is broken
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
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
            ].map((item) => (
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.7, ease: "easeOut" }}
                key={item.number}
                className="flex items-start space-x-4 sm:space-x-6 hover:translate-y-[-4px] transition-transform duration-300 ease-out"
              >
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-primary drop-shadow-md flex-shrink-0">
                  {item.number}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Solution Section */}
      <motion.section
        ref={solutionRef}
        initial="hidden"
        animate={isSolutionInView ? "visible" : "hidden"}
        variants={staggerContainer}
        id="how-it-works"
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-card text-card-foreground"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6">
              THE SOLUTION
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              Gamified, real-world CS education
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <motion.div
              variants={fadeInLeft}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Image
                src="/images/quest-board.png"
                alt="Quest Board"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl w-full"
              />
            </motion.div>
            <motion.div
              variants={fadeInRight}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-8 sm:space-y-12"
            >
              {[
                {
                  title: "Real Quests",
                  desc: "Work on actual projects commissioned by real companies. Build solutions that matter.",
                },
                {
                  title: "XP & Rankings",
                  desc: "Earn experience points and climb from F-Rank to S-Rank. Clear progression, real rewards.",
                },
                {
                  title: "Guild Community",
                  desc: "Join a community of ambitious developers. Collaborate, compete, and grow together.",
                },
                {
                  title: "Industry Mentorship",
                  desc: "Get guidance from experienced professionals who've walked the path before you.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 sm:space-x-6 hover:translate-y-[-4px] transition-transform duration-300 ease-out"
                >
                  <div className="text-3xl sm:text-4xl text-primary flex-shrink-0">
                    <Target />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                      {item.title}
                    </h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        ref={benefitsRef}
        initial="hidden"
        animate={isBenefitsInView ? "visible" : "hidden"}
        variants={staggerContainer}
        id="benefits"
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-background"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 text-foreground">
              WHY JOIN?
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                title: "Build Real Skills",
                desc: "Work on projects that actually matter. Build a portfolio that stands out.",
                icon: <Laptop className="h-9 w-9" />,
              },
              {
                title: "Network & Mentorship",
                desc: "Connect with industry professionals and experienced developers.",
                icon: <Users className="h-9 w-9" />,
              },
              {
                title: "Stand Out",
                desc: "Demonstrate proven skills that employers actually want to see.",
                icon: <Rocket className="h-9 w-9" />,
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col justify-between items-center text-center transform transition duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl cursor-pointer border border-gray-300 dark:border-gray-700 rounded-2xl shadow-md p-10 bg-white dark:bg-[#0f172a]"
              >
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-muted-foreground leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        ref={testimonialsRef}
        initial="hidden"
        animate={isTestimonialsInView ? "visible" : "hidden"}
        variants={staggerContainer}
        id="testimonials"
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-card text-card-foreground"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6">
              FROM THE ADVENTURERS
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, index) => (
              <motion.div
                variants={scaleIn}
                transition={{ duration: 0.6, ease: "easeOut" }}
                key={index}
              >
                <Card
                  className="bg-background rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col justify-between h-full
                 transform transition duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                >
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-6">
                    "The Adventurers Guild has been a game-changer for my
                    career. I've learned more in the past three months than I
                    did in three years of college."
                  </p>
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-base sm:text-lg">
                        J.D.
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg">
                        Jane Doe
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        S-Rank Adventurer
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Waitlist Section */}
      <section
        id="waitlist"
        className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-primary"
      >
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
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6"
                >
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
                      "ENLIST NOW"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    Successfully Invited!
                  </h3>
                  <p className="text-muted-foreground mb-3 sm:mb-4">
                    Welcome to The Adventurers Guild! Check your email for your
                    welcome message with all the details about your epic journey
                    ahead.
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

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>

            <div className="flex animate-scroll whitespace-nowrap">
              <div className="flex space-x-20 pr-20">
                <div className="flex items-center justify-center w-[200px]">
                  <Image
                    src="https://ik.imagekit.io/ulajgq5pme/output-onlinepngtools.png?updatedAt=1754142825193"
                    alt="GSSOC"
                    width={180}
                    height={60}
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex items-center justify-center w-[200px]">
                  <span className="text-3xl font-bold text-muted-foreground hover:text-foreground transition-colors duration-300">
                    AI GRANT
                  </span>
                </div>
                <div className="flex items-center justify-center w-[200px]">
                  <Image
                    src="https://ik.imagekit.io/ulajgq5pme/output-onlinepngtools.png?updatedAt=1754142825193"
                    alt="GSSOC"
                    width={180}
                    height={60}
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex items-center justify-center w-[200px]">
                  <span className="text-3xl font-bold text-muted-foreground hover:text-foreground transition-colors duration-300">
                    AI GRANT
                  </span>
                </div>
              </div>
              <div className="flex space-x-20 pr-20">
                <div className="flex items-center justify-center w-[200px]">
                  <Image
                    src="https://ik.imagekit.io/ulajgq5pme/output-onlinepngtools.png?updatedAt=1754142825193"
                    alt="GSSOC"
                    width={180}
                    height={60}
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex items-center justify-center w-[200px]">
                  <span className="text-3xl font-bold text-muted-foreground hover:text-foreground transition-colors duration-300">
                    AI GRANT
                  </span>
                </div>
                <div className="flex items-center justify-center w-[200px]">
                  <Image
                    src="https://ik.imagekit.io/ulajgq5pme/output-onlinepngtools.png?updatedAt=1754142825193"
                    alt="GSSOC"
                    width={180}
                    height={60}
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="flex items-center justify-center w-[200px]">
                  <span className="text-3xl font-bold text-muted-foreground hover:text-foreground transition-colors duration-300">
                    AI GRANT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 text-foreground">
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-14">
            {/* About Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/images/guild-logo.png"
                  alt="The Adventurers Guild logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-lg font-bold">The Adventurers Guild</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Forging digital pioneers through real-world quests, mentorship,
                and community.
              </p>
            </div>

            {/* Info Links */}
            <div>
              <h4 className="font-semibold text-base mb-4">Info</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/about"
                    aria-label="About Us"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    aria-label="How It Works"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    aria-label="Frequently Asked Questions"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    aria-label="Contact Us"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-base mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/terms"
                    aria-label="Terms of Service"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    aria-label="Privacy Policy"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    aria-label="Returns Policy"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    Returns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    aria-label="Shipping Information"
                    className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
                  >
                    Shipping
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-base mb-4">
                Join Our Newsletter
              </h4>
              <form
                className="flex flex-col sm:flex-row items-center gap-3"
                aria-label="Newsletter Signup"
              >
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 text-sm"
                  aria-label="Email Address"
                  required
                />
                <Button type="submit" className="px-5 py-2 text-sm">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3">
                By subscribing, you agree to our{" "}
                <Link
                  href="/privacy"
                  aria-label="Read our Privacy Policy"
                  className="underline hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            {/* Payment Icons */}
            <div
              className="flex items-center gap-4"
              aria-label="Supported Payment Methods"
            >
              <Image
                src="/images/visa.png"
                alt="Visa payment option"
                width={60}
                height={20}
                className="object-contain"
              />
              <Image
                src="/images/mastercard.png"
                alt="Mastercard payment option"
                width={60}
                height={20}
                className="object-contain"
              />
              <Image
                src="/images/Paypal.png"
                alt="PayPal payment option"
                width={60}
                height={20}
                className="object-contain"
              />
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <Link
                href="https://linkedin.com/company/adventurers-guild"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
              >
                <Linkedin className="w-5 h-5 hover:text-foreground transition-colors" />
              </Link>
              <Link
                href="https://twitter.com/"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
              >
                <Twitter className="w-5 h-5 hover:text-foreground transition-colors" />
              </Link>
              <Link
                href="https://github.com/LarytheLord/Adventurers-Guild"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground rounded"
              >
                <Github className="w-5 h-5 hover:text-foreground transition-colors" />
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-center">
              © {new Date().getFullYear()} The Adventurers Guild. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Go to Top Button */}
      <GoToTop />
    </div>
  );
}
