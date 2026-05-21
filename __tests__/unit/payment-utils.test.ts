import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { processQuestPayment } from '@/lib/razorpay-payout';

const findFirstMock: jest.Mock = jest.fn();
const findUniqueMock: jest.Mock = jest.fn();
const createMock: jest.Mock = jest.fn();

jest.mock('@/lib/db', () => ({
  prisma: {
    transaction: {
      findFirst: findFirstMock,
      create: createMock,
    },
    adventurerProfile: {
      findUnique: findUniqueMock,
    },
  },
}));

jest.mock('@/lib/razorpay', () => ({
  isRazorpayConfigured: jest.fn(() => false),
  createRazorpayPayout: jest.fn(),
}));

describe('Payment Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processQuestPayment', () => {
    it('should return already processed if transaction exists', async () => {
      findFirstMock.mockResolvedValue({
        id: 'txn_123',
        status: 'completed',
      });

      const result = await processQuestPayment('quest1', 'user1', 1000);

      expect(result.success).toBe(true);
      expect(result.alreadyProcessed).toBe(true);
    });

    it('should return error if no bank account linked', async () => {
      findFirstMock.mockResolvedValue(null);
      findUniqueMock.mockResolvedValue({
        razorpayFundAccountId: null,
      });

      const result = await processQuestPayment('quest1', 'user1', 1000);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No bank account linked');
    });

    it('should process simulated payment when Razorpay not configured', async () => {
      findFirstMock.mockResolvedValue(null);
      findUniqueMock.mockResolvedValue({
        razorpayFundAccountId: 'fa_123',
      });

      const result = await processQuestPayment('quest1', 'user1', 1000);

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
    });
  });
});