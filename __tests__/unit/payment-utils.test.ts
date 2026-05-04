import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { processQuestPayment } from '@/lib/razorpay-payout';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    transaction: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    adventurerProfile: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock razorpay module
jest.mock('@/lib/razorpay', () => ({
  isRazorpayConfigured: jest.fn(() => false),
  createRazorpayPayout: jest.fn(),
}));

// Import after mocks
import { prisma } from '@/lib/db';

describe('Payment Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processQuestPayment', () => {
    it('should return already processed if transaction exists', async () => {
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({
        id: 'txn_123',
        status: 'completed',
      });

      const result = await processQuestPayment('quest1', 'user1', 1000);

      expect(result.success).toBe(true);
      expect(result.alreadyProcessed).toBe(true);
    });

    it('should return error if no bank account linked', async () => {
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.adventurerProfile.findUnique as jest.Mock).mockResolvedValue({
        razorpayFundAccountId: null,
      });

      const result = await processQuestPayment('quest1', 'user1', 1000);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No bank account linked');
    });

    it('should process simulated payment when Razorpay not configured', async () => {
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.adventurerProfile.findUnique as jest.Mock).mockResolvedValue({
        razorpayFundAccountId: 'fa_123',
      });

      const result = await processQuestPayment('quest1', 'user1', 1000);

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
    });
  });
});
