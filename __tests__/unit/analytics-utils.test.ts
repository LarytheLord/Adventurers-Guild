// __tests__/unit/analytics-utils.test.ts
import { 
  getUserAnalytics,
  getPlatformAnalytics,
  getUserProgressOverTime
} from '@/lib/analytics-utils';

// Mock the fetch API
global.fetch = jest.fn();

describe('Analytics Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAnalytics', () => {
    it('should fetch user analytics successfully', async () => {
      const userId = 'user-123';
      const mockAnalytics = {
        user: {
          id: userId,
          name: 'Test User',
          rank: 'A',
          xp: 15000,
          skill_points: 1200,
          level: 15
        },
        stats: {
          total_quests: 25,
          completed_quests: 20,
          completion_rate: 80,
          xp_gained: 5000,
          skill_points_gained: 500
        },
        recent_activity: [],
        progress_over_time: [],
        success: true
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      });

      const result = await getUserAnalytics(userId, '30d');

      expect(fetch).toHaveBeenCalledWith(`/api/analytics?type=user&user_id=${userId}&time_range=30d`);
      expect(result).toEqual(mockAnalytics);
    });

    it('should throw an error when API request fails', async () => {
      const userId = 'user-123';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error', success: false }),
      });

      await expect(getUserAnalytics(userId)).rejects.toThrow('Failed to fetch user analytics');
    });

    it('should throw an error when API returns success: false', async () => {
      const userId = 'user-123';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Invalid user', success: false }),
      });

      await expect(getUserAnalytics(userId)).rejects.toThrow('Failed to fetch user analytics');
    });
  });

  describe('getPlatformAnalytics', () => {
    it('should fetch platform analytics successfully', async () => {
      const mockAnalytics = {
        platform_stats: {
          total_users: 1000,
          total_quests: 500,
          total_assignments: 800,
          total_completions: 700,
          active_users: 250,
          completion_rate: 87.5
        },
        top_categories: [
          { category: 'frontend', count: 150 },
          { category: 'backend', count: 120 }
        ],
        rank_distribution: [
          { rank: 'F', count: 200 },
          { rank: 'E', count: 150 }
        ],
        success: true
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics,
      });

      const result = await getPlatformAnalytics('30d');

      expect(fetch).toHaveBeenCalledWith('/api/analytics?type=platform&time_range=30d');
      expect(result).toEqual(mockAnalytics);
    });

    it('should handle API error gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error', success: false }),
      });

      await expect(getPlatformAnalytics('30d')).rejects.toThrow('Failed to fetch platform analytics');
    });
  });

  describe('getUserProgressOverTime', () => {
    it('should fetch user progress data', async () => {
      const userId = 'user-123';
      const mockProgress = [
        { date: '2023-01-01', xp: 100, sp: 10 },
        { date: '2023-01-02', xp: 200, sp: 20 }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          user: {}, 
          stats: {}, 
          recent_activity: [], 
          progress_over_time: mockProgress,
          success: true
        }),
      });

      const result = await getUserProgressOverTime(userId, '30d');

      expect(fetch).toHaveBeenCalledWith(`/api/analytics?type=user&user_id=${userId}&time_range=30d`);
      expect(result).toEqual(mockProgress);
    });

    it('should return empty array when API returns no progress data', async () => {
      const userId = 'user-123';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await getUserProgressOverTime(userId, '30d');

      expect(result).toEqual([]);
    });
  });
});