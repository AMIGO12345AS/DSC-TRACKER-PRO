
'use client';

import { useState, useMemo } from 'react';
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
import type { AuditLog, AuditLogAction } from '@/types';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';

const ALL_ACTIONS: AuditLogAction[] = ['TAKE', 'RETURN', 'ADD_DSC', 'UPDATE_DSC', 'DELETE_DSC'];

interface AuditLogDialogProps {
  trigger: React.ReactNode;
}

export function AuditLogDialog({ trigger }: AuditLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open) {
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
    } else {
      setSearchTerm('');
      setActionFilter('all');
    }
  };

  const filteredLogs = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();

    return logs.filter(log => {
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;

      const matchesSearch =
        searchTerm === '' ||
        log.userName.toLowerCase().includes(lowercasedTerm) ||
        log.dscDescription.toLowerCase().includes(lowercasedTerm) ||
        log.dscSerialNumber.toLowerCase().includes(lowercasedTerm);

      return matchesAction && matchesSearch;
    });
  }, [logs, searchTerm, actionFilter]);

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

        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by User, DSC Description or S/N..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {ALL_ACTIONS.map(action => (
                        <SelectItem key={action} value={action} className="capitalize">
                          {action.replace('_DSC', '').toLowerCase()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <ScrollArea className="h-[55vh] border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary">
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
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
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
                    No logs found matching your criteria.
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
