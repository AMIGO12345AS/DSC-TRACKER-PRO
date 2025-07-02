'use client';

import { Button } from './ui/button';
import { ManageUsersDialog } from './manage-users-dialog';
import { ManageDscDialog } from './manage-dsc-dialog';
import type { User } from '@/types';
import { AuditLogDialog } from './audit-log-dialog';
import { AllDscsDialog } from './all-dscs-dialog';
import { ImportDataDialog } from './import-data-dialog';
import { ExportDataDialog } from './export-data-dialog';
import { Upload, Download, UserPlus, FileClock, List, Edit } from 'lucide-react';

export function LeaderActions({ allUsers, currentUser }: { allUsers: User[], currentUser: User }) {

  if (!currentUser) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ManageDscDialog 
        trigger={<Button className="w-full"><Edit className="mr-2"/> Add New DSC</Button>}
        currentUser={currentUser}
      />
      
      <ManageUsersDialog 
        users={allUsers}
        trigger={<Button variant="secondary" className="w-full"><UserPlus className="mr-2"/> Manage Users</Button>}
        currentUser={currentUser}
      />
      
      <AuditLogDialog 
         trigger={<Button variant="secondary" className="w-full"><FileClock className="mr-2"/> Audit Log</Button>}
      />

      <AllDscsDialog
        allUsers={allUsers}
        trigger={<Button variant="secondary" className="w-full"><List className="mr-2"/> View All DSCs</Button>}
      />

      <ImportDataDialog 
        trigger={<Button variant="outline" className="w-full"><Upload className="mr-2"/> Import Data</Button>}
        currentUser={currentUser}
      />

      <ExportDataDialog 
        trigger={<Button variant="outline" className="w-full"><Download className="mr-2"/> Export Data</Button>}
        currentUser={currentUser}
      />
    </div>
  );
}
