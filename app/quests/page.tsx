'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, DollarSign, Trophy, Users, Clock, ArrowRight } from 'lucide-react'
import { MockDataService, Quest } from '@/lib/mockData'

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const allQuests = MockDataService.getQuests()
    setQuests(allQuests)
    setFilteredQuests(allQuests)
  }, [])

  useEffect(() => {
    let filtered = quests

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quest =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(quest => quest.difficulty === difficultyFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quest => quest.status === statusFilter)
    }

    setFilteredQuests(filtered)
  }, [quests, searchTerm, difficultyFilter, statusFilter])

  const getRankColor = (rank: string) => {
    const colors = {
      S: 'bg-yellow-500 text-black',
      A: 'bg-red-500 text-white',
      B: 'bg-blue-500 text-white',
      C: 'bg-green-500 text-white',
      D: 'bg-gray-500 text-white',
      F: 'bg-gray-400 text-white'
    }
    return colors[rank as keyof typeof colors] || 'bg-gray-400 text-white'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={32} height={32} />
            <span className="text-xl font-bold">Quest Board</span>
          </div>
          <Link href="/login">
            <Button>Join Guild</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Available Quests
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Discover real-world projects from companies looking for talented developers. 
            Join the guild to apply and start your adventure!
          </p>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search quests by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="F">F-Rank (Beginner)</SelectItem>
                <SelectItem value="D">D-Rank (Easy)</SelectItem>
                <SelectItem value="C">C-Rank (Medium)</SelectItem>
                <SelectItem value="B">B-Rank (Hard)</SelectItem>
                <SelectItem value="A">A-Rank (Expert)</SelectItem>
                <SelectItem value="S">S-Rank (Master)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredQuests.length} of {quests.length} quests
          </div>
        </section>

        {/* Quest Grid */}
        <section>
          {filteredQuests.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">No quests found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or check back later for new quests.
              </p>
              <Link href="/commission">
                <Button>Post a Quest</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredQuests.map((quest) => (
                <Card key={quest.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getRankColor(quest.difficulty)}>
                        {quest.difficulty}-Rank
                      </Badge>
                      <Badge className={getStatusColor(quest.status)}>
                        {quest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{quest.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      by {quest.company_name}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {quest.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {quest.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {quest.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{quest.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${quest.budget}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Trophy className="w-4 h-4 mr-1" />
                        {quest.xp_reward} XP
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        {quest.applications_count} applied
                      </div>
                      {quest.deadline && (
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(quest.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/quests/${quest.id}`} className="w-full">
                      <Button className="w-full">
                        View Quest
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="text-center mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Take on a Quest?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join The Adventurers Guild to apply for quests, earn XP, and build your portfolio 
            with real-world projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3">
                Join the Guild
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}