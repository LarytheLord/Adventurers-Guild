
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export function CreateProjectForm() {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  })

  const onSubmit = async (data: ProjectFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project.",
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
        body: JSON.stringify({ 
          ...data, 
          company_id: user.id, 
          difficulty: 'F', // Default difficulty
          xp_reward: 100, // Default XP reward
          status: 'draft' // Default status
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      toast({
        title: "Success",
        description: "Project created successfully. It will be reviewed by an admin.",
      })
      reset()
    } catch (error: unknown) {
      console.error(error)
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to create project. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
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
        <Label htmlFor="budget" className="text-right">
          Budget ($)
        </Label>
        <Input id="budget" type="number" {...register("budget")} className="col-span-3" />
        {errors.budget && <p className="col-span-4 text-red-500 text-xs">{errors.budget.message}</p>}
      </div>
      <div className="col-span-4">
        <Button type="submit">Create Project</Button>
      </div>
    </form>
  )
}
