
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { useEffect } from "react"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  username: z.string().min(1, "Username is required").optional(),
  bio: z.string().optional(),
  github_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function UserProfileForm() {
  const { profile, user, updateProfile } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      github_url: profile?.github_url || "",
      linkedin_url: profile?.linkedin_url || "",
      location: profile?.location || "",
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        github_url: profile.github_url || "",
        linkedin_url: profile.linkedin_url || "",
        location: profile.location || "",
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateProfile(data)
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input id="name" {...register("name")} className="col-span-3" />
        {errors.name && <p className="col-span-4 text-red-500 text-xs">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input id="username" {...register("username")} className="col-span-3" />
        {errors.username && <p className="col-span-4 text-red-500 text-xs">{errors.username.message}</p>}
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="bio" className="text-right">
          Bio
        </Label>
        <Textarea id="bio" {...register("bio")} className="col-span-3" />
        {errors.bio && <p className="col-span-4 text-red-500 text-xs">{errors.bio.message}</p>}
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="github_url" className="text-right">
          GitHub URL
        </Label>
        <Input id="github_url" {...register("github_url")} className="col-span-3" />
        {errors.github_url && <p className="col-span-4 text-red-500 text-xs">{errors.github_url.message}</p>}
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="linkedin_url" className="text-right">
          LinkedIn URL
        </Label>
        <Input id="linkedin_url" {...register("linkedin_url")} className="col-span-3" />
        {errors.linkedin_url && <p className="col-span-4 text-red-500 text-xs">{errors.linkedin_url.message}</p>}
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="location" className="text-right">
          Location
        </Label>
        <Input id="location" {...register("location")} className="col-span-3" />
        {errors.location && <p className="col-span-4 text-red-500 text-xs">{errors.location.message}</p>}
      </div>
      <div className="col-span-4">
        <Button type="submit">Update Profile</Button>
      </div>
    </form>
  )
}
