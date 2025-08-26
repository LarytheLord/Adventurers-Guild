import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for the request body
const submitSchema = z.object({
  userId: z.string(),
  completedProblems: z.number(),
  totalTime: z.number()
})

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = submitSchema.parse(body)

    // Calculate final score (this would be more complex in a real implementation)
    // For now, we'll use a simple calculation based on problems completed and time
    const baseScore = validatedData.completedProblems * 200
    const timeBonus = Math.max(0, 3600 - validatedData.totalTime) // Bonus for finishing early
    const finalScore = baseScore + timeBonus

    // Store the test result in the database
    const { data: testRecord, error: dbError } = await supabase
      .from('ai_rank_tests')
      .insert({
        user_id: validatedData.userId,
        completed_problems: validatedData.completedProblems,
        total_time: validatedData.totalTime,
        score: finalScore,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save test results' },
        { status: 500 }
      )
    }

    // Update user's rank and XP based on the test score
    let newRank = 'F'
    if (finalScore >= 950) newRank = 'Diamond'
    else if (finalScore >= 800) newRank = 'Platinum'
    else if (finalScore >= 600) newRank = 'Gold'
    else if (finalScore >= 300) newRank = 'Silver'
    
    // XP calculation (simplified)
    const xp = finalScore * 10

    const { error: userError } = await supabase
      .from('users')
      .update({
        rank: newRank,
        xp: xp,
        updated_at: new Date().toISOString()
      })
      .match({ id: validatedData.userId })

    if (userError) {
      console.error('User update error:', userError)
      // We'll still return success as the test was saved
    }

    return NextResponse.json({
      success: true,
      testId: testRecord?.id,
      score: finalScore,
      rank: newRank,
      xp: xp
    })

  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}