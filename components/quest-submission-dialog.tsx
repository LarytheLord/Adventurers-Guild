"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FieldRenderer } from "@/components/quest/field-renderer";
import { FieldDisplay } from "@/components/quest/field-display";
import {
  asFieldDefs,
  asFieldValues,
  validateFieldValues,
  fieldValuesToText,
  type FieldValue,
  type FieldValues,
} from "@/lib/quest-field-templates";

interface QuestSubmissionDialogProps {
  questTitle: string;
  assignmentId: string;
  questId?: string;
}

interface QuestContext {
  detailedDescription: string | null;
  acceptanceCriteria: string[];
  briefData: FieldValues;
  briefFields: ReturnType<typeof asFieldDefs>;
  submissionFields: ReturnType<typeof asFieldDefs>;
}

export function QuestSubmissionDialog({ questTitle, assignmentId, questId }: QuestSubmissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCtx, setLoadingCtx] = useState(false);
  const [ctx, setCtx] = useState<QuestContext | null>(null);
  const [values, setValues] = useState<FieldValues>({});
  const [notes, setNotes] = useState("");
  const router = useRouter();

  const loadContext = useCallback(async () => {
    if (!questId) return;
    setLoadingCtx(true);
    try {
      const res = await fetch(`/api/quests/${questId}`);
      const data = await res.json();
      const q = data?.quest;
      if (q) {
        setCtx({
          detailedDescription: q.detailedDescription ?? null,
          acceptanceCriteria: Array.isArray(q.acceptanceCriteria) ? q.acceptanceCriteria : [],
          briefData: asFieldValues(q.briefData),
          briefFields: asFieldDefs(q.fieldTemplate?.briefFields),
          submissionFields: asFieldDefs(q.fieldTemplate?.submissionFields),
        });
      }
    } catch {
      /* fall back to free-form below */
    } finally {
      setLoadingCtx(false);
    }
  }, [questId]);

  useEffect(() => {
    if (open && questId && !ctx) loadContext();
  }, [open, questId, ctx, loadContext]);

  const submissionFields = ctx?.submissionFields ?? [];
  const updateValue = (key: string, value: FieldValue) => setValues((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Structured path when the quest has a template; otherwise free-form notes.
    if (submissionFields.length > 0) {
      const errs = validateFieldValues(submissionFields, values);
      if (errs.length > 0) {
        toast.error(errs[0]);
        return;
      }
    } else if (!notes.trim()) {
      toast.error("Please describe your work.");
      return;
    }

    setIsLoading(true);
    try {
      const structuredText = submissionFields.length > 0 ? fieldValuesToText(submissionFields, values) : "";
      const submissionContent = [structuredText, notes.trim()].filter(Boolean).join("\n\n") || notes.trim();

      const response = await fetch("/api/quests/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          submissionContent,
          submissionNotes: notes.trim() || undefined,
          submissionData: submissionFields.length > 0 ? values : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Failed to submit");

      toast.success("Work submitted successfully!");
      setOpen(false);
      setValues({});
      setNotes("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Submit Work
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Submit Quest: {questTitle}</DialogTitle>
          <DialogDescription>
            Fill every field the client asked for — this is exactly what the reviewer evaluates.
          </DialogDescription>
        </DialogHeader>

        {/* Brief recap — carries the company's context to the submitter. */}
        {ctx && (ctx.briefFields.length > 0 || ctx.acceptanceCriteria.length > 0 || ctx.detailedDescription) && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">The brief</p>
            {ctx.detailedDescription && (
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ctx.detailedDescription}</p>
            )}
            {ctx.briefFields.length > 0 && (
              <FieldDisplay fields={ctx.briefFields} values={ctx.briefData} hideEmpty />
            )}
            {ctx.acceptanceCriteria.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  You will be evaluated on
                </p>
                <ul className="space-y-1">
                  {ctx.acceptanceCriteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {loadingCtx && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading the brief…
              </p>
            )}

            {submissionFields.length > 0 ? (
              <FieldRenderer fields={submissionFields} values={values} onChange={updateValue} idPrefix="sub" />
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="content">Description &amp; deliverable links</Label>
                <Textarea
                  id="content"
                  placeholder="Describe what you built and paste links (GitHub PR, deployed site, etc.)."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  required
                />
              </div>
            )}

            {submissionFields.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="notes">Anything else for the reviewer (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Extra context, questions, or caveats."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
