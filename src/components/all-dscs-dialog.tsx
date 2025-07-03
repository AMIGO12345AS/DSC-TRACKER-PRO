
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { DSC, User } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { getDscsSortedByExpiryAction } from '@/app/actions';

interface AllDscsDialogProps {
  trigger: React.ReactNode;
  allUsers: User[];
}

export function AllDscsDialog({ trigger, allUsers }: AllDscsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dscs, setDscs] = useState<DSC[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const userMap = new Map(allUsers.map(u => [u.id, u.name]));

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setIsLoading(true);
      const result = await getDscsSortedByExpiryAction();
      if (result.dscs) {
        setDscs(result.dscs);
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching DSCs',
          description: result.error,
        });
      }
      setIsLoading(false);
    }
  };

  const getExpiryBadge = (expiryDate: string) => {
    const now = new Date();
    const expDate = new Date(expiryDate);
    const daysDiff = differenceInDays(expDate, now);

    if (daysDiff < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysDiff <= 30) {
      return <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600 text-white">{daysDiff} days left</Badge>;
    }
    return <Badge variant="secondary">{daysDiff} days left</Badge>;
  };
  
  const getStatusBadge = (status: DSC['status']) => {
      switch (status) {
          case 'storage':
              return <Badge variant="outline">In Storage</Badge>;
          case 'with-employee':
              return <Badge className="bg-green-600 hover:bg-green-700">With Employee</Badge>;
          case 'with-client':
              return <Badge className="bg-purple-600 hover:bg-purple-700">With Client</Badge>;
          default:
              return <Badge>Unknown</Badge>;
      }
  }

  const getHolderName = (dsc: DSC) => {
      if (dsc.status === 'with-employee' && dsc.currentHolderId) {
          return userMap.get(dsc.currentHolderId) || 'Unknown User';
      }
      if (dsc.status === 'with-client' && dsc.clientName) {
          return dsc.clientName;
      }
      return 'N/A';
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">All Digital Signature Certificates</DialogTitle>
          <DialogDescription>
            A complete list of all DSCs, sorted by the soonest expiry date.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Expires In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : dscs.length > 0 ? (
                dscs.map((dsc) => (
                  <TableRow key={dsc.id}>
                    <TableCell className="font-medium">{dsc.description}</TableCell>
                    <TableCell>{dsc.serialNumber}</TableCell>
                    <TableCell>{getHolderName(dsc)}</TableCell>
                    <TableCell>{getStatusBadge(dsc.status)}</TableCell>
                    <TableCell>{format(new Date(dsc.expiryDate), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{getExpiryBadge(dsc.expiryDate)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No DSCs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
