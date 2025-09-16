import { createSupabaseServerClient } from '@/lib/supabase/server'
import { OnboardingService } from '@/lib/onboardingService'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const stepCompletionSchema = z.object({
  stepId: z.string(),
  stepData: z.any().optional(),
})

const stepSkipSchema = z.object({
  stepId: z.string(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await OnboardingService.getUserOnboardingProgress(session.user.id)

    return NextResponse.json({
      success: true,
      data: progress
    })

  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action } = body

    if (action === 'complete_step') {
      const validation = stepCompletionSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json({
          error: 'Validation failed',
          details: validation.error.format()
        }, { status: 400 })
      }

      const { stepId, stepData } = validation.data

      const result = await OnboardingService.completeOnboardingStep(
        session.user.id,
        stepId,
        stepData
      )

      return NextResponse.json({
        success: result.success,
        message: result.message,
        nextStep: result.nextStep
      }, { status: result.success ? 200 : 400 })

    } else if (action === 'skip_step') {
      const validation = stepSkipSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json({
          error: 'Validation failed',
          details: validation.error.format()
        }, { status: 400 })
      }

      const { stepId } = validation.data

      const result = await OnboardingService.skipOnboardingStep(
        session.user.id,
        stepId
      )

      return NextResponse.json({
        success: result.success,
        message: result.message
      }, { status: result.success ? 200 : 400 })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error processing onboarding action:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
