'use client';

import { useState } from 'react';
import TopLeftQuadrant from '@/components/quadrants/top-left';
import TopRightQuadrant from '@/components/quadrants/top-right';
import BottomLeftQuadrant from '@/components/quadrants/bottom-left';
import BottomRightQuadrant from '@/components/quadrants/bottom-right';
import type { DSC, User } from '@/types';
import { Header } from './header';

interface DashboardClientProps {
    allUsers: User[];
    dscs: DSC[];
}

export default function DashboardClient({ allUsers, dscs }: DashboardClientProps) {
  const [loggedInUser, setLoggedInUser] = useState<User>(allUsers[0]);
  const [highlightedItem, setHighlightedItem] = useState<{
    type: 'dsc' | 'employee';
    id: string;
  } | null>(null);

  const handleHighlight = (item: { type: 'dsc' | 'employee'; id: string } | null) => {
    setHighlightedItem(item);
    if (item) {
      setTimeout(() => setHighlightedItem(null), 3000); // Highlight for 3 seconds
    }
  };

  const dscsInStorage = dscs.filter((dsc) => dsc.status === 'storage');
  const leaders = allUsers.filter(user => user.role === 'leader');
  const employees = allUsers.filter(user => user.role === 'employee');
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header 
        allUsers={allUsers}
        loggedInUser={loggedInUser}
        onUserChange={setLoggedInUser}
      />
      <main className="flex-1 p-4 lg:p-6">
        <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
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
