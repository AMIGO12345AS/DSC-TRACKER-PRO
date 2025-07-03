
'use client';

import { Button } from './ui/button';
import { ManageUsersDialog } from './manage-users-dialog';
import { ManageDscDialog } from './manage-dsc-dialog';
import type { User } from '@/types';
import { AuditLogDialog } from './audit-log-dialog';
import { AllDscsDialog } from './all-dscs-dialog';
import { ImportDataDialog } from './import-data-dialog';
import { ExportDataDialog } from './export-data-dialog';
import { Upload, Download, UserPlus, FileClock, List, FilePlus2, Handshake } from 'lucide-react';
import { InClientsHandDialog } from './in-clients-hand-dialog';

export function LeaderActions({ allUsers, currentUser, refetchData }: { allUsers: User[], currentUser: User, refetchData: () => void }) {

  if (!currentUser) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ManageDscDialog 
        trigger={<Button className="w-full"><FilePlus2 className="mr-2"/> Add New DSC</Button>}
        currentUser={currentUser}
        onSuccess={refetchData}
      />
      
      <ManageUsersDialog 
        users={allUsers}
        trigger={<Button variant="secondary" className="w-full"><UserPlus className="mr-2"/> Manage Users</Button>}
        currentUser={currentUser}
        onSuccess={refetchData}
      />
      
       <InClientsHandDialog
        trigger={<Button variant="secondary" className="w-full"><Handshake className="mr-2" /> In Client's Hand</Button>}
        currentUser={currentUser}
        onSuccess={refetchData}
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
        onSuccess={refetchData}
      />

      <ExportDataDialog 
        trigger={<Button variant="outline" className="w-full"><Download className="mr-2"/> Export Data</Button>}
        currentUser={currentUser}
      />
    </div>
  );
}
