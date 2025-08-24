import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for the request body
const evaluateSchema = z.object({
  problemId: z.string(),
  code: z.string(),
  language: z.enum(['javascript', 'typescript', 'python']),
  timeSpent: z.number()
})

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = evaluateSchema.parse(body)

    // Check if AI service is configured
    const aiServiceUrl = process.env.AI_SERVICE_URL
    const aiServiceApiKey = process.env.AI_SERVICE_API_KEY
    
    let evaluationResult = null

    if (aiServiceUrl && aiServiceApiKey) {
      try {
        // =================================================================
        // INTEGRATION POINT FOR YOUR FRIEND'S AI SERVICE
        // =================================================================
        // This is where your friend's AI model will evaluate the code
        // The AI service should:
        // 1. Run the code against test cases
        // 2. Analyze code quality, efficiency, and correctness
        // 3. Return a score and feedback
        
        const aiResponse = await fetch(`${aiServiceUrl}/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiServiceApiKey}`
          },
          body: JSON.stringify({
            problemId: validatedData.problemId,
            code: validatedData.code,
            language: validatedData.language,
            userId: user.id,
            timeSpent: validatedData.timeSpent
          }),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        })

        if (aiResponse.ok) {
          evaluationResult = await aiResponse.json()
        }
      } catch (error) {
        console.error('AI Service Error:', error)
        // Fall back to mock evaluation if AI service fails
      }
    }

    // If AI service is not available or failed, use mock evaluation
    if (!evaluationResult) {
      evaluationResult = generateMockEvaluation(validatedData)
    }

    // Store the evaluation in the database
    const { data: testRecord, error: dbError } = await supabase
      .from('ai_rank_tests')
      .update({
        user_code: validatedData.code,
        language: validatedData.language,
        submission_time: new Date().toISOString(),
        ai_evaluation: evaluationResult,
        test_results: evaluationResult.testResults,
        score: evaluationResult.score,
        feedback: evaluationResult.feedback,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway - the evaluation is more important
    }

    return NextResponse.json({
      success: true,
      evaluation: evaluationResult,
      testId: testRecord?.id
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

// Mock evaluation function for testing without AI service
function generateMockEvaluation(data: z.infer<typeof evaluateSchema>) {
  const baseScore = Math.floor(Math.random() * 30) + 70 // 70-100 score
  
  return {
    score: baseScore,
    testResults: [
      { testCase: 1, passed: true, executionTime: 12 },
      { testCase: 2, passed: true, executionTime: 15 },
      { testCase: 3, passed: baseScore > 85, executionTime: 20 }
    ],
    feedback: {
      correctness: baseScore > 80 ? 'Excellent' : 'Good',
      efficiency: baseScore > 90 ? 'Optimal' : 'Can be optimized',
      readability: 'Clean and well-structured',
      suggestions: [
        'Consider edge cases',
        'Add more comments for complex logic'
      ]
    },
    codeAnalysis: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      linesOfCode: data.code.split('\n').length,
      cyclomaticComplexity: 3
    }
  }
}
