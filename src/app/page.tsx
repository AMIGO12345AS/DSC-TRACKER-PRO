import { Suspense } from 'react';
import { getDscs } from '@/services/dsc';
import { getUsers } from '@/services/user';
import DashboardClient from '@/components/dashboard-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { ensureDatabaseSeeded } from '@/services/seed';
import SetupGuide from '@/components/setup-guide';

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
            <Skeleton className="h-8 w-32" />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 lg:p-6">
        <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
          <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
        </div>
      </main>
    </div>
  )
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="max-w-lg border-destructive">
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


async function DashboardData() {
  try {
    // This will attempt to create the collections and add sample data if the DB is empty
    // and a service account key is provided. It will not crash if it fails.
    await ensureDatabaseSeeded();

    const [users, dscs] = await Promise.all([
      getUsers(),
      getDscs()
    ]);
    
    // If the database is still empty after the seed attempt, show the setup guide.
    if (users.length === 0) {
      return <SetupGuide />;
    }

    return (
      <DashboardClient
        allUsers={users}
        dscs={dscs}
      />
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return <ErrorDisplay message={errorMessage} />;
  }
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
