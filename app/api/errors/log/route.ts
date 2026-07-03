import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// In-memory rate limiting: IP-based, 100 requests per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: NextRequest): string {
  // Check for forwarded header (if behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.ip || 'unknown'
}

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const limit = 100 // 100 requests per hour
  
  const clientLimit = rateLimitMap.get(clientIP)
  
  if (!clientLimit || clientLimit.resetTime < now) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + hour })
    return true
  }
  
  if (clientLimit.count >= limit) {
    return false
  }
  
  clientLimit.count++
  return true
}

// Validation schema
const errorLogSchema = z.object({
  message: z.string().max(2000, 'Message too long'),
  severity: z.enum(['error', 'warning', 'info']).default('error'),
  source: z.string().max(200, 'Source too long').optional(),
  url: z.string().url().max(500, 'URL too long').optional().or(z.literal('')),
  userAgent: z.string().max(500, 'User agent too long').optional(),
  stack: z.string().max(5000, 'Stack trace too long').optional(),
  metadata: z.record(z.unknown()).optional()
})

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(req)
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      )
    }

    // Optional: Check for static API key if configured
    // This is recommended for production deployments
    const apiKey = req.headers.get('authorization')?.replace('Bearer ', '')
    const expectedKey = process.env.ERROR_LOG_API_KEY
    
    // If an API key is configured, require it
    if (expectedKey && apiKey !== expectedKey) {
      // For now, we allow requests without key but log a warning
      // In production, you might want to require the key:
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      console.warn('Error log request without API key from:', clientIP)
    }

    // Parse and validate request body
    const body = await req.json()
    const validation = errorLogSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { message, severity, source, url, userAgent, stack, metadata } = validation.data

    const supabase = createSupabaseServerClient()

    // Insert error log into database
    const { error: insertError } = await supabase
      .from('error_logs')
      .insert({
        message,
        severity,
        source,
        url: url || null,
        user_agent: userAgent || null,
        stack_trace: stack || null,
        metadata: metadata || null,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Failed to insert error log:', insertError)
      // Don't expose database errors to client
      return NextResponse.json(
        { error: 'Failed to log error' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in /api/errors/log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method to retrieve error logs (admin only)
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get pagination params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = (page - 1) * limit
    const severity = searchParams.get('severity')

    // Build query
    let query = supabase
      .from('error_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (severity && ['error', 'warning', 'info'].includes(severity)) {
      query = query.eq('severity', severity)
    }

    const { data: logs, error: fetchError, count } = await query

    if (fetchError) {
      console.error('Failed to fetch error logs:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error in GET /api/errors/log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}