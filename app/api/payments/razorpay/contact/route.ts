import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { createRazorpayContact, createRazorpayFundAccount, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: 'Razorpay not configured. Using simulated payments.' },
        { status: 501 }
      );
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adventurer = await prisma.adventurerProfile.findFirst({
      where: { user: { email: session.user.email } },
      include: { user: true },
    });
    if (!adventurer) {
      return NextResponse.json({ error: 'Adventurer profile not found' }, { status: 404 });
    }

    if (adventurer.razorpayFundAccountId) {
      return NextResponse.json({ success: true, message: 'Bank account already linked' });
    }

    const { ifscCode, accountNumber, accountHolderName } = await req.json();
    if (!ifscCode || !accountNumber) {
      return NextResponse.json({ error: 'IFSC code and account number required' }, { status: 400 });
    }

    const name = accountHolderName || adventurer.user.name || 'Unknown';

    let contactId = adventurer.razorpayContactId;
    if (!contactId) {
      const contact = await createRazorpayContact({
        name,
        email: adventurer.user.email,
        contact: '9999999999', // TODO: get from user profile later
        referenceId: adventurer.userId,
      });
      contactId = contact.id;

      await prisma.adventurerProfile.update({
        where: { userId: adventurer.userId },
        data: { razorpayContactId: contactId },
      });
    }

    const fundAccount = await createRazorpayFundAccount({
      contactId,
      name,
      ifsc: ifscCode,
      accountNumber,
    });

    await prisma.adventurerProfile.update({
      where: { userId: adventurer.userId },
      data: { razorpayFundAccountId: fundAccount.id },
    });

    return NextResponse.json({ success: true, message: 'Bank account linked successfully' });
  } catch (error: unknown) {
    console.error('Razorpay contact/fund account error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}