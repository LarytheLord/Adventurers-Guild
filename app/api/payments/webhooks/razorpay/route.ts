import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyDiscord } from '@/lib/discord-notify';
import crypto from 'crypto';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
        notes?: Record<string, string>;
      };
    };
    transfer?: {
      entity: {
        id: string;
        fund_account_id: string;
        amount: number;
        currency: string;
        status: string;
        reference_id: string;
        notes?: Record<string, string>;
      };
    };
    fund_account?: {
      entity: {
        id: string;
        contact_id: string;
        status: string;
        bank_name?: string;
        ifsc?: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature) {
    console.error('Missing Razorpay signature header');
    return Response.json({ error: 'Missing signature' }, { status: 403 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('RAZORPAY_KEY_SECRET not configured');
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    console.error('Invalid webhook signature');
    return Response.json({ error: 'Invalid signature' }, { status: 403 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    switch (payload.event) {
      case 'payment.captured': {
        const payment = payload.payload.payment?.entity;
        if (!payment) break;

        await prisma.transaction.updateMany({
          where: { providerOrderId: payment.order_id },
          data: {
            status: 'completed',
            providerPaymentId: payment.id,
            paymentMethod: payment.method || 'razorpay',
            completedAt: new Date(),
          },
        });

        const questId = payment.notes?.questId;
        if (questId) {
          await notifyDiscord(
            'alerts',
            `Payment completed via Razorpay for quest ${questId}: ${payment.currency} ${(payment.amount / 100).toFixed(2)}`
          );
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload.payload.payment?.entity;
        if (!payment) break;

        await prisma.transaction.updateMany({
          where: { providerOrderId: payment.order_id },
          data: { status: 'failed' },
        });
        break;
      }

      case 'order.paid': {
        const order = payload.payload.order?.entity;
        if (!order) break;

        await prisma.transaction.updateMany({
          where: { providerOrderId: order.id, status: 'pending' },
          data: { status: 'completed', completedAt: new Date() },
        });
        break;
      }

      case 'transfer.processed': {
        const transfer = payload.payload.transfer?.entity;
        if (!transfer) break;

        await prisma.transaction.updateMany({
          where: { providerPaymentId: transfer.id },
          data: { status: 'completed' },
        });
        console.log(`Transfer ${transfer.id} marked as completed`);
        break;
      }

      case 'transfer.failed': {
        const transfer = payload.payload.transfer?.entity;
        if (!transfer) break;

        await prisma.transaction.updateMany({
          where: { providerPaymentId: transfer.id },
          data: { status: 'failed' },
        });
        console.error(`Transfer ${transfer.id} failed`);
        break;
      }

      case 'fund_account.rejected': {
        const fundAccount = payload.payload.fund_account?.entity;
        if (!fundAccount) break;

        // Use findFirst because razorpayFundAccountId is not a unique field
        const profile = await prisma.adventurerProfile.findFirst({
          where: { razorpayFundAccountId: fundAccount.id },
          select: { userId: true },
        });

        await prisma.adventurerProfile.updateMany({
          where: { razorpayFundAccountId: fundAccount.id },
          data: { razorpayFundAccountId: null },
        });

        if (profile) {
          await prisma.notification.create({
            data: {
              userId: profile.userId,
              type: 'system_message',
              title: 'Bank Account Rejected',
              message: 'Your bank account failed verification. Please link a different account in Settings.',
            },
          });
        }
        console.error(`Fund account ${fundAccount.id} rejected, notified user`);
        break;
      }

      default:
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook processing error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}