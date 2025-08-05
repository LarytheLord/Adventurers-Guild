'use client'
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { SkillPentagon } from "@/components/profile/SkillPentagon";
import { SkillDetail } from "@/components/profile/SkillDetail";
import { useState } from "react";

const user = {
  name: "LaryTheLord",
  avatar: "/placeholder-user.jpg",
  rank: "S",
  xp: 24500,
  xpNextLevel: 25000,
  bio: "A passionate developer on a quest to master the art of coding and build amazing things.",
  social: {
    github: "https://github.com/LarytheLord",
    linkedin: "https://www.linkedin.com/in/larythelord/",
    twitter: "https://twitter.com/larythelord",
  },
  banner: "/images/profile-banner.png",
};

const skills = [
    { name: 'Frontend', value: 90, description: 'Mastery of modern frontend technologies including React, Next.js, and Tailwind CSS.' },
    { name: 'Backend', value: 75, description: 'Proficient in building robust and scalable backend systems with Node.js, Express, and databases.' },
    { name: 'AI/ML', value: 60, description: 'Experience in developing AI-powered features and working with machine learning models.' },
    { name: 'DevOps', value: 50, description: 'Knowledge of CI/CD pipelines, containerization with Docker, and cloud deployment.' },
    { name: 'Soft Skills', value: 80, description: 'Excellent communication, teamwork, and problem-solving abilities.' },
];

export default function ProfilePage() {
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative h-48 md:h-64">
        <Link href="/home" className="absolute top-4 left-4 z-10 bg-background/50 p-2 rounded-full hover:bg-background/80 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <img src={user.banner} alt="Profile Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UserProfileCard user={user} />
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
