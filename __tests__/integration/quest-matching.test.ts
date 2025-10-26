// __tests__/integration/quest-matching.test.ts
import { getMatchedQuests } from '@/lib/matching-utils';

// Mock the API call
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('Quest Matching Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch matched quests from API successfully', async () => {
    const userId = 'user-123';
    const mockMatchedQuests = [
      {
        id: 'quest-1',
        title: 'React Mastery',
        description: 'Build a complex React application',
        difficulty: 'B',
        xp_reward: 1200,
        matchScore: 95
      },
      {
        id: 'quest-2',
        title: 'API Development',
        description: 'Create a RESTful API',
        difficulty: 'A',
        xp_reward: 1800,
        matchScore: 87
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ matches: mockMatchedQuests, success: true }),
    });

    const result = await getMatchedQuests(userId, 10);

    expect(fetch).toHaveBeenCalledWith(`/api/matching?user_id=${userId}&limit=10`);
    expect(result).toEqual(mockMatchedQuests);
  });

  it('should handle API error gracefully', async () => {
    const userId = 'user-123';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error', success: false }),
    });

    await expect(getMatchedQuests(userId, 10)).rejects.toThrow('Failed to fetch matched quests');
  });

  it('should throw error when API returns success: false', async () => {
    const userId = 'user-123';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: 'Invalid user', success: false }),
    });

    await expect(getMatchedQuests(userId, 10)).rejects.toThrow('Invalid user');
  });
});