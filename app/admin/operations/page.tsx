"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { Loader2, RefreshCw, ArrowLeft, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface OperationRow {
  id: string;
  questId: string;
  questTitle: string;
  questTrack: string;
  questDifficulty: string;
  xpReward: number;
  monetaryReward: string | null;
  deadline: string | null;
  daysToDeadline: number | null;
  userId: string;
  userName: string;
  userEmail: string;
  userRank: string;
  status: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  submittedAt: string | null;
  progress: number;
  lastUpdateAt: string | null;
  isStale: boolean;
  isUpdateOverdue: boolean;
  hasSubmission: boolean;
  isReviewed: boolean;
  latestSubmission: { submittedAt: string; qualityScore: number | null; isReviewed: boolean } | null;
  latestUpdate: { createdAt: string; yesterday: string; today: string; blockers: string | null } | null;
}

interface OperationsData {
  success: boolean;
  assignments: OperationRow[];
  total: number;
  summary: {
    totalActive: number;
    stale: number;
    updateOverdue: number;
    pendingReview: number;
    needsRework: number;
    hasSubmission: number;
  };
}

const TRACK_COLORS: Record<string, string> = {
  BOOTCAMP: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INTERN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  OPEN: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  started: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  pending_admin_review: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  needs_rework: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export default function OperationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<OperationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [router, session, status]);

  const fetchOperations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (trackFilter !== "all") params.set("track", trackFilter);
      const res = await fetchWithAuth(`/api/admin/operations?${params}`);
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to load operations data");
      }
      setData(result as OperationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, trackFilter]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchOperations();
    }
  }, [status, session, fetchOperations]);

  const filteredAssignments = useMemo(() => {
    if (!data) return [];
    return data.assignments;
  }, [data]);

  const tracks = useMemo(() => {
    if (!data) return [];
    const unique = new Set(data.assignments.map((a) => a.questTrack));
    return Array.from(unique).sort();
  }, [data]);

  const statusCounts = useMemo(() => {
    if (!data) return {};
    const counts: Record<string, number> = {};
    data.assignments.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [data]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Operations Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Every active quest assignment with status, updates, QA progress, and deadlines.
          </p>
        </div>

        <Button onClick={fetchOperations} variant="outline" className="border-slate-800 hover:bg-slate-800 text-white bg-slate-900 gap-1.5 self-start">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">{data.summary.totalActive}</CardTitle>
              <CardDescription className="text-slate-500">Active Assignments</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-rose-400">{data.summary.stale}</CardTitle>
              <CardDescription className="text-slate-500">Stale (&gt;48h)</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-amber-400">{data.summary.updateOverdue}</CardTitle>
              <CardDescription className="text-slate-500">Update Overdue (&gt;24h)</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-400">{data.summary.pendingReview}</CardTitle>
              <CardDescription className="text-slate-500">Pending QA Review</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-rose-400">{data.summary.needsRework}</CardTitle>
              <CardDescription className="text-slate-500">Needs Rework</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-emerald-400">{data.summary.hasSubmission}</CardTitle>
              <CardDescription className="text-slate-500">Has Submission</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="started">Started</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_admin_review">Pending QA Review</option>
            <option value="needs_rework">Needs Rework</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Track:</span>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Tracks</option>
            {tracks.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md text-white">
        <CardHeader>
          <CardTitle>Active Assignments ({filteredAssignments.length})</CardTitle>
          <CardDescription className="text-slate-400">
            Click on a student name to view their QA queue detail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {filteredAssignments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Badge variant="outline" className="border-emerald-500/20">✓</Badge>
              </div>
              <h3 className="font-semibold text-white">No active assignments</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                All quests have been completed or no assignments match the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Adventurer</th>
                    <th className="px-4 py-3">Quest</th>
                    <th className="px-4 py-3">Track</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Last Update</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">QA</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAssignments.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/qa-queue/${row.id}`}
                          className="font-medium text-white hover:text-orange-400 transition-colors flex items-center gap-1"
                        >
                          {row.userName}
                          <LinkIcon className="h-3 w-3 text-slate-600" />
                        </Link>
                        <div className="text-[10px] text-slate-500">{row.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate">
                        <div className="text-white font-medium">{row.questTitle}</div>
                        <div className="text-[10px] text-slate-500">{row.questDifficulty} · {row.xpReward} XP</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border ${TRACK_COLORS[row.questTrack] ?? "border-slate-700"}`}>
                          {row.questTrack}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border ${STATUS_COLORS[row.status] ?? "border-slate-700"}`}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(Number(row.progress), 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">{Math.round(Number(row.progress))}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.lastUpdateAt ? (
                          <div className="flex flex-col">
                            <span className={`text-xs font-medium ${row.isStale ? "text-rose-400" : row.isUpdateOverdue ? "text-amber-400" : "text-emerald-400"}`}>
                              {row.isStale ? "Stale" : row.isUpdateOverdue ? "Overdue" : "OK"}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(row.lastUpdateAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">No update</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.daysToDeadline != null ? (
                          <span className={`text-xs font-medium ${
                            row.daysToDeadline < 0 ? "text-rose-400" :
                            row.daysToDeadline <= 3 ? "text-amber-400" :
                            "text-emerald-400"
                          }`}>
                            {row.daysToDeadline < 0 ? "Past" : `${row.daysToDeadline}d`}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">No deadline</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.hasSubmission ? (
                          <div className="flex flex-col">
                            <Badge variant="outline" className={`text-xs border ${row.isReviewed ? "border-emerald-500/20 text-emerald-400" : "border-amber-500/20 text-amber-400"}`}>
                              {row.isReviewed ? "Reviewed" : "Submitted"}
                            </Badge>
                            {row.latestSubmission?.qualityScore != null && (
                              <span className="text-[10px] text-slate-500 mt-0.5">Score: {row.latestSubmission.qualityScore}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">Not submitted</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/qa-queue/${row.id}`}
                          className="text-xs text-orange-400 hover:text-orange-300 font-medium inline-flex items-center gap-1"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
