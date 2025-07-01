'use client';

import { Button } from './ui/button';
import { ManageUsersDialog } from './manage-users-dialog';
import { ManageDscDialog } from './manage-dsc-dialog';
import type { User } from '@/types';
import { AuditLogDialog } from './audit-log-dialog';
import { AllDscsDialog } from './all-dscs-dialog';


export function LeaderActions({ allUsers, loggedInUser }: { allUsers: User[], loggedInUser: User }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Add New DSC Dialog */}
      <ManageDscDialog 
        trigger={<Button>Add New DSC</Button>}
        loggedInUser={loggedInUser}
      />
      
      {/* Manage Users Dialog */}
      <ManageUsersDialog 
        users={allUsers}
        trigger={<Button variant="secondary">Manage Users</Button>}
      />
      
      {/* Audit Log Dialog */}
      <AuditLogDialog 
         trigger={<Button variant="secondary">Audit Log</Button>}
      />

      {/* View all DSCs */}
      <AllDscsDialog
        allUsers={allUsers}
        trigger={<Button variant="secondary">View All DSCs</Button>}
      />
    </div>
  );
}
