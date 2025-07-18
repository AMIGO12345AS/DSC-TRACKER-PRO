
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import TopLeftQuadrant from '@/components/quadrants/top-left';
import TopRightQuadrant from '@/components/quadrants/top-right';
import BottomLeftQuadrant from '@/components/quadrants/bottom-left';
import BottomRightQuadrant from '@/components/quadrants/bottom-right';
import type { DSC, User } from '@/types';
import { Header } from './header';
import { ExpiringDscAlert } from './expiring-dsc-alert';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useUserSession } from '@/hooks/use-user-session';
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

export type HighlightInfo = {
  type: 'dsc' | 'employee';
  id: string;
  subBoxId?: string;
  dscId?: string;
} | null;

export default function DashboardClient() {
  const { user: authUser } = useAuth();
  const { selectedUser, setSelectedUser } = useUserSession();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dscs, setDscs] = useState<DSC[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [highlightedInfo, setHighlightedInfo] = useState<HighlightInfo>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refetchData = useCallback(async () => {
    // To prevent flashing UI on re-fetches, we don't set loading to true here
    const result = await getDashboardDataAction();
    if(result.data) {
      setAllUsers(result.data.users);
      setDscs(result.data.dscs);

      // THE FIX: After fetching all data, find the updated data for the
      // currently selected user and update the session context. This will
      // trigger a re-render in this component and all children with the fresh user data.
      if (selectedUser) {
        const updatedUser = result.data.users.find(u => u.id === selectedUser.id);
        if (updatedUser) {
          // This is the key. Update the context itself.
          setSelectedUser(updatedUser);
        }
      }

    } else {
      console.error("Failed to fetch dashboard data:", result.message);
    }
    setIsLoadingData(false);
  }, [selectedUser, setSelectedUser]);


  useEffect(() => {
    // We only want to run the initial fetch. Subsequent fetches are triggered by user actions.
    if(selectedUser) {
        setIsLoadingData(true);
        refetchData();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
        if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
        }
    }
  }, []);

  const handleHighlight = (info: HighlightInfo) => {
    if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedInfo(info);
    if (info) {
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedInfo(null);
      }, 5000);
    }
  };

  if (isLoadingData || !authUser || !selectedUser) {
    return <DashboardSkeleton />;
  }

  // The selectedUser from the session is now our currentUser for all actions
  // This will be the NEW selectedUser from context after refetchData runs.
  const currentUser = selectedUser;
  
  const dscsInStorage = dscs.filter((dsc) => dsc.status === 'storage');
  const employees = allUsers.filter(u => u.role === 'employee');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <ExpiringDscAlert dscs={dscs} currentUser={currentUser} />
        <div className="mt-4 grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
          <div className="h-full min-h-[300px] lg:min-h-0">
            <TopLeftQuadrant 
              allDscs={dscs} 
              currentUser={currentUser} 
              refetchData={refetchData} 
            />
          </div>
          <div className="h-full min-h-[300px] lg:min-h-0">
            <TopRightQuadrant 
              dscs={dscsInStorage}
              currentUser={currentUser}
              highlightedInfo={highlightedInfo}
              refetchData={refetchData}
            />
          </div>
          <div className="h-full min-h-[300px] lg:min-h-0">
            <BottomLeftQuadrant 
              employees={employees} 
              highlightedId={highlightedInfo?.type === 'employee' ? highlightedInfo.id : null}
            />
          </div>
          <div className="h-full min-h-[300px] lg:min-h-0">
            <BottomRightQuadrant 
              allDscs={dscs} 
              allUsers={allUsers} 
              currentUser={currentUser}
              onHighlight={handleHighlight}
              refetchData={refetchData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
