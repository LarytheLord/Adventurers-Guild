"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestSubmissionDialog } from "@/components/quest-submission-dialog";
import { DailyStandupModal } from "./daily-standup-modal";
import { Clock, CheckCircle2, AlertTriangle, ListTodo, CalendarDays, Play } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

export function MyQuestCard({ initialAssignment }: { initialAssignment: any }) {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [isStandupOpen, setIsStandupOpen] = useState(false);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const quest = assignment.quest;
  const tasks = quest.tasks || [];
  const completedTasks = assignment.completedTasks || [];
  const progress = assignment.progress || 0;

  // Check if daily standup is overdue (older than 24h)
  const isStandupOverdue = () => {
    if (!["assigned", "started", "in_progress", "needs_rework"].includes(assignment.status)) {
      return false;
    }
    const lastUpdate = assignment.lastUpdateAt || assignment.startedAt || assignment.assignedAt;
    if (!lastUpdate) return false;

    const lastUpdateTime = new Date(lastUpdate).getTime();
    const timeSince = Date.now() - lastUpdateTime;
    return timeSince > 24 * 60 * 60 * 1000;
  };

  const handleToggleTask = async (taskName: string) => {
    const isCompleted = completedTasks.includes(taskName);
    setTogglingTask(taskName);

    try {
      const res = await fetch(`/api/quests/assignments/${assignment.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName,
          completed: !isCompleted,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      setAssignment((prev: any) => ({
        ...prev,
        completedTasks: data.assignment.completedTasks,
        progress: data.assignment.progress,
      }));
      toast.success(isCompleted ? "Task marked incomplete" : "Task completed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setTogglingTask(null);
    }
  };

  const isCompletedStatus = assignment.status === "completed";
  const isUnderReviewStatus = assignment.status === "submitted" || assignment.status === "pending_admin_review";
  const isActive = ["started", "in_progress", "needs_rework"].includes(assignment.status);
  const isJustAssigned = assignment.status === "assigned";

  const handleStartQuest = async () => {
    setIsStarting(true);
    try {
      const res = await fetchWithAuth(`/api/quests/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.error || "Failed to start quest"); return; }
      setAssignment((prev: any) => ({ ...prev, status: "in_progress" }));
      toast.success("Quest started! Use the Submit Work button when ready.");
    } catch { toast.error("Failed to start quest"); }
    finally { setIsStarting(false); }
  };

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden border-slate-200 bg-white shadow-sm text-slate-900 transition-all hover:shadow-md hover:border-slate-300">
      <div
        className={`w-full h-2 md:w-2 md:h-auto ${
          isCompletedStatus
            ? "bg-emerald-500"
            : isUnderReviewStatus
            ? "bg-amber-500"
            : "bg-blue-500"
        }`}
      />
      <div className="flex-1 flex flex-col">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Badge
                className={
                  isCompletedStatus
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                    : isUnderReviewStatus
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                    : "bg-blue-500/15 text-blue-400 border-blue-500/20"
                }
              >
                {assignment.status.replaceAll("_", " ").toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-500">{quest.company?.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Due {quest.deadline ? new Date(quest.deadline).toLocaleDateString() : "No deadline"}
              </span>
              <span className="text-orange-400 font-semibold">{quest.xpReward} XP</span>
              {quest.monetaryReward && (
                <span className="text-emerald-400 font-semibold">₹{Number(quest.monetaryReward)}</span>
              )}
            </div>
          </div>

          {/* Title & Warning */}
          <div>
            <h3 className="text-xl font-bold font-display tracking-tight text-slate-900 mb-2">{quest.title}</h3>
            


            {isStandupOverdue() && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs mt-3">
                <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <div>
                  <strong>Daily Update Overdue!</strong> Please submit a standup now to prevent a 5% reward penalty.
                </div>
              </div>
            )}
          </div>

          {/* To-Do Checklist & Progress */}
          {tasks.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <ListTodo className="h-3.5 w-3.5 text-slate-400" />
                  Quest Tasks
                </span>
                <span className="font-medium">{completedTasks.length} / {tasks.length} completed ({Math.round(progress)}%)</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Checkbox checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {tasks.map((task: string, idx: number) => {
                  const isChecked = completedTasks.includes(task);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={(!isActive && !isJustAssigned) || togglingTask === task}
                        checked={isChecked}
                        onChange={() => handleToggleTask(task)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 bg-white focus:ring-orange-500 focus:ring-offset-white cursor-pointer disabled:opacity-50"
                      />
                      <span className={isChecked ? "line-through" : ""}>
                        {togglingTask === task ? "Updating..." : task}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            {assignment.lastUpdateAt ? (
              <span>Last update: {new Date(assignment.lastUpdateAt).toLocaleString()}</span>
            ) : (
              <span>No daily updates submitted yet</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" asChild className="border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 shadow-sm">
              <Link href={`/dashboard/my-quests/${quest.id}/story`}>View Story</Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 shadow-sm">
              <Link href={`/dashboard/quests/${quest.id}`}>View Details</Link>
            </Button>
            
            {isJustAssigned && (
              <Button
                onClick={handleStartQuest}
                disabled={isStarting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
              >
                <Play className="h-4 w-4" />
                {isStarting ? "Starting…" : "Start Quest"}
              </Button>
            )}

            {isActive && (
              <>
                <Button
                  onClick={() => setIsStandupOpen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm flex items-center gap-1.5"
                >
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  Daily Standup
                </Button>

                <QuestSubmissionDialog
                  questTitle={quest.title}
                  assignmentId={assignment.id}
                  questId={quest.id}
                />
              </>
            )}

            {isUnderReviewStatus && (
              <Button disabled variant="secondary" className="bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                <CheckCircle2 className="mr-2 h-4 w-4 text-slate-400" />
                Under Review
              </Button>
            )}
          </div>
        </div>
      </div>

      <DailyStandupModal
        isOpen={isStandupOpen}
        onClose={() => setIsStandupOpen(false)}
        assignmentId={assignment.id}
        onSuccess={() => {
          // Refresh lastUpdateAt locally
          setAssignment((prev: any) => ({
            ...prev,
            lastUpdateAt: new Date().toISOString(),
          }));
        }}
        tasks={tasks}
        completedTasks={completedTasks}
        questTitle={quest.title}
        xpReward={quest.xpReward}
      />
    </Card>
  );
}
