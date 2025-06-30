import { Suspense } from 'react';
import { getDscs } from '@/services/dsc';
import { getUsers } from '@/services/user';
import { User } from '@/types';
import DashboardClient from '@/components/dashboard-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { ensureDatabaseSeeded } from '@/services/seed';
import SetupGuide from '@/components/setup-guide';

function DashboardSkeleton() {
  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
      <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
      <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
      <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
      <Card><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
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
            Please check your Firebase project setup, including your <strong>.env</strong> file and
            Firestore security rules. Your rules may be too restrictive. For
            development, you can temporarily allow all reads and writes.
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

    const [leaders, employees, dscs] = await Promise.all([
      getUsers('leader'),
      getUsers('employee'),
      getDscs()
    ]);
    
    // If the database is still empty after the seed attempt, show the setup guide.
    if (leaders.length === 0 && employees.length === 0) {
      return <SetupGuide />;
    }
    
    // In a real app, you'd get this from an auth provider
    const loggedInUser: User = leaders.find(l => l.name === 'Current Leader') || leaders[0] || { id: 'L1', name: 'Current Leader', role: 'leader', hasDsc: false };

    return (
      <DashboardClient
        leaders={leaders}
        employees={employees}
        dscs={dscs}
        loggedInUser={loggedInUser}
      />
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return <ErrorDisplay message={errorMessage} />;
  }
}


export default function DashboardPage() {
  return (
    <div className="h-full flex-1 p-4 lg:p-6">
       <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}
