// app/admin/page.tsx
import { redirect } from 'next/navigation';

// This page will be client-side only
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  // Redirect to login since this page requires authentication
  redirect('/login');
}