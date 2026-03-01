'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Briefcase, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onRegister(event: React.FormEvent<HTMLFormElement>, role: 'adventurer' | 'client') {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get(role === 'client' ? "work-email" : "email") as string;
    const password = formData.get(role === 'client' ? "client-password" : "password") as string;
    const name = role === 'client' ? "" : formData.get("name") as string;
    const companyName = role === 'client' ? formData.get("company") as string : "";

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: role === 'client' ? companyName : name,
          role,
          companyName
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! Logging you in...");
      
      // Auto login after registration
      await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
      
    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Code2 className="mr-2 h-6 w-6" />
          Adventurers Guild
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform completely changed how I hire junior developers. The quest system ensures they actually have the skills they claim.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis, CTO at TechStart</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose your path to get started
            </p>
          </div>

          <Tabs defaultValue="adventurer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="adventurer">Adventurer</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
            </TabsList>
            
            <TabsContent value="adventurer">
              <form onSubmit={(e) => onRegister(e, 'adventurer')}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" type="text" autoCapitalize="none" autoCorrect="off" disabled={isLoading} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" placeholder="name@example.com" type="email" autoCapitalize="none" autoCorrect="off" disabled={isLoading} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" disabled={isLoading} required />
                  </div>
                  <Button className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <User className="mr-2 h-4 w-4" /> Sign Up as Adventurer
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="client">
              <form onSubmit={(e) => onRegister(e, 'client')}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" name="company" placeholder="Acme Inc." type="text" disabled={isLoading} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="work-email">Work Email</Label>
                    <Input id="work-email" name="work-email" placeholder="name@company.com" type="email" disabled={isLoading} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="client-password">Password</Label>
                    <Input id="client-password" name="client-password" type="password" disabled={isLoading} required />
                  </div>
                  <Button className="w-full" variant="secondary" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Briefcase className="mr-2 h-4 w-4" /> Sign Up as Client
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}