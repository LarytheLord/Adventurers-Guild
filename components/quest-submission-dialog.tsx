"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuestSubmissionDialogProps {
  questTitle: string;
  assignmentId: string;
}

export function QuestSubmissionDialog({ questTitle, assignmentId }: QuestSubmissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submissionContent = link
        ? `${content}\n\nDeliverable link: ${link}`
        : content;

      const response = await fetch('/api/quests/submissions', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          submissionContent,
          submissionNotes: link ? `Deliverable link: ${link}` : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to submit");
      }

      toast.success("Work submitted successfully!");
      setOpen(false);
      setContent("");
      setLink("");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Quest: {questTitle}</DialogTitle>
          <DialogDescription>
            Provide details about your work and links to your deliverables (GitHub PR, deployed site, etc.).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link">Project Link</Label>
              <Input
                id="link"
                placeholder="https://github.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Description & Notes</Label>
              <Textarea
                id="content"
                placeholder="Describe what you built..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>
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
