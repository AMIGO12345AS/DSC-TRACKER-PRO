'use client';

import { useState } from 'react';
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
import { getAuditLogsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { AuditLog } from '@/types';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface AuditLogDialogProps {
  trigger: React.ReactNode;
}

export function AuditLogDialog({ trigger }: AuditLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && logs.length === 0) {
      setIsLoading(true);
      const result = await getAuditLogsAction();
      if (result.logs) {
        setLogs(result.logs);
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching logs',
          description: result.error,
        });
      }
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'TAKE':
        return <Badge variant="outline" className="text-green-600 border-green-600">Take</Badge>;
      case 'RETURN':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Return</Badge>;
      case 'ADD_DSC':
        return <Badge variant="secondary">Add</Badge>;
      case 'UPDATE_DSC':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Update</Badge>;
      case 'DELETE_DSC':
        return <Badge variant="destructive">Delete</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Audit Log & History</DialogTitle>
          <DialogDescription>
            A complete history of all DSC movements and management actions.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead>DSC Description</TableHead>
                <TableHead>DSC Serial No.</TableHead>
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
                  </TableRow>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm a')}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>{log.dscDescription}</TableCell>
                    <TableCell>{log.dscSerialNumber}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No audit logs found.
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
