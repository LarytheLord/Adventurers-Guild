
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
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/components/ui/use-toast"
import { Database } from "@/types/supabase"
import { useEffect, useState } from "react"

type Quest = Database['public']['Tables']['quests']['Row'];

const questSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["F", "D", "C", "B", "A", "S"]),
  xp_reward: z.coerce.number().int().positive("XP reward must be a positive integer"),
  status: z.enum(["draft", "active", "in_progress", "completed", "cancelled"])
})

type QuestFormValues = z.infer<typeof questSchema>

interface EditQuestDialogProps {
  quest: Quest
  onQuestUpdated: (quest: Quest) => void
}

export function EditQuestDialog({ quest, onQuestUpdated }: EditQuestDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuestFormValues>({
    resolver: zodResolver(questSchema),
    defaultValues: quest,
  })

  useEffect(() => {
    reset(quest)
  }, [quest, reset])

  const onSubmit = async (data: QuestFormValues) => {
    try {
      const response = await fetch(`/api/quests/update/${quest.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update quest")
      }

      const updatedQuest = await response.json()
      onQuestUpdated(updatedQuest[0])

      toast({
        title: "Success",
        description: "Quest updated successfully.",
      })
      setOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update quest. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Quest</DialogTitle>
          <DialogDescription>
            Update the details of your quest.
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
            <Select onValueChange={(value) => register("difficulty").onChange({ target: { value } })} defaultValue={quest.difficulty}>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => register("status").onChange({ target: { value } })} defaultValue={quest.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="col-span-4 text-red-500 text-xs">{errors.status.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
