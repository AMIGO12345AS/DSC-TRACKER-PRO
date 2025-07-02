'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUserSession } from '@/hooks/use-user-session';
import DashboardClient from '@/components/dashboard-client';
import { Loader2 } from 'lucide-react';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
    </div>
  );
}

function DashboardPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { selectedUser } = useUserSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated via Firebase
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    // Redirect if authenticated but no user profile is selected
    if (user && !selectedUser) {
      router.replace('/select-user');
    }
  }, [user, authLoading, selectedUser, router]);


  // Show loader while auth state is loading or if we are waiting for a user profile to be selected.
  if (authLoading || !user || !selectedUser) {
    return <FullPageLoader />;
  }
  
  return (
      <DashboardClient />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <DashboardPageContent />
    </Suspense>
  );
}
