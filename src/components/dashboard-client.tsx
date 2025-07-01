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

interface DashboardClientProps {
    allUsers: User[];
    dscs: DSC[];
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
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


export default function DashboardClient({ allUsers, dscs }: DashboardClientProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(allUsers.find(u => u.role === 'leader') || allUsers[0] || null);

  const [highlightedItem, setHighlightedItem] = useState<{
    type: 'dsc' | 'employee';
    id: string;
  } | null>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on component unmount
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

  if (!currentUser) {
    return <DashboardSkeleton />;
  }
  
  const dscsInStorage = dscs.filter((dsc) => dsc.status === 'storage');
  const leaders = allUsers.filter(user => user.role === 'leader');
  const employees = allUsers.filter(user => user.role === 'employee');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header allUsers={allUsers} currentUser={currentUser} setCurrentUser={setCurrentUser} />
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
