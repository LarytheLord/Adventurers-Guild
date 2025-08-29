
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Database } from "@/types/supabase"
import { useState } from "react"

type Quest = Database['public']['Tables']['quests']['Row'];

const applicationSchema = z.object({
  cover_letter: z.string().min(1, "Cover letter is required"),
  proposed_timeline: z.string().min(1, "Proposed timeline is required"),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

interface QuestApplicationDialogProps {
  quest: Quest
}

export function QuestApplicationDialog({ quest }: QuestApplicationDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  })

  const onSubmit = async (data: ApplicationFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to apply for a quest.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/quests/${quest.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, user_id: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to apply for quest")
      }

      toast({
        title: "Success",
        description: "Application submitted successfully.",
      })
      reset()
      setOpen(false)
    } catch (error: unknown) {
      console.error(error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to apply for quest. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Apply for Quest</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for {quest.title}</DialogTitle>
          <DialogDescription>
            Submit your application for this quest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cover_letter" className="text-right">
              Cover Letter
            </Label>
            <Textarea id="cover_letter" {...register("cover_letter")} className="col-span-3" />
            {errors.cover_letter && <p className="col-span-4 text-red-500 text-xs">{errors.cover_letter.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="proposed_timeline" className="text-right">
              Proposed Timeline
            </Label>
            <Input id="proposed_timeline" {...register("proposed_timeline")} className="col-span-3" />
            {errors.proposed_timeline && <p className="col-span-4 text-red-500 text-xs">{errors.proposed_timeline.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Submit Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
