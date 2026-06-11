"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { Loader2, Phone, AlertTriangle, ArrowLeft, RefreshCw, Award, UserX } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface MissedAssignment {
  assignmentId: string;
  questId: string;
  questTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  guildScore: number;
  lastUpdateAt: string | null;
  startedAt: string;
  hoursSinceLastUpdate: number;
}

export default function MissedUpdatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignments, setAssignments] = useState<MissedAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [router, session, status]);

  const fetchMissedUpdates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/admin/missed-updates");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load missed updates");
      }
      setAssignments(data.assignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchMissedUpdates();
    }
  }, [status, session, fetchMissedUpdates]);

  const sendWhatsAppNudge = (item: MissedAssignment) => {
    if (!item.studentPhone) {
      toast.error("Student does not have a phone number on record.");
      return;
    }

    const cleanPhone = item.studentPhone.replace(/\D/g, "");
    const message = `Hi ${item.studentName}, you are currently assigned to the quest "${item.questTitle}". We noticed you haven't submitted a daily standup update in ${item.hoursSinceLastUpdate} hours. Please submit your update in the dashboard to maintain your Guild Score (${item.guildScore}) and prevent reward deductions! Let us know if you have any blockers. Thanks, Adventurers Guild Team.`;
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    toast.success(`WhatsApp nudge window opened for ${item.studentName}`);
  };

  const handleReassign = async (assignmentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to cancel ${studentName}'s assignment and release the quest?`)) return;

    try {
      const res = await fetchWithAuth("/api/admin/updates/reassign", {
        method: "POST",
        body: JSON.stringify({ assignmentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      
      toast.success("Quest reassigned successfully");
      fetchMissedUpdates();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reassign quest");
    }
  };

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
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            Overdue Daily Updates
          </h1>
          <p className="text-sm text-slate-400">
            Active quest assignments that have missed the 24-hour update window.
          </p>
        </div>

        <Button onClick={fetchMissedUpdates} variant="outline" className="border-slate-800 hover:bg-slate-800 text-white bg-slate-900 gap-1.5 self-start">
          <RefreshCw className="h-4 w-4" />
          Refresh List
        </Button>
      </div>

      {/* Main Table */}
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md text-white">
        <CardHeader>
          <CardTitle>Missed Standups ({assignments.length})</CardTitle>
          <CardDescription className="text-slate-400">
            Nudge adventurers directly via WhatsApp to submit their daily updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {assignments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white">All caught up!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                Every active student has submitted their daily update in the last 24 hours.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Adventurer</th>
                    <th className="px-4 py-3">Guild Score</th>
                    <th className="px-4 py-3">Quest</th>
                    <th className="px-4 py-3">Last Update</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assignments.map((item) => (
                    <tr key={item.assignmentId} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-4 font-medium text-white">
                        <div>{item.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{item.studentEmail}</div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={`font-semibold ${
                          item.guildScore >= 80 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : item.guildScore >= 50 
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {item.guildScore} / 100
                        </Badge>
                      </td>
                      <td className="px-4 py-4 max-w-[200px] truncate">
                        {item.questTitle}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-rose-400 font-semibold text-xs">
                            {item.hoursSinceLastUpdate}h overdue
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {item.lastUpdateAt 
                              ? `Last: ${new Date(item.lastUpdateAt).toLocaleDateString()}` 
                              : `Started: ${new Date(item.startedAt).toLocaleDateString()}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => sendWhatsAppNudge(item)}
                            disabled={!item.studentPhone}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg gap-1.5 inline-flex items-center disabled:opacity-40 disabled:hover:bg-emerald-600"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Nudge
                          </Button>
                          <Button
                            onClick={() => handleReassign(item.assignmentId, item.studentName)}
                            variant="destructive"
                            className="text-xs font-bold py-1.5 px-3 rounded-lg gap-1.5 inline-flex items-center"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            Reassign
                          </Button>
                        </div>
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
