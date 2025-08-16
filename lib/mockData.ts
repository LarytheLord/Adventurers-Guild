export interface Quest {
  id: string
  title: string
  description: string
  requirements: string
  difficulty: 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
  xp_reward: number
  skill_rewards: Record<string, number>
  budget?: number
  deadline?: string
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
  company_id: string
  company_name: string
  assigned_to?: string
  tags: string[]
  created_at: string
  applications_count: number
}

export interface QuestApplication {
  id: string
  quest_id: string
  user_id: string
  user_name: string
  user_rank: string
  cover_letter: string
  proposed_timeline: string
  status: 'pending' | 'approved' | 'rejected'
  applied_at: string
}

export interface QuestSubmission {
  id: string
  quest_id: string
  user_id: string
  submission_url?: string
  github_repo?: string
  demo_url?: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
  feedback?: string
  rating?: number
  submitted_at: string
}

export const mockQuests: Quest[] = [
  {
    id: 'quest-1',
    title: 'Build React Dashboard Component',
    description: 'Create a responsive dashboard component with charts and data visualization for our admin panel.',
    requirements: 'React, TypeScript, Chart.js or similar, responsive design',
    difficulty: 'B',
    xp_reward: 750,
    skill_rewards: { 'React Mastery': 200, 'TypeScript': 150 },
    budget: 500,
    deadline: '2025-02-15',
    status: 'active',
    company_id: 'company-1',
    company_name: 'Tech Corp Solutions',
    tags: ['React', 'TypeScript', 'Frontend'],
    created_at: '2025-01-10T10:00:00Z',
    applications_count: 3
  },
  {
    id: 'quest-2',
    title: 'API Integration for Mobile App',
    description: 'Integrate REST APIs into our existing mobile application and handle error states.',
    requirements: 'React Native or Flutter, API integration experience, error handling',
    difficulty: 'C',
    xp_reward: 600,
    skill_rewards: { 'API Development': 180, 'Mobile Development': 120 },
    budget: 400,
    deadline: '2025-02-20',
    status: 'active',
    company_id: 'company-2',
    company_name: 'StartupXYZ',
    tags: ['API', 'Mobile', 'Integration'],
    created_at: '2025-01-12T14:30:00Z',
    applications_count: 5
  },
  {
    id: 'quest-3',
    title: 'Database Optimization Project',
    description: 'Optimize slow database queries and improve performance for our e-commerce platform.',
    requirements: 'SQL expertise, PostgreSQL, query optimization, performance analysis',
    difficulty: 'A',
    xp_reward: 1200,
    skill_rewards: { 'Database Design': 300, 'Performance Optimization': 200 },
    budget: 800,
    deadline: '2025-03-01',
    status: 'active',
    company_id: 'company-3',
    company_name: 'E-Commerce Plus',
    tags: ['Database', 'SQL', 'Performance'],
    created_at: '2025-01-08T09:15:00Z',
    applications_count: 2
  },
  {
    id: 'quest-4',
    title: 'UI/UX Redesign Challenge',
    description: 'Redesign our landing page to improve conversion rates and user experience.',
    requirements: 'Figma, UI/UX design principles, responsive design, user research',
    difficulty: 'B',
    xp_reward: 700,
    skill_rewards: { 'UI/UX Design': 250, 'User Research': 150 },
    budget: 600,
    deadline: '2025-02-25',
    status: 'active',
    company_id: 'company-4',
    company_name: 'Design Studio Pro',
    tags: ['Design', 'UX', 'Frontend'],
    created_at: '2025-01-14T16:45:00Z',
    applications_count: 7
  },
  {
    id: 'quest-5',
    title: 'Machine Learning Model Implementation',
    description: 'Implement a recommendation system using collaborative filtering for our platform.',
    requirements: 'Python, scikit-learn or TensorFlow, data analysis, ML algorithms',
    difficulty: 'S',
    xp_reward: 2000,
    skill_rewards: { 'Python for AI': 400, 'Machine Learning': 300 },
    budget: 1200,
    deadline: '2025-03-15',
    status: 'active',
    company_id: 'company-5',
    company_name: 'AI Innovations',
    tags: ['AI', 'Python', 'Machine Learning'],
    created_at: '2025-01-05T11:20:00Z',
    applications_count: 1
  }
]

export const mockApplications: QuestApplication[] = [
  {
    id: 'app-1',
    quest_id: 'quest-1',
    user_id: 'student-1',
    user_name: 'Alex Student',
    user_rank: 'B',
    cover_letter: 'I have 3 years of React experience and have built similar dashboard components.',
    proposed_timeline: '2 weeks',
    status: 'pending',
    applied_at: '2025-01-15T10:30:00Z'
  }
]

export const mockSubmissions: QuestSubmission[] = [
  {
    id: 'sub-1',
    quest_id: 'quest-1',
    user_id: 'student-1',
    github_repo: 'https://github.com/student/dashboard-component',
    demo_url: 'https://dashboard-demo.vercel.app',
    description: 'Completed dashboard component with all requested features including responsive design and chart integration.',
    status: 'pending',
    submitted_at: '2025-01-20T15:45:00Z'
  }
]

export class MockDataService {
  // Quest methods
  static getQuests(filters?: {
    difficulty?: string
    search?: string
    tags?: string[]
  }): Quest[] {
    let quests = [...mockQuests]

    if (filters?.difficulty && filters.difficulty !== 'all') {
      quests = quests.filter(q => q.difficulty === filters.difficulty)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      quests = quests.filter(q => 
        q.title.toLowerCase().includes(search) ||
        q.description.toLowerCase().includes(search) ||
        q.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }

    if (filters?.tags && filters.tags.length > 0) {
      quests = quests.filter(q => 
        filters.tags!.some(tag => q.tags.includes(tag))
      )
    }

    return quests
  }

  static getQuestById(id: string): Quest | null {
    return mockQuests.find(q => q.id === id) || null
  }

  static getQuestsByCompany(companyId: string): Quest[] {
    return mockQuests.filter(q => q.company_id === companyId)
  }

  // Application methods
  static getApplicationsForQuest(questId: string): QuestApplication[] {
    return mockApplications.filter(a => a.quest_id === questId)
  }

  static getUserApplications(userId: string): QuestApplication[] {
    return mockApplications.filter(a => a.user_id === userId)
  }

  static applyToQuest(application: Omit<QuestApplication, 'id' | 'applied_at'>): QuestApplication {
    const newApplication: QuestApplication = {
      ...application,
      id: Math.random().toString(36).substr(2, 9),
      applied_at: new Date().toISOString()
    }
    mockApplications.push(newApplication)
    return newApplication
  }

  // Submission methods
  static getSubmissionsForQuest(questId: string): QuestSubmission[] {
    return mockSubmissions.filter(s => s.quest_id === questId)
  }

  static submitQuest(submission: Omit<QuestSubmission, 'id' | 'submitted_at'>): QuestSubmission {
    const newSubmission: QuestSubmission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      submitted_at: new Date().toISOString()
    }
    mockSubmissions.push(newSubmission)
    return newSubmission
  }

  // Company methods
  static createQuest(quest: Omit<Quest, 'id' | 'created_at' | 'applications_count'>): Quest {
    const newQuest: Quest = {
      ...quest,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      applications_count: 0
    }
    mockQuests.push(newQuest)
    return newQuest
  }

  static updateQuest(id: string, updates: Partial<Quest>): Quest | null {
    const questIndex = mockQuests.findIndex(q => q.id === id)
    if (questIndex === -1) return null

    mockQuests[questIndex] = { ...mockQuests[questIndex], ...updates }
    return mockQuests[questIndex]
  }
}