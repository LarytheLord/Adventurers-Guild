
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function CommissionPage() {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [rank, setRank] = useState('C')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setIsSubmitted(false)

    try {
      if (!user || !profile) throw new Error('Not authenticated')

      const xpRewards = { F: 200, D: 400, C: 600, B: 800, A: 1200, S: 2000 }
      const skillRewards = {
        'React Mastery': Math.floor(xpRewards[rank as keyof typeof xpRewards] * 0.3),
        'TypeScript': Math.floor(xpRewards[rank as keyof typeof xpRewards] * 0.2)
      }

      const questData = {
        title,
        description,
        requirements,
        difficulty: rank as 'F' | 'D' | 'C' | 'B' | 'A' | 'S',
        xp_reward: xpRewards[rank as keyof typeof xpRewards],
        skill_rewards: skillRewards,
        budget: budget ? parseFloat(budget) : undefined,
        deadline: deadline || undefined,
        status: 'active' as const,
        company_id: user.id,
        company_name: profile.company_name || profile.name,
        tags: tags
      }

      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Something went wrong')
      }

      setIsSubmitted(true)
      setTitle('')
      setDescription('')
      setRequirements('')
      setRank('C')
      setBudget('')
      setDeadline('')
      setTags([])
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Something went wrong. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-8">
          <Link href="/home">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Commission a Quest</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create a New Quest</CardTitle>
          </CardHeader>
          <CardContent>
            {isSubmitted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Quest submitted successfully!
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">Quest Title *</label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Build React Dashboard Component"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">Quest Description *</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you need built, the goals, and any specific requirements..."
                  rows={4}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-muted-foreground mb-2">Technical Requirements</label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List the technical skills, frameworks, or tools required..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rank" className="block text-sm font-medium text-muted-foreground mb-2">Difficulty Level *</label>
                  <select
                    id="rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="F">F-Rank (Beginner) - 200 XP</option>
                    <option value="D">D-Rank (Easy) - 400 XP</option>
                    <option value="C">C-Rank (Medium) - 600 XP</option>
                    <option value="B">B-Rank (Hard) - 800 XP</option>
                    <option value="A">A-Rank (Expert) - 1200 XP</option>
                    <option value="S">S-Rank (Master) - 2000 XP</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-muted-foreground mb-2">Budget (USD)</label>
                  <Input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-muted-foreground mb-2">Deadline (Optional)</label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    placeholder="Add a tag (e.g., React, API, Design)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    disabled={isSubmitting}
                  />
                  <Button type="button" variant="outline" onClick={addTag} disabled={isSubmitting}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-xs hover:text-destructive"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Quest...' : 'Create Quest'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
