import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { createRazorpayContact, createRazorpayFundAccount, isRazorpayConfigured } from '@/lib/razorpay';
import { z } from 'zod';

// Zod schema for bank details validation
const bankDetailsSchema = z.object({
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (format: SBIN0001234)'),
  accountNumber: z
    .string()
    .regex(/^\d{9,18}$/, 'Account number must be 9-18 digits'),
  accountHolderName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Check Razorpay configuration
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Razorpay not configured. Using simulated payments.' },
        { status: 501 }
      );
    }

    // 2. Authenticate user
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Capture email outside transaction to avoid TypeScript issues
    const userEmail = session.user.email;

    // 3. Parse and validate request body
    const body = await req.json();
    const { ifscCode, accountNumber, accountHolderName } = body;

    const validation = bankDetailsSchema.safeParse({ ifscCode, accountNumber, accountHolderName });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // 4. Use a database transaction to prevent race condition
    const result = await prisma.$transaction(
      async (tx) => {
        // Fetch adventurer profile with user data inside transaction
        const adventurer = await tx.adventurerProfile.findFirst({
          where: { user: { email: userEmail } },
          include: { user: true },
        });

        if (!adventurer) {
          throw new Error('Adventurer profile not found');
        }

        // Double-check if already linked (prevents duplicate creation)
        if (adventurer.razorpayFundAccountId) {
          return { success: true, message: 'Bank account already linked', alreadyLinked: true };
        }

        const name = accountHolderName || adventurer.user.name || 'Unknown';

        // Create or retrieve Razorpay Contact
        let contactId = adventurer.razorpayContactId;
        if (!contactId) {
          const contact = await createRazorpayContact({
            name,
            email: adventurer.user.email,
            contact: '9999999999', // TODO: get from user profile later
            referenceId: adventurer.userId,
          });
          contactId = contact.id;

          await tx.adventurerProfile.update({
            where: { userId: adventurer.userId },
            data: { razorpayContactId: contactId },
          });
        }

        // Create Fund Account
        const fundAccount = await createRazorpayFundAccount({
          contactId,
          name,
          ifsc: ifscCode,
          accountNumber,
        });

        // Save fund account ID
        await tx.adventurerProfile.update({
          where: { userId: adventurer.userId },
          data: { razorpayFundAccountId: fundAccount.id },
        });

        return { success: true, message: 'Bank account linked successfully' };
      },
      {
        maxWait: 5000, // 5 seconds max wait for transaction
        timeout: 10000, // 10 seconds timeout
      }
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Razorpay contact/fund account error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}