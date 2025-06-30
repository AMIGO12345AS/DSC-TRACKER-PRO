import { Suspense } from 'react';
import { getDscs } from '@/services/dsc';
import { getUsers } from '@/services/user';
import { User } from '@/types';
import DashboardClient from '@/components/dashboard-client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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

async function DashboardData() {
  const leaders = await getUsers('leader');
  const employees = await getUsers('employee');
  const dscs = await getDscs();
  
  // In a real app, you'd get this from an auth provider
  const loggedInUser: User = { id: 'L1', name: 'Current Leader', role: 'leader', hasDsc: false };

  return (
    <DashboardClient
      leaders={leaders}
      employees={employees}
      dscs={dscs}
      loggedInUser={loggedInUser}
    />
  );
}


export default function DashboardPage() {
  return (
    <div className="flex-1 p-4 lg:p-6">
       <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  );
}
