

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params

    const { error } = await supabase.from('quests').delete().eq('id', id)

    if (error) {
      console.error('Error deleting quest:', error)
      return NextResponse.json({ error: 'Failed to delete quest' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Quest deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error in DELETE /api/quests/delete/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
