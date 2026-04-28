declare module 'stripe' {
  class Stripe {
    constructor(apiKey: string, config?: Record<string, unknown>);
    paymentIntents: {
      create(params: Record<string, unknown>): Promise<Stripe.PaymentIntent>;
      capture(id: string): Promise<Stripe.PaymentIntent>;
      cancel(id: string): Promise<Stripe.PaymentIntent>;
    };
    transfers: {
      create(params: Record<string, unknown>): Promise<Stripe.Transfer>;
    };
    accountLinks: {
      create(params: Record<string, unknown>): Promise<{ url: string }>;
    };
    accounts: {
      create(params: Record<string, unknown>): Promise<Stripe.Account>;
    };
    webhooks: {
      constructEvent(payload: string | Buffer, signature: string, secret: string): Stripe.Event;
    };
  }

  namespace Stripe {
    type EventObject = {
      id: string;
      metadata?: Record<string, string>;
      currency?: string;
      amount?: number;
      client_secret?: string | null;
      charges_enabled?: boolean;
      payouts_enabled?: boolean;
      status?: string;
    };
    type PaymentIntent = EventObject & {
      status?: string;
    };
    type Transfer = Record<string, unknown> & { id: string };
    type Account = EventObject & { charges_enabled?: boolean; payouts_enabled?: boolean };
    type Event = {
      id?: string;
      type: string;
      data: {
        object: EventObject;
      };
    };
  }

  export = Stripe;
}

declare module 'razorpay' {
  class Razorpay {
    constructor(config: { key_id: string; key_secret: string });
    orders: {
      create(params: Record<string, unknown>): Promise<{
        id: string;
        amount: number | string;
        currency: string;
        receipt?: string;
      }>;
    };
    payments: {
      fetch(id: string): Promise<Record<string, unknown> & {
        id: string;
        status?: string;
        amount?: number | string;
        currency?: string;
        method?: string;
      }>;
    };
  }

  export = Razorpay;
}
