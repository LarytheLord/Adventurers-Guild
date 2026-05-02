'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Mail,
  Globe,
  Users,
  Target,
  CheckCircle,
  Clock,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { useApiFetch } from '@/lib/hooks';

export default function CompanyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const initializedProfile = useRef(false);
  const shouldFetch =
    status === 'authenticated' && (session?.user?.role === 'company' || session?.user?.role === 'admin');
  const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useApiFetch<{
    success: boolean;
    user: {
      name?: string | null;
      bio?: string | null;
      website?: string | null;
      createdAt: string;
    };
    companyProfile?: {
      companyName?: string | null;
      companyWebsite?: string | null;
      companyDescription?: string | null;
    } | null;
  }>('/api/users/me', { skip: !shouldFetch });
  const { data, loading } = useApiFetch<{ success: boolean; quests: Array<{ status: string }> }>(
    '/api/company/quests',
    { skip: !shouldFetch }
  );

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'company' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (status === 'authenticated') {
      setCompanyName(session?.user?.name || '');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (!profileData?.success || initializedProfile.current) {
      return;
    }

    setCompanyName(profileData.companyProfile?.companyName || profileData.user.name || session?.user?.name || '');
    setWebsite(profileData.companyProfile?.companyWebsite || profileData.user.website || '');
    setDescription(profileData.companyProfile?.companyDescription || profileData.user.bio || '');
    initializedProfile.current = true;
  }, [profileData, session?.user?.name]);

  const quests = data?.quests || [];
  const questCount = quests.length;
  const completedCount = quests.filter((quest) => quest.status === 'completed').length;
  const activeCount = quests.filter((quest) => !['completed', 'cancelled'].includes(quest.status)).length;
  const memberSince =
    profileData?.user?.createdAt
      ? new Date(profileData.user.createdAt).getFullYear()
      : 2025;

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: companyName.trim(),
      };

      if (session?.user?.role === 'company') {
        payload.companyName = companyName.trim();
        payload.companyWebsite = website.trim();
        payload.companyDescription = description.trim();
      } else {
        payload.website = website.trim();
        payload.bio = description.trim();
      }

      const res = await fetchWithAuth('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }
      await refetchProfile();
      router.refresh();
      toast.success('Company profile updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading || profileLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const companyInitials = companyName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CO';

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your company information and settings
        </p>
      </div>

      {/* Company Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {companyInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{companyName}</h2>
                <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Company Account
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{questCount}</div>
            <div className="text-xs text-muted-foreground">Total Quests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
      </div>

      {/* Company Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Update your company information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Email
            </Label>
            <Input
              id="email"
              value={session?.user?.email || ''}
              disabled
              className="h-11 bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell adventurers about your company..."
              rows={4}
            />
          </div>

          <Separator />

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
