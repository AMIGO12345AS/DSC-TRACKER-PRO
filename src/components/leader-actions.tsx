'use client';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { ManageUsersDialog } from './manage-users-dialog';
import { ManageDscDialog } from './manage-dsc-dialog';
import type { User } from '@/types';


export function LeaderActions({ allUsers }: { allUsers: User[] }) {
  const [dates, setDates] = useState({ d1: '', d2: '', d3: '' });
  useEffect(() => {
    setDates({
      d1: new Date().toLocaleString(),
      d2: new Date(Date.now() - 1000 * 60 * 5).toLocaleString(),
      d3: new Date(Date.now() - 1000 * 60 * 10).toLocaleString(),
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Add New DSC Dialog */}
      <ManageDscDialog 
        trigger={<Button>Add New DSC</Button>}
      />
      
      {/* Manage Users Dialog */}
      <ManageUsersDialog 
        users={allUsers}
        trigger={<Button variant="secondary">Manage Users</Button>}
      />
      
      {/* Generate Reports Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Generate Reports</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">Audit Log & History</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>DSC Serial No.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{dates.d1 || '...'}</TableCell>
                <TableCell>Leader 1</TableCell>
                <TableCell><Badge variant="default">Login</Badge></TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>{dates.d2 || '...'}</TableCell>
                <TableCell>Employee 4</TableCell>
                <TableCell><Badge variant="outline" className="border-green-500 text-green-500">Take</Badge></TableCell>
                <TableCell>SN1003</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>{dates.d3 || '...'}</TableCell>
                <TableCell>Employee 8</TableCell>
                <TableCell><Badge variant="outline" className="border-red-500 text-red-500">Return</Badge></TableCell>
                <TableCell>SN1007</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
