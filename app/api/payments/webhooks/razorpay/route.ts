import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyRazorpayWebhook } from '@/lib/razorpay';
import { notifyDiscord } from '@/lib/discord-notify';

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
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!signature) {
    return Response.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
  }

  if (!verifyRazorpayWebhook(body, signature)) {
    console.error('Razorpay webhook signature verification failed');
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(body);
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

        // Redundant with payment.captured but ensures order is marked paid
        await prisma.transaction.updateMany({
          where: { providerOrderId: order.id, status: 'pending' },
          data: { status: 'completed', completedAt: new Date() },
        });
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
