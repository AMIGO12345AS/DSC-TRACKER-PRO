'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import DashboardClient from '@/components/dashboard-client';
import { Loader2 } from 'lucide-react';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Authenticating...</p>
    </div>
  );
}

function DashboardPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect handles redirection safely after the component has mounted.
    // It will only redirect if loading is complete and we can confirm there's no user.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // While the auth state is loading, or if there's no user yet (and we're not loading),
  // we display a loader. This prevents the dashboard from rendering prematurely.
  if (loading || !user) {
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
