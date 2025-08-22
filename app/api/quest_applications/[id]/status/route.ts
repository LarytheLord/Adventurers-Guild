
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'revision_requested']),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { id: applicationId } = params
    const body = await req.json()

    const validation = statusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { status } = validation.data

    const { data: application, error } = await supabase
      .from('quest_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()

    if (error) {
      console.error('Error updating application status:', error)
      return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 })
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application, { status: 200 })
  } catch (error) {
    console.error('Error in PUT /api/quest_applications/[id]/status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
