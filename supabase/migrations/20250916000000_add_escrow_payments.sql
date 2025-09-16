-- Add escrow payments table for handling quest payments and platform fees
CREATE TABLE public.escrow_payments (
  id TEXT PRIMARY KEY, -- Stripe payment intent ID
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  adventurer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  adventurer_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'held', 'released', 'refunded')),
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(quest_id) -- One payment per quest
);

-- Add indexes for performance
CREATE INDEX idx_escrow_payments_company_id ON escrow_payments(company_id);
CREATE INDEX idx_escrow_payments_adventurer_id ON escrow_payments(adventurer_id);
CREATE INDEX idx_escrow_payments_status ON escrow_payments(status);
CREATE INDEX idx_escrow_payments_created_at ON escrow_payments(created_at);

-- Enable RLS
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Companies can view their payment records" ON public.escrow_payments
FOR SELECT TO authenticated USING (company_id = auth.uid());

CREATE POLICY "Adventurers can view their payment records" ON public.escrow_payments
FOR SELECT TO authenticated USING (adventurer_id = auth.uid());

CREATE POLICY "Admins can view all payment records" ON public.escrow_payments
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

CREATE POLICY "Only system can insert payment records" ON public.escrow_payments
FOR INSERT TO authenticated WITH CHECK (false); -- Will be handled by service role

CREATE POLICY "Only system can update payment records" ON public.escrow_payments
FOR UPDATE TO authenticated USING (false); -- Will be handled by service role

-- Add wallet balance tracking to users table
ALTER TABLE public.users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0;

-- Function to safely increment wallet balance
CREATE OR REPLACE FUNCTION public.increment_wallet_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE public.users 
  SET wallet_balance = wallet_balance + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely increment total earnings
CREATE OR REPLACE FUNCTION public.increment_total_earnings(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE public.users 
  SET total_earnings = total_earnings + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the quest completion trigger to work with new payment system
CREATE OR REPLACE FUNCTION public.update_user_xp_on_quest_completion()
RETURNS TRIGGER AS $$
DECLARE
  quest_record RECORD;
  user_record RECORD;
  new_rank user_rank;
BEGIN
  -- Only process when submission is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Get quest details
    SELECT * INTO quest_record FROM public.quests WHERE id = NEW.quest_id;
    
    -- Get current user stats
    SELECT xp, rank INTO user_record FROM public.users WHERE id = NEW.user_id;
    
    -- Update user XP
    UPDATE public.users
    SET xp = xp + quest_record.xp_reward
    WHERE id = NEW.user_id;
    
    -- Calculate new rank based on updated XP
    SELECT 
      CASE 
        WHEN (user_record.xp + quest_record.xp_reward) >= 30000 THEN 'S'::user_rank
        WHEN (user_record.xp + quest_record.xp_reward) >= 15000 THEN 'A'::user_rank
        WHEN (user_record.xp + quest_record.xp_reward) >= 7500 THEN 'B'::user_rank
        WHEN (user_record.xp + quest_record.xp_reward) >= 3000 THEN 'C'::user_rank
        WHEN (user_record.xp + quest_record.xp_reward) >= 1000 THEN 'D'::user_rank
        ELSE 'F'::user_rank
      END INTO new_rank;
    
    -- Update rank if it changed
    IF new_rank != user_record.rank THEN
      UPDATE public.users
      SET rank = new_rank
      WHERE id = NEW.user_id;
      
      -- Create rank up notification
      INSERT INTO public.notifications (user_id, title, message, type, data)
      VALUES (
        NEW.user_id,
        'Rank Up!',
        format('Congratulations! You have been promoted from %s to %s rank!', user_record.rank, new_rank),
        'rank_up',
        jsonb_build_object(
          'old_rank', user_record.rank,
          'new_rank', new_rank,
          'quest_id', NEW.quest_id,
          'xp_gained', quest_record.xp_reward
        )
      );
    END IF;
    
    -- Update quest status to completed
    UPDATE public.quests
    SET status = 'completed'
    WHERE id = NEW.quest_id;
    
    -- Create completion notification
    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      NEW.user_id,
      'Quest Completed!',
      format('You have successfully completed a quest and earned %s XP!', quest_record.xp_reward),
      'quest_completed',
      jsonb_build_object(
        'quest_id', NEW.quest_id,
        'xp_gained', quest_record.xp_reward,
        'new_xp_total', user_record.xp + quest_record.xp_reward
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.escrow_payments TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_wallet_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_total_earnings TO authenticated;
