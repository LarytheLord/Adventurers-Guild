import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyStripeWebhook } from '@/lib/stripe';
import { notifyDiscord } from '@/lib/discord-notify';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;
  try {
    event = verifyStripeWebhook(body, signature);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const questId = pi.metadata?.questId;

        if (questId) {
          await prisma.transaction.updateMany({
            where: { providerPaymentId: pi.id },
            data: {
              status: 'completed',
              completedAt: new Date(),
            },
          });

          await notifyDiscord('alerts', `Payment completed via Stripe for quest ${questId}: ${pi.currency?.toUpperCase()} ${(pi.amount / 100).toFixed(2)}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        await prisma.transaction.updateMany({
          where: { providerPaymentId: pi.id },
          data: { status: 'failed' },
        });
        break;
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object;
        await prisma.transaction.updateMany({
          where: { providerPaymentId: pi.id },
          data: { status: 'cancelled' },
        });
        break;
      }

      case 'account.updated': {
        // Stripe Connect account status change
        const account = event.data.object;
        if (account.charges_enabled && account.payouts_enabled) {
          await prisma.adventurerProfile.updateMany({
            where: { stripeAccountId: account.id },
            data: {}, // Account is ready — no field to update currently
          });
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge without processing
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
