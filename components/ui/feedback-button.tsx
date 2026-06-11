"use client";

import { useState, useRef } from "react";
import { X, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";

type FeedbackType = "Bug" | "Suggestion" | "Praise" | "Other";

const TYPES: { value: FeedbackType; emoji: string; label: string }[] = [
  { value: "Bug", emoji: "🐛", label: "Bug" },
  { value: "Suggestion", emoji: "💡", label: "Idea" },
  { value: "Praise", emoji: "🙌", label: "Praise" },
  { value: "Other", emoji: "💬", label: "Other" },
];

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("Bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const pathname = usePathname();

  const handleOpen = () => {
    setOpen(true);
    setStatus("idle");
    setMessage("");
    setEmail("");
    setErrorMsg("");
    setType("Bug");
  };

  const handleClose = () => {
    if (status === "loading") return;
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setErrorMsg("Please describe the issue in at least 5 characters.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, email, page: pathname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send feedback");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 rounded-lg transition-all"
      >
        <MessageSquare className="w-3 h-3" />
        Send Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Send Feedback</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">Report bugs, suggest features, or just say hi.</p>
              </div>
              <button
                onClick={handleClose}
                disabled={status === "loading"}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-[15px] font-semibold text-slate-900">Thanks for the feedback!</p>
                <p className="text-[13px] text-slate-500 max-w-[260px]">
                  We read every report and use it to make Guild better.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-2 px-5 py-2 text-[13px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5 space-y-4">
                {/* Type selector */}
                <div className="grid grid-cols-4 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        type === t.value
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <span className="text-base leading-none">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {type === "Bug" ? "What went wrong?" : type === "Suggestion" ? "What would you like to see?" : type === "Praise" ? "What did you love?" : "Your message"}
                    <span className="text-orange-500 ml-0.5">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={
                      type === "Bug"
                        ? "Describe what happened and where — page, action, what you expected vs what you got..."
                        : type === "Suggestion"
                        ? "Describe your idea — how would it work and why would it be useful..."
                        : type === "Praise"
                        ? "Tell us what you enjoyed..."
                        : "Anything on your mind..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 placeholder-slate-400 resize-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Your email <span className="text-slate-400 normal-case font-normal">(optional — so we can follow up)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 placeholder-slate-400 transition-all"
                  />
                </div>

                {errorMsg && (
                  <p className="text-[12px] text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || message.trim().length < 5}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Feedback"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
