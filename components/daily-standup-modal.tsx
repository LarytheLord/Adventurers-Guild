"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Loader2, AlertCircle } from "lucide-react";

interface DailyStandupModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  onSuccess?: () => void;
  tasks?: string[];
  completedTasks?: string[];
  questTitle?: string;
  xpReward?: number;
}

export function DailyStandupModal({ 
  isOpen, 
  onClose, 
  assignmentId, 
  onSuccess,
  tasks = [],
  completedTasks = [],
  questTitle = "Active Quest",
  xpReward
}: DailyStandupModalProps) {
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImportCompleted = () => {
    if (!completedTasks || completedTasks.length === 0) {
      toast.info("No completed tasks found in checklist.");
      return;
    }
    const formatted = completedTasks.map(t => `- Completed: ${t}`).join("\n");
    setYesterday(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n${formatted}` : formatted;
    });
    toast.success("Completed tasks appended to Yesterday's update!");
  };

  const handleImportRemaining = () => {
    if (!tasks || tasks.length === 0) {
      toast.info("No tasks found in checklist.");
      return;
    }
    const remaining = tasks.filter(t => !completedTasks.includes(t));
    if (remaining.length === 0) {
      toast.info("All checklist tasks are already completed!");
      return;
    }
    const formatted = remaining.map(t => `- Focus: ${t}`).join("\n");
    setToday(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n${formatted}` : formatted;
    });
    toast.success("Active targets appended to Today's update!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (yesterday.trim().length < 3) {
      toast.error("Please describe what you did yesterday.");
      return;
    }
    if (today.trim().length < 3) {
      toast.error("Please describe what you plan to do today.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quests/assignments/${assignmentId}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yesterday,
          today,
          blockers: blockers.trim() || undefined,
          evidenceUrl: evidenceUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit daily update");
      }

      toast.success("Daily standup submitted successfully! Your Guild Score has been updated.");
      setYesterday("");
      setToday("");
      setBlockers("");
      setEvidenceUrl("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const blockerChips = [
    "No blockers",
    "Waiting on feedback",
    "Technical blocker",
    "API / Server down"
  ];

  const evidenceChips = [
    { label: "GitHub PR", prefix: "https://github.com/" },
    { label: "Figma", prefix: "https://figma.com/" },
    { label: "Loom", prefix: "https://loom.com/" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row md:max-h-[80vh] h-auto md:h-[620px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side: Info & Task Assistant Panel */}
        <div className="relative w-full md:w-[320px] bg-slate-50 text-slate-900 p-5 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0 overflow-visible md:overflow-y-auto md:max-h-none">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          
          <div className="relative z-10 space-y-5">
            {/* Scroll Indicator */}
            <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full w-fit">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Guild Standup Scroll</span>
            </div>

            {/* Quest Info */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Quest</span>
              <h2 className="text-base font-bold font-display tracking-tight text-slate-900 line-clamp-2 leading-tight">
                {questTitle}
              </h2>
              {xpReward && (
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-orange-500/10 w-fit px-2.5 py-1 rounded-lg border border-orange-500/20">
                  <span>+{xpReward} XP Reward</span>
                </div>
              )}
            </div>

            {/* Task Assistant */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  Checklist Assistant
                </span>
                {tasks.length > 0 && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {completedTasks.length}/{tasks.length} Done
                  </span>
                )}
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-2">
                  <div className="space-y-1.5 max-h-[160px] overflow-visible md:overflow-y-auto pr-1 md:scrollbar-thin md:scrollbar-thumb-slate-300 md:scrollbar-track-transparent">
                    {tasks.map((task, i) => {
                      const isDone = completedTasks.includes(task);
                      return (
                        <div key={i} className="flex items-start gap-2 bg-white border border-slate-200 p-2 rounded-xl text-[11px] leading-tight font-sans">
                          <span className={`mt-0.5 flex-shrink-0 h-3 w-3 rounded flex items-center justify-center ${isDone ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-500'}`}>
                            {isDone ? <span className="text-[10px]">✓</span> : <div className="h-1 w-1 rounded-full bg-slate-300" />}
                          </span>
                          <span className={`flex-1 ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2 pt-2">
                    {completedTasks.length > 0 && (
                      <button
                        type="button"
                        onClick={handleImportCompleted}
                        className="w-full text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl transition-all flex items-center justify-between group"
                      >
                        <span>Import Completed</span>
                      </button>
                    )}
                    {tasks.filter(t => !completedTasks.includes(t)).length > 0 && (
                      <button
                        type="button"
                        onClick={handleImportRemaining}
                        className="w-full text-left bg-orange-50 hover:bg-orange-100 border border-orange-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-xl transition-all flex items-center justify-between group"
                      >
                        <span>Import Objectives</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-[11px]">No check-list targets assigned for this quest.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer of Left Panel */}
          <div className="relative z-10 pt-4 border-t border-slate-200 mt-6 hidden md:block">
            <p className="text-[10px] text-slate-500 leading-normal font-sans">
              Reports should be submitted every 24 hours to prove active contribution.
            </p>
          </div>
        </div>

        {/* Right Side: Standup Inputs Form */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-visible md:overflow-y-auto md:max-h-none">
          {/* Header */}
          <div className="border-b border-slate-100 p-5 md:p-6 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-bold font-display tracking-tight text-slate-900">Daily Standup</h3>
              <p className="text-xs text-slate-500">Provide details on your progress and work evidence.</p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 overflow-visible md:overflow-y-auto flex-1">
            
            {/* Yesterday Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                Yesterday&apos;s Work <span className="text-orange-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="What did you complete? List features, fixes, or deliverables..."
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 placeholder-slate-400 resize-none transition-all shadow-sm"
              />
            </div>

            {/* Today Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                Today&apos;s Objectives <span className="text-orange-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="What are your goals for today? What will you commit next?"
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 placeholder-slate-400 resize-none transition-all shadow-sm"
              />
            </div>

            {/* Blockers Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                Blockers (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Any technical issues, missing documentation, or dependencies?"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 placeholder-slate-400 resize-none transition-all shadow-sm"
              />
              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {blockerChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBlockers(chip)}
                    className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                Work Evidence URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/... or Figma, Loom, etc."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 placeholder-slate-400 transition-all shadow-sm"
              />
              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5 items-center justify-between">
                <div className="flex gap-1.5">
                  {evidenceChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEvidenceUrl(chip.prefix)}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">Proof of progress is validated by Guild Admins.</p>
              </div>
            </div>

            {/* Standup Penalty Note - Clean neutral style to avoid orange */}
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-[11px] text-rose-800 leading-normal items-start">
              <p>
                Missed standups result in a <strong className="text-rose-900">5% penalty</strong> to your final quest payout and lower your reliability. Payouts are calculated dynamically at approval.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || yesterday.trim().length < 3 || today.trim().length < 3}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-[0.99] border border-orange-500/50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    Submit Standup Update
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
