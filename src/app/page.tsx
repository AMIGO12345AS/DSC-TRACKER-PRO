'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import DashboardClient from '@/components/dashboard-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Loader2 } from 'lucide-react';
import SetupGuide from '@/components/setup-guide';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Authenticating...</p>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="max-w-lg border-destructive glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle />
            Application Error
          </CardTitle>
          <CardDescription>
            There was a problem loading the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-md bg-muted p-4 font-mono text-sm text-destructive">
            {message}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Please check your Firebase project setup, including your Firestore security rules. 
            If your database is empty, the app may show a setup guide.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardPageContent() {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    // This should ideally not be reached if middleware is active,
    // but it's a good fallback for client-side protection.
    router.replace('/login');
    return <FullPageLoader />;
  }
  
  if (!userProfile) {
      // This state means Firebase Auth user exists, but Firestore profile doesn't.
      // This can happen if signup was interrupted.
      // A setup guide is a good way to handle this for first-time users.
      // A more robust app might have a "complete your profile" page.
      return <SetupGuide isNewUser={true} />;
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
