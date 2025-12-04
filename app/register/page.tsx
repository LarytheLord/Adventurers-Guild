// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Code2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { motion } from 'framer-motion';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'adventurer' | 'company'>('adventurer');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user) {
        setSuccess(true);

        // Add user to our users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              role,
              rank: 'F',
              xp: 0,
              skill_points: 0,
              level: 1,
            },
          ]);

        if (insertError) {
          console.error('Error inserting user:', insertError);
        }

        // If user is a company, create company profile
        if (role === 'company') {
          const { error: companyProfileError } = await supabase
            .from('company_profiles')
            .insert([
              {
                user_id: data.user.id,
                company_name: companyName || name,
                is_verified: false,
              },
            ]);

          if (companyProfileError) {
            console.error('Error creating company profile:', companyProfileError);
          }
        }

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Adventurers Guild</span>
          </Link>
          <p className="text-muted-foreground">Begin your journey.</p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Registration Successful!</h3>
              <p className="text-muted-foreground mb-6">
                Please check your email to verify your account.
              </p>
              <p className="text-sm text-primary animate-pulse">
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-300">Account Type</Label>
                <Select value={role} onValueChange={(value: 'adventurer' | 'company') => setRole(value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/10 text-white">
                    <SelectItem value="adventurer">Adventurer (Student)</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role === 'company' && (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-300">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 h-11"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}