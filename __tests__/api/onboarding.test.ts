import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/user/onboarding/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn(() => ({}));
  (mockNextAuth as any).getServerSession = jest.fn();
  return {
    __esModule: true,
    default: mockNextAuth,
    getServerSession: (mockNextAuth as any).getServerSession,
  };
});

jest.mock('@/lib/db', () => ({
  prisma: {
    adventurerProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
  },
  withDbRetry: jest.fn((fn: any) => fn()),
}));

describe('Onboarding API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/user/onboarding', () => {
    it('should update/upsert the adventurer profile successfully', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          role: 'adventurer',
        },
      };
      const getSessionMock = getServerSession as unknown as jest.Mock;
      getSessionMock.mockResolvedValue(mockSession);

      const mockPayload = {
        studentType: 'college',
        institutionName: 'Test Uni',
        yearOrExperience: '1st Year',
        skills: ['React'],
        interests: ['Frontend Development'],
        dailyWorkHours: '1-2 hours',
        expectations: 'Learn and grow in the guild.',
        autoAssign: false,
      };

      const req = new NextRequest('http://localhost:3000/api/user/onboarding', {
        method: 'POST',
        body: JSON.stringify(mockPayload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });
      expect(prisma.adventurerProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        update: expect.any(Object),
        create: expect.any(Object),
      });
    });

    it('returns 500 when upsert fails', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          role: 'adventurer',
        },
      };
      const getSessionMock = getServerSession as unknown as jest.Mock;
      getSessionMock.mockResolvedValue(mockSession);

      const mockPayload = {
        studentType: 'college',
        institutionName: 'Test Uni',
        yearOrExperience: '1st Year',
        skills: ['React'],
        interests: ['Frontend Development'],
        dailyWorkHours: '1-2 hours',
        expectations: 'Learn and grow in the guild.',
        autoAssign: false,
      };

      const req = new NextRequest('http://localhost:3000/api/user/onboarding', {
        method: 'POST',
        body: JSON.stringify(mockPayload),
      });

      (prisma.adventurerProfile.upsert as jest.Mock).mockRejectedValue(new Error('Database connection lost'));

      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Something went wrong while saving onboarding details' });
    });
  });
});
