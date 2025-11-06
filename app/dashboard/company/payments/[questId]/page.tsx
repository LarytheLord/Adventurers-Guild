'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PaymentProcessor from '@/components/PaymentProcessor';

export default function QuestPaymentPage() {
  const { questId } = useParams();
  const router = useRouter();
  
  // questId might be an array, so we take the first value
  const id = Array.isArray(questId) ? questId[0] : questId;

  // Redirect if no questId is provided
  useEffect(() => {
    if (!id) {
      router.push('/dashboard/company');
    }
  }, [id, router]);

  if (!id) {
    return null; // Render nothing while redirecting
  }

  return (
    <PaymentProcessor questId={id} />
  );
}