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
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { addDscAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add DSC
    </Button>
  );
}

export function LeaderActions() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const initialState = { message: undefined, errors: {} };
  const [state, dispatch] = useActionState(addDscAction, initialState);

  const [dates, setDates] = useState({ d1: '', d2: '', d3: '' });
  useEffect(() => {
    setDates({
      d1: new Date().toLocaleString(),
      d2: new Date(Date.now() - 1000 * 60 * 5).toLocaleString(),
      d3: new Date(Date.now() - 1000 * 60 * 10).toLocaleString(),
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.message === 'DSC added successfully.') {
      toast({
        title: 'Success',
        description: state.message,
      });
      formRef.current?.reset();
      setDialogOpen(false);
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Add New DSC Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Add New DSC</Button>
        </DialogTrigger>
        <DialogContent>
          <form action={dispatch} ref={formRef}>
            <DialogHeader>
              <DialogTitle className="font-headline">Add New Digital Signature Certificate</DialogTitle>
              <DialogDescription>
                Enter the details for the new DSC and assign it to a physical location.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employeeName" className="text-right">Employee</Label>
                  <Input id="employeeName" name="employeeName" placeholder="Employee Name" className="col-span-3" />
                </div>
                {state?.errors?.issuedTo && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.issuedTo.join(', ')}</p>}
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="serialNumber" className="text-right">Serial No.</Label>
                  <Input id="serialNumber" name="serialNumber" placeholder="DSC Serial Number" className="col-span-3" />
                </div>
                {state?.errors?.serialNumber && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.serialNumber.join(', ')}</p>}
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" className="col-span-3" />
                </div>
                {state?.errors?.expiryDate && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.expiryDate.join(', ')}</p>}
              </div>

              <div className="space-y-1">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mainBox" className="text-right">Location</Label>
                  <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Input id="mainBox" name="mainBox" type="number" placeholder="Main Box (1-8)" />
                    <Input id="subBox" name="subBox" placeholder="Sub Box (a-i)" />
                  </div>
                </div>
                {state?.errors?.mainBox && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.mainBox.join(', ')}</p>}
                {state?.errors?.subBox && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.subBox.join(', ')}</p>}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <SubmitButton />
            </DialogFooter>
          </form>
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
