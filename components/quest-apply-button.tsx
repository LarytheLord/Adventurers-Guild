"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuestApplyButtonProps {
  questId: string;
  isApplied?: boolean;
}

export function QuestApplyButton({ questId, isApplied = false }: QuestApplyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quests/${questId}/apply`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply");
      }

      toast.success("Application submitted successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button className="w-full h-12 text-lg font-semibold shadow-md" size="lg" onClick={handleApply} disabled={isLoading || isApplied}>
      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
      {isApplied ? "Applied" : "Accept Quest"}
    </Button>
  );
}