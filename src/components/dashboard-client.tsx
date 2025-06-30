'use client';

import { useState } from 'react';
import TopLeftQuadrant from '@/components/quadrants/top-left';
import TopRightQuadrant from '@/components/quadrants/top-right';
import BottomLeftQuadrant from '@/components/quadrants/bottom-left';
import BottomRightQuadrant from '@/components/quadrants/bottom-right';
import type { DSC, User } from '@/types';

interface DashboardClientProps {
    leaders: User[];
    employees: User[];
    dscs: DSC[];
    loggedInUser: User;
}

export default function DashboardClient({ leaders, employees, dscs, loggedInUser }: DashboardClientProps) {
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
  
  return (
    <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
      <div className="h-full min-h-[300px] lg:min-h-0">
        <TopLeftQuadrant leaders={leaders} loggedInUser={loggedInUser} />
      </div>
      <div className="h-full min-h-[300px] lg:min-h-0">
        <TopRightQuadrant 
          dscs={dscsInStorage} 
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
          allUsers={[...leaders, ...employees]} 
          onHighlight={handleHighlight}
          loggedInUser={loggedInUser}
        />
      </div>
    </div>
  );
}
