
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
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import { Database } from "@/types/supabase"
import { useState } from "react"

type Quest = Database['public']['Tables']['quests']['Row'];

const submissionSchema = z.object({
  submission_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  github_repo: z.string().url("Invalid URL").optional().or(z.literal("")),
  demo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
})

type SubmissionFormValues = z.infer<typeof submissionSchema>

interface QuestSubmissionDialogProps {
  quest: Quest
}

export function QuestSubmissionDialog({ quest }: QuestSubmissionDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
  })

  const onSubmit = async (data: SubmissionFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit for a quest.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/quests/${quest.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, user_id: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit for quest")
      }

      toast({
        title: "Success",
        description: "Submission submitted successfully.",
      })
      reset()
      setOpen(false)
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit for quest. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Submit Quest</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit for {quest.title}</DialogTitle>
          <DialogDescription>
            Submit your work for this quest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="submission_url" className="text-right">
              Submission URL
            </Label>
            <Input id="submission_url" {...register("submission_url")} className="col-span-3" />
            {errors.submission_url && <p className="col-span-4 text-red-500 text-xs">{errors.submission_url.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="github_repo" className="text-right">
              GitHub Repository
            </Label>
            <Input id="github_repo" {...register("github_repo")} className="col-span-3" />
            {errors.github_repo && <p className="col-span-4 text-red-500 text-xs">{errors.github_repo.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="demo_url" className="text-right">
              Demo URL
            </Label>
            <Input id="demo_url" {...register("demo_url")} className="col-span-3" />
            {errors.demo_url && <p className="col-span-4 text-red-500 text-xs">{errors.demo_url.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea id="description" {...register("description")} className="col-span-3" />
            {errors.description && <p className="col-span-4 text-red-500 text-xs">{errors.description.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
