
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const questSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["F", "D", "C", "B", "A", "S"]),
  xp_reward: z.coerce.number().int().positive("XP reward must be a positive integer"),
})

type QuestFormValues = z.infer<typeof questSchema>

import { Database } from "@/types/supabase"

type Quest = Database['public']['Tables']['quests']['Row'];

interface CreateQuestDialogProps {
  onQuestCreated: (quest: Quest) => void
}

export function CreateQuestDialog({ onQuestCreated }: CreateQuestDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuestFormValues>({
    resolver: zodResolver(questSchema),
  })

  const onSubmit = async (data: QuestFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a quest.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/quests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, company_id: user.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to create quest")
      }

      const newQuest = await response.json()
      onQuestCreated(Array.isArray(newQuest) ? newQuest[0] : newQuest)

      toast({
        title: "Success",
        description: "Quest created successfully.",
      })
      reset()
      setOpen(false)
    } catch (error: unknown) {
      console.error(error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to create quest. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Quest</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new Quest</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new quest for adventurers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" {...register("title")} className="col-span-3" />
            {errors.title && <p className="col-span-4 text-red-500 text-xs">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea id="description" {...register("description")} className="col-span-3" />
            {errors.description && <p className="col-span-4 text-red-500 text-xs">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difficulty" className="text-right">
              Difficulty
            </Label>
            <Select onValueChange={(value) => register("difficulty").onChange({ target: { value } })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F">F</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="S">S</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficulty && <p className="col-span-4 text-red-500 text-xs">{errors.difficulty.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="xp_reward" className="text-right">
              XP Reward
            </Label>
            <Input id="xp_reward" type="number" {...register("xp_reward")} className="col-span-3" />
            {errors.xp_reward && <p className="col-span-4 text-red-500 text-xs">{errors.xp_reward.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
