// __tests__/api/quests.test.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { GET as getQuests } from '@/app/api/quests/route';
import { POST as createQuest } from '@/app/api/quests/route';

// Mock the supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn(() => ({
            data: [
              {
                id: '1',
                title: 'Test Quest',
                description: 'Test Description',
                quest_type: 'commission',
                status: 'available',
                difficulty: 'D',
                xp_reward: 500,
                skill_points_reward: 100,
                quest_category: 'frontend',
                company_id: 'company-1',
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: {
            id: '2',
            title: 'New Test Quest',
            description: 'New Test Description',
            quest_type: 'commission',
            status: 'available',
            difficulty: 'D',
            xp_reward: 500,
            skill_points_reward: 100,
            quest_category: 'frontend',
            company_id: 'company-1',
          },
          error: null,
        })),
      })),
    })),
  })),
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  unstable_getServerSession: jest.fn(),
}));

describe('Quests API', () => {
  describe('GET /api/quests', () => {
    it('should return available quests', async () => {
      // Create mock request and response objects
      const mockRequest = {
        url: 'http://localhost:3000/api/quests?status=available',
        headers: { 'content-type': 'application/json' },
      } as unknown as NextApiRequest;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as NextApiResponse;

      // Call the GET function
      await getQuests(mockRequest, mockResponse);

      // Verify the response
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        quests: [
          {
            id: '1',
            title: 'Test Quest',
            description: 'Test Description',
            quest_type: 'commission',
            status: 'available',
            difficulty: 'D',
            xp_reward: 500,
            skill_points_reward: 100,
            quest_category: 'frontend',
            company_id: 'company-1',
          },
        ],
        success: true,
      });
    });

    it('should handle missing required fields', async () => {
      // Create mock request with missing required fields
      const mockRequest = {
        url: 'http://localhost:3000/api/quests',
        body: {},
        headers: { 'content-type': 'application/json' },
      } as unknown as NextApiRequest;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as NextApiResponse;

      // Call the POST function (for missing fields test)
      await createQuest(mockRequest, mockResponse);

      // Verify error response
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing required fields',
        success: false,
      });
    });
  });

  describe('POST /api/quests', () => {
    it('should create a new quest successfully', async () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/quests',
        body: {
          title: 'New Quest',
          description: 'New Quest Description',
          quest_type: 'commission',
          difficulty: 'D',
          xp_reward: 500,
          company_id: 'company-1',
          quest_category: 'frontend',
        },
        headers: { 'content-type': 'application/json' },
      } as unknown as NextApiRequest;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as NextApiResponse;

      await createQuest(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        quest: {
          id: '2',
          title: 'New Test Quest',
          description: 'New Test Description',
          quest_type: 'commission',
          status: 'available',
          difficulty: 'D',
          xp_reward: 500,
          skill_points_reward: 100,
          quest_category: 'frontend',
          company_id: 'company-1',
        },
        success: true,
      });
    });

    it('should handle validation errors', async () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/quests',
        body: {
          title: '', // Invalid: empty title
          description: 'Valid description',
          quest_type: 'commission',
          difficulty: 'D',
          xp_reward: 500,
        },
        headers: { 'content-type': 'application/json' },
      } as unknown as NextApiRequest;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      } as unknown as NextApiResponse;

      await createQuest(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'title is required',
        success: false,
      });
    });
  });
});