// __tests__/app-api/quests.test.ts
import { NextRequest } from 'next/server';
import { GET as getQuests, POST as createQuest } from '@/app/api/quests/route';

// Mock the supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockSelectResult = {
    eq: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
  };
  
  const mockFromResult = {
    select: jest.fn(() => mockSelectResult),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({ 
          data: {
            id: 'test-quest',
            title: 'Test Quest',
            description: 'Test Description',
            quest_type: 'commission',
            status: 'available',
            difficulty: 'D',
            xp_reward: 500,
            skill_points_reward: 100,
            required_skills: ['javascript'],
            quest_category: 'frontend',
            company_id: 'company-1',
            created_at: '2023-01-01T00:00:00Z',
          },
          error: null 
        })),
      })),
    })),
  };
  
  return {
    createClient: jest.fn(() => ({
      from: jest.fn(() => mockFromResult),
    })),
  };
});

describe('Quests App Router API', () => {
  describe('GET /api/quests', () => {
    it('should return available quests', async () => {
      // Create mock request with URL params
      const mockUrl = 'http://localhost:3000/api/quests?status=available';
      const mockRequest = new NextRequest(mockUrl, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      });

      // Call the GET function
      const response = await getQuests(mockRequest);

      // Verify the response
      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('quests');
    });

    it('should handle errors when fetching quests', async () => {
      // Mock error case
      jest.mocked(require('@supabase/supabase-js').createClient).mockImplementation(() => ({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              range: jest.fn(() => {
                throw new Error('Database error');
              }),
            })),
          })),
        })),
      }));

      const mockUrl = 'http://localhost:3000/api/quests';
      const mockRequest = new NextRequest(mockUrl, {
        method: 'GET',
      });

      const response = await getQuests(mockRequest);
      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('error');
    });
  });

  describe('POST /api/quests', () => {
    it('should create a new quest', async () => {
      // Create mock request with body
      const requestBody = {
        title: 'New Test Quest',
        description: 'Test Description',
        quest_type: 'commission',
        difficulty: 'D',
        xp_reward: 500,
        skill_points_reward: 100,
        required_skills: ['javascript'],
        quest_category: 'frontend',
        company_id: 'company-1'
      };

      const mockUrl = 'http://localhost:3000/api/quests';
      const mockRequest = new NextRequest(mockUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await createQuest(mockRequest);

      expect(response.status).toBe(201);
      const responseData = await response.json();
      expect(responseData).toHaveProperty('success');
      expect(responseData).toHaveProperty('quest');
    });

    it('should return 400 for missing required fields', async () => {
      const requestBody = {
        // Missing required fields
      };

      const mockUrl = 'http://localhost:3000/api/quests';
      const mockRequest = new NextRequest(mockUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await createQuest(mockRequest);
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Missing required fields');
    });
  });
});