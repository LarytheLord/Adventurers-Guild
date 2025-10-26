// app/api/payments/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const questId = searchParams.get('quest_id');
    const type = searchParams.get('type'); // 'incoming' for payments to user, 'outgoing' for payments by company
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    // Validate user ID is provided
    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from('transactions') // Assuming we have a transactions table
      .select(`
        id,
        from_user_id,
        to_user_id,
        quest_id,
        amount,
        currency,
        status,
        payment_method,
        transaction_id,
        created_at,
        updated_at,
        from_user:users!from_user_id (
          name,
          email
        ),
        to_user:users!to_user_id (
          name,
          email
        ),
        quests (
          title
        )
      `)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add filters based on type
    if (type === 'incoming') {
      query = query.eq('to_user_id', userId);
    } else if (type === 'outgoing') {
      query = query.eq('from_user_id', userId);
    } else {
      query = query.or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
    }

    if (questId) {
      query = query.eq('quest_id', questId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ transactions: data, success: true });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return Response.json({ error: 'Failed to fetch transactions', success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['from_user_id', 'to_user_id', 'quest_id', 'amount', 'currency'];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return Response.json({ error: `${field} is required`, success: false }, { status: 400 });
      }
    }

    // In a real implementation, you would integrate with a payment processor like Stripe
    // For this example, we'll simulate the payment process
    
    // Check if the quest exists and is completed
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('title, status, monetary_reward')
      .eq('id', body.quest_id)
      .single();

    if (questError || !quest || quest.status !== 'completed') {
      return Response.json({ error: 'Quest is not completed or does not exist', success: false }, { status: 400 });
    }

    // Check if payment already exists for this quest
    const { data: existingTransaction, error: existingError } = await supabase
      .from('transactions')
      .select('id')
      .eq('quest_id', body.quest_id)
      .single();

    if (existingTransaction) {
      return Response.json({ error: 'Payment already processed for this quest', success: false }, { status: 400 });
    }

    // Create a pending transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        from_user_id: body.from_user_id,
        to_user_id: body.to_user_id,
        quest_id: body.quest_id,
        amount: body.amount,
        currency: body.currency,
        status: 'pending',
        payment_method: body.payment_method || 'stripe',
        description: body.description || `Payment for quest completion: ${quest.title}`
      }])
      .select()
      .single();

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    // In a real implementation, you would now process the payment with a payment processor
    // Here we'll just simulate and update the status to completed
    // After integration with Stripe, you would update the status based on the payment result
    
    // For simulation purposes, let's complete the transaction
    const { data: completedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        transaction_id: `mock_txn_${Date.now()}` // In real implementation, this would be the payment processor's transaction ID
      })
      .eq('id', transaction.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Send notification to receiving user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([{
        user_id: body.to_user_id,
        title: 'Payment Received',
        message: `You've received payment of ${body.amount} ${body.currency} for completing the quest "${quest.title}"`,
        type: 'payment_received',
        data: {
          quest_id: body.quest_id,
          amount: body.amount,
          currency: body.currency
        }
      }]);

    if (notificationError) {
      console.error('Error sending payment notification:', notificationError);
    }

    // Update company profile to track spending
    // First get current total_spent
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('total_spent')
      .eq('user_id', body.from_user_id)
      .single();
    
    const currentSpent = companyProfile?.total_spent || 0;
    const { error: companyUpdateError } = await supabase
      .from('company_profiles')
      .update({ 
        total_spent: currentSpent + body.amount
      })
      .eq('user_id', body.from_user_id);

    if (companyUpdateError) {
      console.error('Error updating company profile:', companyUpdateError);
    }

    return Response.json({ transaction: completedTransaction, success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    return Response.json({ error: 'Failed to process payment', success: false }, { status: 500 });
  }
}

// Webhook endpoint for payment processor (e.g., Stripe)
export async function PUT(request: NextRequest) {
  try {
    // This would handle webhooks from payment processors
    // In a real implementation, you would verify the webhook signature
    // and update the transaction status accordingly
    
    const body = await request.json();
    
    // For demonstration purposes, we'll just return success
    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Extract the transaction ID from the webhook
    // 3. Update the transaction status in the database
    // 4. Send notifications
    
    return Response.json({ received: true, success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: 'Failed to process webhook', success: false }, { status: 500 });
  }
}