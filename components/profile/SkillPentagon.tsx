
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Skill {
  name: string
  value: number
  description: string
}

export function SkillPentagon({ skills, onSkillSelect }: { 
  skills: Skill[]
  onSkillSelect: (skill: Skill) => void 
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Skill Pentagon</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.map((skill) => (
            <div 
              key={skill.name}
              className="cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => onSkillSelect(skill)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{skill.name}</span>
                <span className="text-sm text-muted-foreground">{skill.value}%</span>
              </div>
              <Progress value={skill.value} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
