
'use client'

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

interface Skill {
  id: string;
  name: string;
  description: string;
  max_level: number;
  points_per_level: number;
  is_unlocked: boolean;
  level: number;
  skill_points: number;
}

export function SkillDetail({ skill }: { skill: Skill | null }) {
  const { user } = useAuth();
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Skill Details</CardTitle>
      </CardHeader>
      <CardContent>
        {skill ? (
          <div>
            <h3 className="text-xl font-bold mb-4">{skill.name}</h3>
            <p className="text-muted-foreground mt-4 mb-4">
              {skill.description}
            </p>
            {skill.is_unlocked ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Level</span>
                  <span>{skill.level} / {skill.max_level}</span>
                </div>
                <Progress value={(skill.level / skill.max_level) * 100} className="[&>div]:bg-primary" />
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">Skill Points</span>
                  <span>{skill.skill_points} / {skill.max_level * skill.points_per_level}</span>
                </div>
                <Progress value={(skill.skill_points / (skill.max_level * skill.points_per_level)) * 100} className="[&>div]:bg-secondary" />
              </div>
            ) : (
              <Button
                onClick={async () => {
                  if (!user) {
                    toast({
                      title: "Error",
                      description: "You must be logged in to unlock skills.",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const response = await fetch("/api/user_skills/unlock", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ user_id: user.id, skill_id: skill.id }),
                    });

                    if (!response.ok) {
                      throw new Error("Failed to unlock skill");
                    }

                    toast({
                      title: "Success",
                      description: `${skill.name} unlocked successfully!`, 
                    });
                    // Optionally, refresh profile data to show unlocked skill
                  } catch (error: unknown) {
                    console.error(error);
                    toast({
                      title: "Error",
                      description: error.message || "Failed to unlock skill. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Unlock Skill
              </Button>
            )}
          </div>
        ) : (
          <p>Select a skill to see details.</p>
        )}
      </CardContent>
    </Card>
  );
}
