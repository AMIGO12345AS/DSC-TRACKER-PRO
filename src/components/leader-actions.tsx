'use client';

import { Button } from './ui/button';
import { ManageUsersDialog } from './manage-users-dialog';
import { ManageDscDialog } from './manage-dsc-dialog';
import type { User } from '@/types';
import { AuditLogDialog } from './audit-log-dialog';
import { AllDscsDialog } from './all-dscs-dialog';
import { ImportDataDialog } from './import-data-dialog';
import { ExportDataDialog } from './export-data-dialog';
import { Upload, Download } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';


export function LeaderActions({ allUsers }: { allUsers: User[] }) {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ManageDscDialog 
        trigger={<Button className="w-full">Add New DSC</Button>}
      />
      
      <ManageUsersDialog 
        users={allUsers}
        trigger={<Button variant="secondary" className="w-full">Manage Users</Button>}
      />
      
      <AuditLogDialog 
         trigger={<Button variant="secondary" className="w-full">Audit Log</Button>}
      />

      <AllDscsDialog
        allUsers={allUsers}
        trigger={<Button variant="secondary" className="w-full">View All DSCs</Button>}
      />

      <ImportDataDialog 
        trigger={<Button variant="outline" className="w-full"><Upload className="mr-2"/> Import Data</Button>}
      />

      <ExportDataDialog 
        trigger={<Button variant="outline" className="w-full"><Download className="mr-2"/> Export Data</Button>}
      />
    </div>
  );
}
