'use client';

import { useState, useEffect, useRef } from 'react';
import TopLeftQuadrant from '@/components/quadrants/top-left';
import TopRightQuadrant from '@/components/quadrants/top-right';
import BottomLeftQuadrant from '@/components/quadrants/bottom-left';
import BottomRightQuadrant from '@/components/quadrants/bottom-right';
import type { DSC, User } from '@/types';
import { Header } from './header';
import { ExpiringDscAlert } from './expiring-dsc-alert';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { getDashboardDataAction } from '@/app/actions';

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <main className="flex-1 p-4 lg:p-6">
        <div className="mt-4 grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
           <Skeleton className="h-full w-full rounded-lg" />
           <Skeleton className="h-full w-full rounded-lg" />
           <Skeleton className="h-full w-full rounded-lg" />
           <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}

export default function DashboardClient() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dscs, setDscs] = useState<DSC[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [highlightedItem, setHighlightedItem] = useState<{
    type: 'dsc' | 'employee';
    id: string;
  } | null>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      const result = await getDashboardDataAction();
      if(result.data) {
        setAllUsers(result.data.users);
        setDscs(result.data.dscs);
      } else {
        // Handle error, maybe show a toast
        console.error("Failed to fetch dashboard data:", result.message);
      }
      setIsLoadingData(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
        if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
        }
    }
  }, []);

  const handleHighlight = (item: { type: 'dsc' | 'employee'; id: string } | null) => {
    if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedItem(item);
    if (item) {
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedItem(null);
      }, 3000);
    }
  };

  if (isLoadingData || !user) {
    return <DashboardSkeleton />;
  }

  // Create a static admin profile for the person who has logged in.
  // This user is not stored in the 'users' collection. They are just an operator.
  const currentUser: User = {
    id: user.uid,
    name: user.email || 'Admin',
    role: 'leader',
    hasDsc: false, // The operator/admin doesn't hold a DSC themselves.
  };
  
  const dscsInStorage = dscs.filter((dsc) => dsc.status === 'storage');
  const leaders = allUsers.filter(u => u.role === 'leader');
  const employees = allUsers.filter(u => u.role === 'employee');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <ExpiringDscAlert dscs={dscs} currentUser={currentUser} />
        <div className="mt-4 grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
          <div className="h-full min-h-[300px] lg:min-h-0">
            <TopLeftQuadrant leaders={leaders} allDscs={dscs} currentUser={currentUser} />
          </div>
          <div className="h-full min-h-[300px] lg:min-h-0">
            <TopRightQuadrant 
              dscs={dscsInStorage}
              currentUser={currentUser}
              highlightedId={highlightedItem?.type === 'dsc' ? highlightedItem.id : null}
              onDscSelect={(dsc) => handleHighlight({type: 'dsc', id: dsc.location.mainBox.toString()})}
            />
          </div>
          <div className="h-full min-h-[300px] lg:min-h-0">
            <BottomLeftQuadrant 
              employees={employees} 
              highlightedId={highlightedItem?.type === 'employee' ? highlightedItem.id : null}
            />
          </div>
          <div className="h-full min-h-[300px] lg:min-h-0">
            <BottomRightQuadrant 
              allDscs={dscs} 
              allUsers={allUsers} 
              currentUser={currentUser}
              onHighlight={handleHighlight}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
