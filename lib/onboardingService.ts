import { supabase } from './supabase'
import { BusinessLogic } from './businessLogic'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  isCompleted: boolean
  isRequired: boolean
  order: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'student' | 'company' | 'client'
  profileCompletion: number
  onboardingCompleted: boolean
  currentStep?: string
}

export interface StudentOnboardingData {
  personalInfo: {
    fullName: string
    dateOfBirth?: string
    location?: string
    timezone?: string
    profileImage?: string
  }
  education: {
    currentLevel: 'high_school' | 'undergraduate' | 'graduate' | 'other'
    institution?: string
    major?: string
    graduationYear?: number
    gpa?: number
  }
  experience: {
    programmingExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsOfExperience: number
    previousProjects: Array<{
      name: string
      description: string
      technologies: string[]
      url?: string
    }>
    portfolioUrl?: string
    githubUrl?: string
    linkedinUrl?: string
  }
  skills: {
    primarySkills: string[]
    interestedCategories: string[]
    learningGoals: string[]
    preferredDifficulty: 'easy' | 'medium' | 'hard' | 'expert'
  }
  preferences: {
    availableHours: number
    preferredWorkingHours: string
    communicationPreferences: string[]
    questTypes: string[]
    budgetExpectation: {
      min: number
      max: number
    }
  }
}

export interface CompanyOnboardingData {
  companyInfo: {
    companyName: string
    industry: string
    companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
    website?: string
    founded?: number
    description: string
    logo?: string
  }
  contactInfo: {
    primaryContact: string
    jobTitle: string
    email: string
    phone?: string
    address?: {
      street: string
      city: string
      state: string
      country: string
      postalCode: string
    }
  }
  techStack: {
    primaryTechnologies: string[]
    frameworks: string[]
    databases: string[]
    cloudPlatforms: string[]
    developmentTools: string[]
  }
  questPreferences: {
    typicalQuestTypes: string[]
    budgetRange: {
      min: number
      max: number
    }
    averageTimeframe: string
    preferredDifficultyLevels: string[]
    requiredSkillLevels: string[]
  }
  verification: {
    businessLicense?: string
    taxId?: string
    verificationDocuments: string[]
    bankingInfo?: {
      routingNumber: string
      accountNumber: string
      accountType: 'checking' | 'savings'
    }
  }
}

export class OnboardingService {
  /**
   * Get onboarding steps for a specific user role
   */
  static getOnboardingSteps(role: 'student' | 'company' | 'client'): OnboardingStep[] {
    const commonSteps = [
      {
        id: 'welcome',
        title: 'Welcome to The Adventurers Guild',
        description: 'Learn about our platform and community',
        component: 'WelcomeStep',
        isCompleted: false,
        isRequired: true,
        order: 1
      }
    ]

    switch (role) {
      case 'student':
        return [
          ...commonSteps,
          {
            id: 'personal_info',
            title: 'Personal Information',
            description: 'Tell us about yourself',
            component: 'StudentPersonalInfoStep',
            isCompleted: false,
            isRequired: true,
            order: 2
          },
          {
            id: 'education',
            title: 'Education Background',
            description: 'Share your educational background',
            component: 'StudentEducationStep',
            isCompleted: false,
            isRequired: true,
            order: 3
          },
          {
            id: 'experience',
            title: 'Experience & Portfolio',
            description: 'Showcase your projects and experience',
            component: 'StudentExperienceStep',
            isCompleted: false,
            isRequired: true,
            order: 4
          },
          {
            id: 'skills_assessment',
            title: 'Skills Assessment',
            description: 'Take our skills assessment to unlock your starting rank',
            component: 'SkillsAssessmentStep',
            isCompleted: false,
            isRequired: true,
            order: 5
          },
          {
            id: 'preferences',
            title: 'Preferences & Goals',
            description: 'Set your learning goals and preferences',
            component: 'StudentPreferencesStep',
            isCompleted: false,
            isRequired: true,
            order: 6
          },
          {
            id: 'tutorial_quest',
            title: 'Complete Your First Quest',
            description: 'Complete a beginner tutorial quest',
            component: 'TutorialQuestStep',
            isCompleted: false,
            isRequired: false,
            order: 7
          }
        ]

      case 'company':
      case 'client':
        return [
          ...commonSteps,
          {
            id: 'company_info',
            title: 'Company Information',
            description: 'Tell us about your company',
            component: 'CompanyInfoStep',
            isCompleted: false,
            isRequired: true,
            order: 2
          },
          {
            id: 'contact_info',
            title: 'Contact Information',
            description: 'Provide your contact details',
            component: 'CompanyContactStep',
            isCompleted: false,
            isRequired: true,
            order: 3
          },
          {
            id: 'tech_stack',
            title: 'Technology Stack',
            description: 'Share your technology preferences',
            component: 'CompanyTechStackStep',
            isCompleted: false,
            isRequired: true,
            order: 4
          },
          {
            id: 'verification',
            title: 'Company Verification',
            description: 'Verify your company for posting quests',
            component: 'CompanyVerificationStep',
            isCompleted: false,
            isRequired: true,
            order: 5
          },
          {
            id: 'quest_preferences',
            title: 'Quest Preferences',
            description: 'Set your quest posting preferences',
            component: 'CompanyQuestPreferencesStep',
            isCompleted: false,
            isRequired: true,
            order: 6
          },
          {
            id: 'first_quest',
            title: 'Post Your First Quest',
            description: 'Create your first quest with guided assistance',
            component: 'FirstQuestStep',
            isCompleted: false,
            isRequired: false,
            order: 7
          }
        ]

      default:
        return commonSteps
    }
  }

  /**
   * Get user's onboarding progress
   */
  static async getUserOnboardingProgress(userId: string): Promise<{
    profile: UserProfile
    steps: OnboardingStep[]
    currentStep: OnboardingStep | null
    completionPercentage: number
  }> {
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, onboarding_completed, onboarding_step')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get onboarding data
    const { data: onboardingData } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single()

    const steps = this.getOnboardingSteps(user.role)
    const completedSteps = onboardingData?.completed_steps || []

    // Mark completed steps
    const updatedSteps = steps.map(step => ({
      ...step,
      isCompleted: completedSteps.includes(step.id)
    }))

    const currentStep = updatedSteps.find(step => !step.isCompleted) || null
    const totalSteps = updatedSteps.filter(step => step.isRequired).length
    const completedRequiredSteps = updatedSteps.filter(step => step.isRequired && step.isCompleted).length
    const completionPercentage = (completedRequiredSteps / totalSteps) * 100

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompletion: completionPercentage,
        onboardingCompleted: user.onboarding_completed,
        currentStep: user.onboarding_step
      },
      steps: updatedSteps,
      currentStep,
      completionPercentage
    }
  }

  /**
   * Complete an onboarding step
   */
  static async completeOnboardingStep(
    userId: string,
    stepId: string,
    stepData?: any
  ): Promise<{ success: boolean; message: string; nextStep?: OnboardingStep }> {
    try {
      // Get current progress
      const progress = await this.getUserOnboardingProgress(userId)

      // Validate step
      const step = progress.steps.find(s => s.id === stepId)
      if (!step) {
        return { success: false, message: 'Invalid onboarding step' }
      }

      if (step.isCompleted) {
        return { success: false, message: 'Step already completed' }
      }

      // Update onboarding data
      const { data: existingData } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single()

      const completedSteps = existingData?.completed_steps || []
      const stepData_merged = { ...(existingData?.step_data || {}), [stepId]: stepData }

      if (existingData) {
        await supabase
          .from('user_onboarding')
          .update({
            completed_steps: [...completedSteps, stepId],
            step_data: stepData_merged,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      } else {
        await supabase
          .from('user_onboarding')
          .insert({
            user_id: userId,
            completed_steps: [stepId],
            step_data: stepData_merged
          })
      }

      // Handle specific step completion logic
      await this.handleStepCompletion(userId, stepId, stepData)

      // Check if onboarding is complete
      const updatedProgress = await this.getUserOnboardingProgress(userId)
      const allRequiredCompleted = updatedProgress.steps
        .filter(s => s.isRequired)
        .every(s => s.isCompleted)

      if (allRequiredCompleted) {
        await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', userId)

        // Award completion XP and skills
        await this.awardOnboardingRewards(userId, progress.profile.role)
      }

      const nextStep = updatedProgress.steps.find(s => !s.isCompleted)

      return {
        success: true,
        message: 'Onboarding step completed successfully',
        nextStep
      }
    } catch (error) {
      console.error('Error completing onboarding step:', error)
      return { success: false, message: 'Failed to complete onboarding step' }
    }
  }

  /**
   * Handle specific step completion logic
   */
  private static async handleStepCompletion(userId: string, stepId: string, stepData: any) {
    switch (stepId) {
      case 'skills_assessment':
        await this.processSkillsAssessment(userId, stepData)
        break

      case 'personal_info':
        await this.updateUserProfile(userId, stepData)
        break

      case 'company_info':
        await this.updateCompanyProfile(userId, stepData)
        break

      case 'verification':
        await this.initateCompanyVerification(userId, stepData)
        break

      case 'tutorial_quest':
        await this.completeTutorialQuest(userId, stepData)
        break
    }
  }

  /**
   * Process skills assessment results
   */
  private static async processSkillsAssessment(userId: string, assessmentData: any) {
    const { skills, overallScore } = assessmentData

    // Calculate starting rank based on assessment
    let startingRank = 'F'
    if (overallScore >= 90) startingRank = 'A'
    else if (overallScore >= 80) startingRank = 'B'
    else if (overallScore >= 70) startingRank = 'C'
    else if (overallScore >= 60) startingRank = 'D'

    // Calculate starting XP
    const startingXP = BusinessLogic.calculateAssessmentXP(overallScore)

    // Update user rank and XP
    await supabase
      .from('users')
      .update({
        rank: startingRank,
        xp: startingXP,
        assessment_score: overallScore,
        assessment_completed_at: new Date().toISOString()
      })
      .eq('id', userId)

    // Add skill points for demonstrated skills
    for (const skill of skills) {
      await supabase
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_id: skill.id,
          level: Math.max(1, Math.floor(skill.score / 20)),
          skill_points: skill.score,
          acquired_at: new Date().toISOString()
        })
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Skills Assessment Complete!',
        message: `Congratulations! You've been assigned rank ${startingRank} and earned ${startingXP} XP.`,
        type: 'achievement',
        data: { rank: startingRank, xp: startingXP, score: overallScore }
      })
  }

  /**
   * Update user profile
   */
  private static async updateUserProfile(userId: string, profileData: any) {
    const updates: any = {}

    if (profileData.fullName) updates.name = profileData.fullName
    if (profileData.location) updates.location = profileData.location
    if (profileData.timezone) updates.timezone = profileData.timezone
    if (profileData.profileImage) updates.avatar_url = profileData.profileImage

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
    }

    // Store additional profile data
    await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        profile_data: profileData,
        updated_at: new Date().toISOString()
      })
  }

  /**
   * Update company profile
   */
  private static async updateCompanyProfile(userId: string, companyData: any) {
    await supabase
      .from('companies')
      .upsert({
        id: userId,
        name: companyData.companyName,
        industry: companyData.industry,
        size: companyData.companySize,
        website: companyData.website,
        description: companyData.description,
        logo_url: companyData.logo,
        founded_year: companyData.founded,
        tech_stack: companyData.techStack,
        updated_at: new Date().toISOString()
      })
  }

  /**
   * Initiate company verification process
   */
  private static async initateCompanyVerification(userId: string, verificationData: any) {
    await supabase
      .from('company_verifications')
      .insert({
        company_id: userId,
        verification_status: 'pending',
        submitted_documents: verificationData.verificationDocuments,
        business_license: verificationData.businessLicense,
        tax_id: verificationData.taxId,
        banking_info: verificationData.bankingInfo,
        submitted_at: new Date().toISOString()
      })

    // Notify admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')

    for (const admin of admins || []) {
      await supabase
        .from('notifications')
        .insert({
          user_id: admin.id,
          title: 'New Company Verification',
          message: 'A new company has submitted verification documents for review.',
          type: 'admin_action',
          data: { company_id: userId, action: 'verify_company' }
        })
    }
  }

  /**
   * Complete tutorial quest
   */
  private static async completeTutorialQuest(userId: string, questData: any) {
    // Award tutorial completion XP
    const tutorialXP = 50

    const { data: user } = await supabase
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single()

    await supabase
      .from('users')
      .update({ xp: (user?.xp || 0) + tutorialXP })
      .eq('id', userId)

    // Unlock basic skills
    const basicSkills = ['html-css', 'javascript-basics', 'git-basics']
    for (const skillId of basicSkills) {
      await supabase
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_id: skillId,
          level: 1,
          skill_points: 10,
          acquired_at: new Date().toISOString()
        })
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Tutorial Complete!',
        message: `Great job! You've earned ${tutorialXP} XP and unlocked basic skills.`,
        type: 'achievement',
        data: { xp: tutorialXP, skills: basicSkills }
      })
  }

  /**
   * Award onboarding completion rewards
   */
  private static async awardOnboardingRewards(userId: string, role: string) {
    const completionXP = role === 'student' ? 100 : 50

    const { data: user } = await supabase
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single()

    await supabase
      .from('users')
      .update({ xp: (user?.xp || 0) + completionXP })
      .eq('id', userId)

    // Award achievements
    const achievementId = role === 'student' ? 'first-steps-adventurer' : 'guild-founder'
    
    await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        earned_at: new Date().toISOString()
      })

    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Welcome to The Guild!',
        message: `Onboarding complete! You've earned ${completionXP} XP and unlocked your first achievement.`,
        type: 'achievement',
        data: { xp: completionXP, achievement: achievementId }
      })
  }

  /**
   * Skip optional onboarding step
   */
  static async skipOnboardingStep(userId: string, stepId: string): Promise<{ success: boolean; message: string }> {
    try {
      const progress = await this.getUserOnboardingProgress(userId)
      const step = progress.steps.find(s => s.id === stepId)

      if (!step) {
        return { success: false, message: 'Invalid onboarding step' }
      }

      if (step.isRequired) {
        return { success: false, message: 'Cannot skip required step' }
      }

      if (step.isCompleted) {
        return { success: false, message: 'Step already completed' }
      }

      // Mark as skipped
      const { data: existingData } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single()

      const skippedSteps = existingData?.skipped_steps || []

      await supabase
        .from('user_onboarding')
        .update({
          skipped_steps: [...skippedSteps, stepId],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return { success: true, message: 'Step skipped successfully' }
    } catch (error) {
      console.error('Error skipping onboarding step:', error)
      return { success: false, message: 'Failed to skip onboarding step' }
    }
  }
}
