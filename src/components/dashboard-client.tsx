'use client';

import { useState, useEffect } from 'react';
import TopLeftQuadrant from '@/components/quadrants/top-left';
import TopRightQuadrant from '@/components/quadrants/top-right';
import BottomLeftQuadrant from '@/components/quadrants/bottom-left';
import BottomRightQuadrant from '@/components/quadrants/bottom-right';
import type { DSC, User } from '@/types';
import { Header } from './header';
import { ExpiringDscAlert } from './expiring-dsc-alert';

interface DashboardClientProps {
    allUsers: User[];
    dscs: DSC[];
}

export default function DashboardClient({ allUsers, dscs }: DashboardClientProps) {
  const [loggedInUser, setLoggedInUser] = useState<User | undefined>(allUsers.find(u => u.role === 'leader' && !u.hasDsc) || allUsers[0]);
  const [highlightedItem, setHighlightedItem] = useState<{
    type: 'dsc' | 'employee';
    id: string;
  } | null>(null);

  // This effect synchronizes the loggedInUser state with the fresh data
  // that is passed down as props after a server action revalidates the page.
  useEffect(() => {
    if (!loggedInUser) {
        if (allUsers.length > 0) setLoggedInUser(allUsers.find(u => u.role === 'leader' && !u.hasDsc) || allUsers[0]);
        return;
    }
    
    const freshUserData = allUsers.find(user => user.id === loggedInUser.id);
    // Deep comparison to prevent needless re-renders if the user object is the same
    if (freshUserData && JSON.stringify(freshUserData) !== JSON.stringify(loggedInUser)) {
      setLoggedInUser(freshUserData);
    } else if (!freshUserData && allUsers.length > 0) {
      // Handle case where the logged-in user might have been deleted
      setLoggedInUser(allUsers[0]);
    }
  }, [allUsers, loggedInUser]);

  const handleHighlight = (item: { type: 'dsc' | 'employee'; id: string } | null) => {
    setHighlightedItem(item);
    if (item) {
      setTimeout(() => setHighlightedItem(null), 3000); // Highlight for 3 seconds
    }
  };

  const dscsInStorage = dscs.filter((dsc) => dsc.status === 'storage');
  const leaders = allUsers.filter(user => user.role === 'leader');
  const employees = allUsers.filter(user => user.role === 'employee');

  if (!loggedInUser) {
      return null; // or a loading skeleton
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header 
        allUsers={allUsers}
        loggedInUser={loggedInUser}
        onUserChange={setLoggedInUser}
      />
      <main className="flex-1 p-4 lg:p-6">
        <ExpiringDscAlert dscs={dscs} user={loggedInUser} />
        <div className="mt-4 grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
          <div className="h-full min-h-[300px] lg:min-h-0">
            <TopLeftQuadrant leaders={leaders} loggedInUser={loggedInUser} allDscs={dscs} />
          </div>
          <div className="h-full min-h-[300px] lg:min-h-0">
            <TopRightQuadrant 
              dscs={dscsInStorage} 
              highlightedId={highlightedItem?.type === 'dsc' ? highlightedItem.id : null}
              onDscSelect={(dsc) => handleHighlight({type: 'dsc', id: dsc.location.mainBox.toString()})}
              loggedInUser={loggedInUser}
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
              onHighlight={handleHighlight}
              loggedInUser={loggedInUser}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
