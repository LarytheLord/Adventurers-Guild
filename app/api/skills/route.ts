
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()

    const { data: skillCategories, error: categoriesError } = await supabase
      .from('skill_categories')
      .select('*')

    if (categoriesError) {
      console.error('Error fetching skill categories:', categoriesError)
      return NextResponse.json({ error: 'Failed to fetch skill categories' }, { status: 500 })
    }

    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')

    if (skillsError) {
      console.error('Error fetching skills:', skillsError)
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }

    return NextResponse.json({ skillCategories, skills }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/skills:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
