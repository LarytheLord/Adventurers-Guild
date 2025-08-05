
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CommissionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rank, setRank] = useState('C')
  const [xp, setXp] = useState(500)
  const [image, setImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setIsSubmitted(false)

    try {
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, rank, xp, image }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        setTitle('')
        setDescription('')
        setRank('C')
        setXp(500)
        setImage('')
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        throw new Error(data.message || 'Failed to submit quest')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Something went wrong. Please try again.')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsSubmitting(false)
    }
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
                <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">Quest Title</label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Bug Bounty Brigades"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">Quest Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A detailed description of the quest."
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rank" className="block text-sm font-medium text-muted-foreground mb-2">Rank</label>
                  <select
                    id="rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="S">S-Rank</option>
                    <option value="A">A-Rank</option>
                    <option value="B">B-Rank</option>
                    <option value="C">C-Rank</option>
                    <option value="D">D-Rank</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="xp" className="block text-sm font-medium text-muted-foreground mb-2">XP Reward</label>
                  <Input
                    id="xp"
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(Number(e.target.value))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-muted-foreground mb-2">Image URL (Optional)</label>
                <Input
                  id="image"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/quest-image.png"
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Quest'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
