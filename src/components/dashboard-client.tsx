'use client';

import { useState, useEffect, useRef } from 'react';
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

function getInitialUser(users: User[]): User | undefined {
    if (users.length === 0) return undefined;
    const firstLeader = users.find(u => u.role === 'leader');
    return firstLeader || users[0];
}


export default function DashboardClient({ allUsers, dscs }: DashboardClientProps) {
  const [loggedInUser, setLoggedInUser] = useState<User | undefined>(() => getInitialUser(allUsers));
  
  const [highlightedItem, setHighlightedItem] = useState<{
    type: 'dsc' | 'employee';
    id: string;
  } | null>(null);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // This effect synchronizes the `loggedInUser` state with fresh data from the server
    // after a server action and revalidation.
    if (loggedInUser) {
      const freshUserData = allUsers.find(user => user.id === loggedInUser.id);
      
      // If the logged-in user was deleted, reset to a default user.
      if (!freshUserData) {
        setLoggedInUser(getInitialUser(allUsers));
      } 
      // If the user's data has changed (e.g., `hasDsc` toggled), update the state.
      // A simple JSON.stringify is a reliable way to deep compare the simple user objects.
      else if (JSON.stringify(freshUserData) !== JSON.stringify(loggedInUser)) {
        setLoggedInUser(freshUserData);
      }
    } else if (allUsers.length > 0) {
      // If there was no logged-in user but now there are users, set one.
      setLoggedInUser(getInitialUser(allUsers));
    }
  }, [allUsers, loggedInUser]);
  
  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
        if (highlightTimeoutRef.current) {
            clearTimeout(highlightTimeoutRef.current);
        }
    }
  }, []);

  const handleHighlight = (item: { type: 'dsc' | 'employee'; id: string } | null) => {
    // Clear any existing highlight timeout
    if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
    }

    setHighlightedItem(item);

    if (item) {
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedItem(null);
        highlightTimeoutRef.current = null;
      }, 3000); // Highlight for 3 seconds
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
