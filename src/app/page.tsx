'use client';

import { useState } from 'react';
import TopLeftQuadrant from '@/components/quadrants/top-left';
import TopRightQuadrant from '@/components/quadrants/top-right';
import BottomLeftQuadrant from '@/components/quadrants/bottom-left';
import BottomRightQuadrant from '@/components/quadrants/bottom-right';
import type { DSC, User } from '@/types';

// Mock Data
const MOCK_LEADERS: User[] = Array.from({ length: 6 }, (_, i) => ({
  id: `L${i + 1}`,
  name: `Leader ${i + 1}`,
  role: 'leader',
  hasDsc: i % 3 === 0,
}));

const MOCK_EMPLOYEES: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: `E${i + 1}`,
  name: `Employee ${i + 1}`,
  role: 'employee',
  hasDsc: i % 4 === 0,
}));

const MOCK_DSCS: DSC[] = Array.from({ length: 30 }, (_, i) => {
  const isTaken = i % 4 === 0;
  const employeeIndex = i % 20;
  return {
    id: `DSC${i + 1}`,
    serialNumber: `SN${1000 + i}`,
    issuedTo: `Employee ${employeeIndex + 1}`,
    expiryDate: new Date(2024 + Math.floor(i/10), (i % 12) + 1, 28).toISOString(),
    status: isTaken ? 'with-employee' : 'storage',
    location: {
      mainBox: (i % 8) + 1,
      subBox: String.fromCharCode(97 + (i % 9)),
    },
    currentHolderId: isTaken ? `E${employeeIndex + 1}` : undefined,
  };
});

export default function DashboardPage() {
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

  const loggedInUser: User = { id: 'L1', name: 'Current Leader', role: 'leader', hasDsc: false };
  const dscsInStorage = MOCK_DSCS.filter((dsc) => dsc.status === 'storage');
  
  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="grid h-full w-full grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-2">
        <div className="h-full min-h-[300px] lg:min-h-0">
          <TopLeftQuadrant leaders={MOCK_LEADERS} loggedInUser={loggedInUser} />
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
            employees={MOCK_EMPLOYEES} 
            highlightedId={highlightedItem?.type === 'employee' ? highlightedItem.id : null}
          />
        </div>
        <div className="h-full min-h-[300px] lg:min-h-0">
          <BottomRightQuadrant 
            allDscs={MOCK_DSCS} 
            allUsers={[...MOCK_LEADERS, ...MOCK_EMPLOYEES]} 
            onHighlight={handleHighlight}
            loggedInUser={loggedInUser}
          />
        </div>
      </div>
    </div>
  );
}
