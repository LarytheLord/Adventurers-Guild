
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Skill {
  name: string
  value: number
  description: string
}

export function SkillDetail({ skill }: { skill: Skill | null }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Skill Details</CardTitle>
      </CardHeader>
      <CardContent>
        {skill ? (
          <div>
            <h3 className="text-xl font-bold mb-4">{skill.name}</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Proficiency</span>
              <span>{skill.value}%</span>
            </div>
            <Progress value={skill.value} className="[&>div]:bg-primary" />
            <p className="text-muted-foreground mt-4">
              {skill.description}
            </p>
          </div>
        ) : (
          <p>Select a skill to see details.</p>
        )}
      </CardContent>
    </Card>
  );
}
