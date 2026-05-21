/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getPublicQuests, getQuestCategories } from '@/lib/services/public-quest-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: any = {};

    const category = searchParams.get('category');
    if (category) filters.category = category;

    const difficulty = searchParams.get('difficulty');
    if (difficulty) filters.difficulty = difficulty;

    const track = searchParams.get('track');
    if (track) filters.track = track;

    const search = searchParams.get('search');
    if (search) filters.search = search;

    const page = parseInt(searchParams.get('page') || '1', 10);
    if (!isNaN(page) && page > 0) filters.page = page;

    const limit = parseInt(searchParams.get('limit') || '12', 10);
    if (!isNaN(limit) && limit > 0) filters.limit = Math.min(limit, 50);

    const [result, categories] = await Promise.all([
      getPublicQuests(filters),
      getQuestCategories(),
    ]);

    return NextResponse.json({
      success: true,
      quests: result.quests,
      pagination: {
        total: result.totalCount,
        pages: result.totalPages,
        current: result.currentPage,
        limit: filters.limit,
      },
      categories,
    });
  } catch (error) {
    console.error('Error fetching public quests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quests' },
      { status: 500 }
    );
  }
}