'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Trophy,
  Building2,
  Filter,
  X
} from 'lucide-react'
import { Database } from '@/types/supabase'

type Quest = Database['public']['Tables']['quests']['Row'] & {
  company_name?: string
  applications_count?: number
}

// Category metadata for SEO
const categoryMeta: Record<string, { 
  title: string
  description: string
  heroTitle: string
  heroDescription: string
  icon: string
}> = {
  'frontend': {
    title: 'Frontend Quests',
    description: 'Browse open frontend development quests. Earn XP, climb ranks, get paid. Join the guild today.',
    heroTitle: 'Frontend Development Quests',
    heroDescription: 'Build beautiful user interfaces and master modern frameworks like React, Vue, and more.',
    icon: '🎨'
  },
  'backend': {
    title: 'Backend Quests',
    description: 'Browse backend development quests. Build APIs, databases, and server systems.',
    heroTitle: 'Backend Development Quests',
    heroDescription: 'Create robust server-side applications and master database design.',
    icon: '⚙️'
  },
  'ai-ml': {
    title: 'AI/ML Quests',
    description: 'Browse artificial intelligence and machine learning quests. Build intelligent systems.',
    heroTitle: 'AI & Machine Learning Quests',
    heroDescription: 'Work on cutting-edge AI projects and machine learning models.',
    icon: '🤖'
  },
  'devops': {
    title: 'DevOps Quests',
    description: 'Browse DevOps quests. Master CI/CD, cloud infrastructure, and deployment.',
    heroTitle: 'DevOps Quests',
    heroDescription: 'Build and maintain scalable infrastructure and deployment pipelines.',
    icon: '🚀'
  },
  'mobile': {
    title: 'Mobile Quests',
    description: 'Browse mobile development quests. Build iOS, Android, and cross-platform apps.',
    heroTitle: 'Mobile Development Quests',
    heroDescription: 'Create mobile applications for iOS, Android, and cross-platform.',
    icon: '📱'
  },
  'full-stack': {
    title: 'Full-Stack Quests',
    description: 'Browse full-stack development quests. Build complete web applications.',
    heroTitle: 'Full-Stack Development Quests',
    heroDescription: 'Work on end-to-end applications from frontend to backend.',
    icon: '🌐'
  }
}

const validCategories = Object.keys(categoryMeta)

export default function CategoryQuestsPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const category = resolvedParams.category.toLowerCase()
  
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  const meta = categoryMeta[category]

  useEffect(() => {
    // Redirect invalid categories to main quests page
    if (!validCategories.includes(category)) {
      router.push('/quests')
      return
    }

    const fetchQuests = async () => {
      try {
        const response = await fetch('/api/quests')
        const data = await response.json()
        const allQuests: Quest[] = Array.isArray(data) ? data : data.quests || []
        
        // Filter by category (using tags)
        const filtered = allQuests.filter(quest => {
          const tags = quest.tags || []
          const categoryTag = category.replace('-', ' ').replace('ml', 'ML').toLowerCase()
          return tags.some(tag => 
            tag.toLowerCase().includes(category.replace('-', ' ')) ||
            tag.toLowerCase().includes(categoryTag) ||
            tag.toLowerCase() === category.replace('ai-', 'ai ')
          )
        })
        
        setQuests(filtered)
      } catch (error) {
        console.error('Failed to fetch quests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuests()
  }, [category, router])

  // Apply filters
  const filteredQuests = quests.filter(quest => {
    const matchesSearch = !searchQuery || 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDifficulty = !selectedDifficulty || quest.difficulty === selectedDifficulty
    
    return matchesSearch && matchesDifficulty
  })

  if (!meta) {
    return null // Will redirect
  }

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      S: 'bg-yellow-500 text-black',
      A: 'bg-red-500 text-white',
      B: 'bg-blue-500 text-white',
      C: 'bg-green-500 text-white',
      D: 'bg-gray-500 text-white',
      F: 'bg-gray-400 text-white'
    }
    return colors[rank] || 'bg-gray-400 text-white'
  }

  return (
    <>
      {/* SEO Meta Tags would go in layout.tsx */}
      
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/quests" className="hover:text-primary">Quests</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{meta.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{meta.icon}</span>
              <h1 className="text-4xl font-bold">{meta.heroTitle}</h1>
            </div>
            <p className="text-xl text-muted-foreground">{meta.heroDescription}</p>
            <p className="mt-4 text-muted-foreground">
              {filteredQuests.length} {filteredQuests.length === 1 ? 'quest' : 'quests'} available
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search quests..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['F', 'D', 'C', 'B', 'A', 'S'].map(rank => (
                <Button
                  key={rank}
                  variant={selectedDifficulty === rank ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(selectedDifficulty === rank ? null : rank)}
                >
                  {rank}-Rank
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quest Grid */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-full mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredQuests.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuests.map(quest => (
              <Link key={quest.id} href={`/quests/${quest.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge className={getRankColor(quest.difficulty)}>
                        {quest.difficulty}-Rank
                      </Badge>
                      {quest.is_featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 mt-2">{quest.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {quest.company_name || 'Unknown Company'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {quest.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <Trophy className="w-4 h-4" />
                        {quest.xp_reward} XP
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        ${quest.budget}
                      </div>
                    </div>
                    {quest.deadline && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        Due {new Date(quest.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No quests found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
              <Button variant="outline" onClick={() => setSelectedDifficulty(null)}>
                Clear Filters
              </Button>
              <Link href="/quests">
                <Button>Browse All Quests</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

// Generate static params for known categories
export function generateStaticParams() {
  return validCategories.map(category => ({ category }))
}