import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { validatePaymentInfo } from '@/lib/payment-utils';

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'incoming' or 'outgoing'
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';

    if (!userId) {
      return Response.json({ error: 'User ID is required', success: false }, { status: 400 });
    }

    // Build query based on type
    let query = supabase
      .from('transactions')
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
        description,
        created_at,
        updated_at,
        completed_at,
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

    // Validate payment information
    if (body.payment_info) {
      const validation = validatePaymentInfo(
        body.payment_info.card_number,
        body.payment_info.expiry,
        body.payment_info.cvc
      );
      
      if (!validation.isValid) {
        return Response.json({ error: validation.error, success: false }, { status: 400 });
      }
    }

    // Verify that the quest exists and is completed
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('title, status, xp_reward, skill_points_reward')
      .eq('id', body.quest_id)
      .single();

    if (questError || !quest) {
      return Response.json({ error: 'Quest not found', success: false }, { status: 404 });
    }

    if (quest.status !== 'completed') {
      return Response.json({ error: 'Quest must be completed before payment', success: false }, { status: 400 });
    }

    // Check if a payment already exists for this quest
    const { data: existingPayment } = await supabase
      .from('transactions')
      .select('id')
      .eq('quest_id', body.quest_id)
      .eq('to_user_id', body.to_user_id)
      .single();

    if (existingPayment) {
      return Response.json({ error: 'Payment already exists for this quest', success: false }, { status: 400 });
    }

    // In a real implementation, you would integrate with a payment processor like Stripe
    // For now, we'll simulate the payment and create a transaction record
    
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        from_user_id: body.from_user_id,
        to_user_id: body.to_user_id,
        quest_id: body.quest_id,
        amount: body.amount,
        currency: body.currency,
        status: 'pending', // Initially pending until payment processor confirms
        payment_method: body.payment_method || 'credit_card',
        description: body.description || `Payment for quest completion: ${quest.title}`,
        transaction_id: `txn_${Date.now()}` // In real implementation, this would come from payment processor
      }])
      .select()
      .single();

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    // Simulate payment processing (in a real app, this would be handled by a webhook from the payment processor)
    // For now, we'll immediately update the status to completed
    const { data: completedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transaction.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Update user's XP and skill points
    const xpGain = quest.xp_reward || 0;
    const skillPointsGain = quest.skill_points_reward || 0;
    
    const { error: userUpdateError } = await supabase.rpc('update_user_xp_and_skills', {
      user_id_input: body.to_user_id,
      xp_gained: xpGain,
      skill_points_gained: skillPointsGain
    });

    if (userUpdateError) {
      console.error('Error updating user XP and skills:', userUpdateError);
      // Don't fail the transaction if this fails, just log it
    }

    // Update company's spending
    const { error: companyUpdateError } = await supabase.rpc('update_company_spending', {
      company_id_input: body.from_user_id,
      amount_spent: body.amount
    });

    if (companyUpdateError) {
      console.error('Error updating company spending:', companyUpdateError);
      // Don't fail the transaction if this fails, just log it
    }

    // Send notification to receiving user
    await supabase
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

    return Response.json({ 
      transaction: completedTransaction, 
      success: true,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return Response.json({ error: 'Failed to process payment', success: false }, { status: 500 });
  }
}