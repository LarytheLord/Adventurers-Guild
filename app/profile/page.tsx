'use client'
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { SkillPentagon } from "@/components/profile/SkillPentagon";
import { SkillDetail } from "@/components/profile/SkillDetail";
import { useState, useEffect } from "react";
import { MockAuthService, User } from '@/lib/mockAuth';

// This will be populated from the authenticated user

const skills = [
    { name: 'Frontend', value: 90, description: 'Mastery of modern frontend technologies including React, Next.js, and Tailwind CSS.' },
    { name: 'Backend', value: 75, description: 'Proficient in building robust and scalable backend systems with Node.js, Express, and databases.' },
    { name: 'AI/ML', value: 60, description: 'Experience in developing AI-powered features and working with machine learning models.' },
    { name: 'DevOps', value: 50, description: 'Knowledge of CI/CD pipelines, containerization with Docker, and cloud deployment.' },
    { name: 'Soft Skills', value: 80, description: 'Excellent communication, teamwork, and problem-solving abilities.' },
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);

  useEffect(() => {
    const currentUser = MockAuthService.getCurrentUser()
    if (!currentUser) {
      window.location.href = '/login'
      return
    }
    setUser(currentUser)
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  // Create user object compatible with existing profile components
  const profileUser = {
    name: user.name,
    avatar: user.avatar_url || "/placeholder-user.jpg",
    rank: user.rank || "F",
    xp: user.xp || 0,
    xpNextLevel: 25000,
    bio: "A passionate developer on a quest to master the art of coding and build amazing things.",
    social: {
      github: user.github_url || "https://github.com",
      linkedin: user.linkedin_url || "https://linkedin.com",
      twitter: "https://twitter.com",
    },
    banner: "/placeholder.jpg", // Using existing placeholder
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative h-48 md:h-64">
        <Link href="/home" className="absolute top-4 left-4 z-10 bg-background/50 p-2 rounded-full hover:bg-background/80 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <img src={profileUser.banner} alt="Profile Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UserProfileCard user={profileUser} />
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-4 rounded-lg">
                <SkillPentagon skills={skills} onSkillSelect={setSelectedSkill} />
              </div>
              <div className="bg-card p-4 rounded-lg">
                <SkillDetail skill={selectedSkill} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
