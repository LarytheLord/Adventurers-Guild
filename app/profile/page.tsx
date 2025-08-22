'use client'
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Toaster } from "@/components/ui/toaster";
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { SkillPentagon } from "@/components/profile/SkillPentagon";
import { SkillDetail } from "@/components/profile/SkillDetail";
import { useAuth } from '@/hooks/useAuth';

// This will be populated from the authenticated user



export default function ProfilePage() {
  const { profile, loading } = useAuth();
  const [skills, setSkills] = useState<any[]>([]); // New state for fetched skills
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !profile) {
      window.location.href = '/login';
    }

    const fetchSkills = async () => {
      try {
        const response = await fetch('/api/skills');
        const data = await response.json();
        const transformedSkills = data.skills.map((skill: any) => ({
              ...skill,
              value: (skill.level / skill.max_level) * 100, // Calculate proficiency value
            }));
            setSkills(transformedSkills);
        if (data.skills.length > 0) {
          setSelectedSkill(data.skills[0]);
        }
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };

    fetchSkills();
  }, [profile, loading]);

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  // Create user object compatible with existing profile components
  const profileUser = {
    name: profile.name,
    avatar: profile.avatar_url || "/placeholder-user.jpg",
    rank: profile.rank || "F",
    xp: profile.xp || 0,
    xpNextLevel: 25000,
    bio: profile.bio || "A passionate developer on a quest to master the art of coding and build amazing things.",
    social: {
      github: profile.github_url || "https://github.com",
      linkedin: profile.linkedin_url || "https://linkedin.com",
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
            <div className="mt-8 bg-card p-4 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <UserProfileForm />
            </div>
          </div>
        </div>
      </div>
    <Toaster />
    </div>
