'use client';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

export function LeaderActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Add New DSC Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add New DSC</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Digital Signature Certificate</DialogTitle>
            <DialogDescription>
              Enter the details for the new DSC and assign it to a physical location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employeeName" className="text-right">Employee</Label>
              <Input id="employeeName" placeholder="Employee Name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serialNumber" className="text-right">Serial No.</Label>
              <Input id="serialNumber" placeholder="DSC Serial Number" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
              <Input id="expiryDate" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mainBox" className="text-right">Location</Label>
              <div className='col-span-3 grid grid-cols-2 gap-2'>
                <Input id="mainBox" type="number" placeholder="Main Box (1-8)" />
                <Input id="subBox" placeholder="Sub Box (a-i)" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add DSC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Users Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Manage Users</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Manage Users</DialogTitle>
          </DialogHeader>
          <p>User management interface would be here.</p>
        </DialogContent>
      </Dialog>
      
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
                <TableCell>{new Date().toLocaleString()}</TableCell>
                <TableCell>Leader 1</TableCell>
                <TableCell><Badge variant="default">Login</Badge></TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>{new Date(Date.now() - 1000 * 60 * 5).toLocaleString()}</TableCell>
                <TableCell>Employee 4</TableCell>
                <TableCell><Badge variant="outline" className="border-green-500 text-green-500">Take</Badge></TableCell>
                <TableCell>SN1003</TableCell>
              </TableRow>
               <TableRow>
                <TableCell>{new Date(Date.now() - 1000 * 60 * 10).toLocaleString()}</TableCell>
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
