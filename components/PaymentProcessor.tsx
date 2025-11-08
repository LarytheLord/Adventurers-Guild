'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, CheckCircle, Coins, Target } from 'lucide-react';
import PaymentForm from './PaymentForm';
import { formatCurrency } from '@/lib/payment-utils';

interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  status: string;
}

interface PaymentProcessorProps {
  questId: string;
}

export default function PaymentProcessor({ questId }: PaymentProcessorProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'company' && session.user.role !== 'admin') {
      // Only companies can make payments
      router.push('/dashboard');
      return;
    }

    const fetchQuest = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/quests/${questId}`);
        const data = await response.json();

        if (!data.success || !data.quests?.[0]) {
          setError(data.error || 'Failed to fetch quest');
          return;
        }

        const questData = data.quests[0];
        
        // Verify user has permission to pay for this quest
        if (session?.user?.role !== 'admin' && questData.company_id !== session?.user?.id) {
          setError('Unauthorized to make payment for this quest');
          return;
        }

        setQuest(questData);
      } catch (err) {
        console.error('Error fetching quest:', err);
        setError('An error occurred while fetching quest details');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && questId) {
      fetchQuest();
    }
  }, [status, session, questId, router]);

  const handleMakePayment = () => {
    if (!quest || !session?.user?.id) return;
    
    // In a real implementation, we would need the adventurer ID
    // For now, we'll get it from the assignment
    const processPayment = async () => {
      try {
        // Find the adventurer who completed this quest
        const assignmentResponse = await fetch(`/api/quests/assignments?quest_id=${questId}`);
        const assignmentData = await assignmentResponse.json();
        
        if (!assignmentData.success || assignmentData.assignments.length === 0) {
          setError('No adventurer assigned to this quest');
          return;
        }
        
        const adventurerId = assignmentData.assignments[0].user_id;
        
        setShowPaymentForm(true);
      } catch (err) {
        console.error('Error finding adventurer:', err);
        setError('Could not find assigned adventurer');
      }
    };
    
    processPayment();
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setPaymentSuccess(true);
    setShowPaymentForm(false);
    
    // Optionally, redirect or update the quest status
    setTimeout(() => {
      router.push('/dashboard/company');
    }, 2000);
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="container mx-auto py-6">
        <p>Quest not found</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl mt-4">Payment Successful!</CardTitle>
            <CardDescription>
              You've successfully paid for quest completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-medium">{quest.title}</h3>
                <p className="text-sm text-muted-foreground">{quest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-center p-3 bg-muted rounded-lg">
                  <Coins className="w-5 h-5 mr-2 text-green-500" />
                  <span>{formatCurrency(quest.monetary_reward || 0)}</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-muted rounded-lg">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  <span>{quest.xp_reward} XP</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                The adventurer has been notified of the payment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPaymentForm && quest.monetary_reward) {
    return (
      <div className="container mx-auto py-6">
        <PaymentForm
          questId={quest.id}
          companyId={session?.user?.id || ''}
          adventurerId="" // Will be determined in the component
          amount={quest.monetary_reward}
          currency="USD"
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancelPayment}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Quests
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{quest.title}</CardTitle>
              <CardDescription>
                Complete payment for quest completion
              </CardDescription>
            </div>
            <Badge variant="outline">{quest.difficulty}-Rank</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Quest Details</h3>
              <p className="text-muted-foreground">{quest.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Target className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
                <div className="font-bold">{quest.xp_reward} XP</div>
                <div className="text-xs text-muted-foreground">Reward</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-bold">{quest.skill_points_reward} SP</div>
                <div className="text-xs text-muted-foreground">Skill Points</div>
              </div>
              {quest.monetary_reward && (
                <div className="text-center p-3 bg-muted rounded-lg col-span-2 md:col-span-2">
                  <Coins className="w-6 h-6 mx-auto text-green-500 mb-1" />
                  <div className="font-bold text-lg">{formatCurrency(quest.monetary_reward)}</div>
                  <div className="text-xs text-muted-foreground">Monetary Reward</div>
                </div>
              )}
            </div>

            {quest.monetary_reward && quest.monetary_reward > 0 ? (
              <div className="space-y-4">
                <Alert>
                  <Coins className="h-4 w-4" />
                  <AlertDescription>
                    This quest includes a monetary reward of {formatCurrency(quest.monetary_reward)}. 
                    Complete the payment to release funds to the adventurer.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="flex-1" 
                    onClick={handleMakePayment}
                    disabled={quest.status !== 'completed'}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {quest.status === 'completed' ? 'Complete Payment' : 'Quest Not Completed Yet'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <h3 className="text-lg font-medium mb-1">Non-monetary Quest</h3>
                <p className="text-muted-foreground">
                  This quest doesn't include a monetary reward, only XP and skill points.
                </p>
                <Button className="mt-4" onClick={() => router.back()}>
                  Return to Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}