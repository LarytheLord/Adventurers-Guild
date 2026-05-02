"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { getErrorMessageFromPayload, getStatusFallbackMessage, readResponsePayload } from "@/lib/http";

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
      const response = await fetchWithAuth('/api/quests/assignments', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questId }),
      });

      const data = await readResponsePayload<Record<string, unknown>>(response);

      if (!response.ok) {
        throw new Error(getErrorMessageFromPayload(data, getStatusFallbackMessage(response.status)));
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
