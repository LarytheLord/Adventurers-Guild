
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export function UserProfileCard({ user }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col items-center text-center p-0">
        <div className="relative w-full h-24 bg-muted" />
        <Avatar className="w-32 h-32 -mt-16 border-4 border-background">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="p-6">
          <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.rank}-Rank Adventurer</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-center mb-6">{user.bio}</p>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">XP</span>
            <span>{user.xp.toLocaleString()} / {user.xpNextLevel.toLocaleString()}</span>
          </div>
          <Progress value={(user.xp / user.xpNextLevel) * 100} />
        </div>
        <div className="flex justify-center space-x-4">
          <Link href={user.social.github} passHref>
            <Button variant="outline" size="icon">
              <Github className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={user.social.linkedin} passHref>
            <Button variant="outline" size="icon">
              <Linkedin className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={user.social.twitter} passHref>
            <Button variant="outline" size="icon">
              <Twitter className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
