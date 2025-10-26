// __tests__/unit/quest-utils.test.ts
import { 
  fetchAvailableQuests, 
  assignToQuest, 
  submitQuest,
  getNextRank 
} from '@/lib/quest-utils';

// Mock the supabase client
jest.mock('@/lib/quest-utils', () => ({
  ...jest.requireActual('@/lib/quest-utils'),
  fetchAvailableQuests: jest.fn(),
  assignToQuest: jest.fn(),
  submitQuest: jest.fn(),
  getNextRank: jest.fn(),
}));

describe('Quest Utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNextRank', () => {
    it('should return correct next rank and XP for F rank', () => {
      const result = getNextRank(500);
      expect(result.rank).toBe('F');
      expect(result.nextRankXp).toBe(1000);
    });

    it('should return correct next rank and XP for E rank', () => {
      const result = getNextRank(1500);
      expect(result.rank).toBe('E');
      expect(result.nextRankXp).toBe(3000);
    });

    it('should return S rank when XP exceeds threshold', () => {
      const result = getNextRank(30000);
      expect(result.rank).toBe('S');
      expect(result.nextRankXp).toBe(-1); // S rank is max
    });

    it('should handle edge case at exact threshold', () => {
      const result = getNextRank(1000);
      expect(result.rank).toBe('E');
      expect(result.nextRankXp).toBe(3000);
    });
  });

  describe('fetchAvailableQuests', () => {
    it('should fetch available quests successfully', async () => {
      const mockQuests = [
        {
          id: '1',
          title: 'Test Quest',
          description: 'Test Description',
          difficulty: 'D',
          xp_reward: 500,
          skill_points_reward: 100,
          quest_category: 'frontend',
          company_id: 'company-1',
          status: 'available'
        }
      ];

      (fetchAvailableQuests as jest.MockedFunction<typeof fetchAvailableQuests>)
        .mockResolvedValue(mockQuests);

      const result = await fetchAvailableQuests();
      expect(result).toEqual(mockQuests);
      expect(fetchAvailableQuests).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when fetching fails', async () => {
      (fetchAvailableQuests as jest.MockedFunction<typeof fetchAvailableQuests>)
        .mockRejectedValue(new Error('Failed to fetch quests'));

      await expect(fetchAvailableQuests()).rejects.toThrow('Failed to fetch quests');
    });
  });

  describe('assignToQuest', () => {
    it('should assign user to quest successfully', async () => {
      const mockAssignment = {
        id: 'assignment-1',
        quest_id: 'quest-1',
        user_id: 'user-1',
        status: 'assigned',
        assigned_at: new Date().toISOString()
      };

      (assignToQuest as jest.MockedFunction<typeof assignToQuest>)
        .mockResolvedValue(mockAssignment);

      const result = await assignToQuest('quest-1', 'user-1');
      expect(result).toEqual(mockAssignment);
      expect(assignToQuest).toHaveBeenCalledWith('quest-1', 'user-1');
    });

    it('should throw an error when assignment fails', async () => {
      (assignToQuest as jest.MockedFunction<typeof assignToQuest>)
        .mockRejectedValue(new Error('Failed to assign to quest'));

      await expect(assignToQuest('quest-1', 'user-1')).rejects.toThrow('Failed to assign to quest');
    });
  });
});