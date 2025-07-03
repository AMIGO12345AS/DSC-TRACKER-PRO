
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash2 } from 'lucide-react';
import { LeaderActions } from '../leader-actions';
import type { DSC, User } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { KeyIcon } from '../icons';
import { ManageDscDialog } from '../manage-dsc-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { deleteDscAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import type { HighlightInfo } from '../dashboard-client';

interface BottomRightQuadrantProps {
  allDscs: DSC[];
  allUsers: User[];
  currentUser: User;
  onHighlight: (info: HighlightInfo) => void;
  refetchData: () => void;
}

export default function BottomRightQuadrant({ allDscs, allUsers, currentUser, onHighlight, refetchData }: BottomRightQuadrantProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    const dscResults = allDscs
      .map(dsc => {
        const user = dsc.currentHolderId ? userMap.get(dsc.currentHolderId) : undefined;
        return { ...dsc, user };
      })
      .filter(dsc => 
        (dsc.serialNumber && dsc.serialNumber.toLowerCase().includes(lowercasedTerm)) || 
        (dsc.description && dsc.description.toLowerCase().includes(lowercasedTerm)) ||
        (dsc.user && dsc.user.name.toLowerCase().includes(lowercasedTerm)) ||
        (dsc.clientName && dsc.clientName.toLowerCase().includes(lowercasedTerm))
      );
    
    return dscResults;
  }, [searchTerm, allDscs, allUsers]);

  const getDscStatusText = (dsc: (typeof searchResults)[0]) => {
    switch (dsc.status) {
      case 'storage':
        return `Box ${dsc.location.mainBox}`;
      case 'with-employee':
        return `With ${dsc.user?.name || 'User'}`;
      case 'with-client':
        return `With Client: ${dsc.clientName || 'N/A'}`;
      default:
        return 'Unknown';
    }
  }

  const handleDeleteDsc = async (dsc: (typeof searchResults)[0]) => {
    if (!currentUser) return;
    const payload = {
      dscId: dsc.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      serialNumber: dsc.serialNumber,
      description: dsc.description,
    };
    const result = await deleteDscAction(payload);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        setSearchTerm('');
        refetchData();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleSelect = (dsc: (typeof searchResults)[0]) => {
    if (dsc.status === 'with-employee' && dsc.user) {
      onHighlight({ type: 'employee', id: dsc.user.id });
    } else if (dsc.status === 'storage') {
      onHighlight({
        type: 'dsc',
        id: dsc.location.mainBox.toString(),
        subBoxId: dsc.location.subBox,
        dscId: dsc.id,
      });
    }
    // No highlight action for 'with-client' status for now, as there's no specific panel to highlight.
    setSearchTerm('');
  };
  
  const onEditSuccess = () => {
      setSearchTerm('');
      refetchData();
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className={cn(
        "flex-1 glass-card",
        searchResults.length > 0 && searchTerm && "relative z-10"
      )}>
        <CardHeader>
          <h3 className="font-headline text-2xl">Live DSC Search</h3>
        </CardHeader>
        <CardContent className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Description, S/N, User or Client..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && searchTerm && (
            <Card className="absolute top-full mt-2 w-full glass-card z-20">
              <ScrollArea className="h-auto max-h-60">
                <CardContent className="p-2">
                  {searchResults.map((dsc) => (
                    <div
                      key={dsc.id}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/70 group"
                    >
                      <div className="flex-shrink-0 cursor-pointer" onClick={() => handleSelect(dsc)}>
                        <KeyIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 cursor-pointer" onClick={() => handleSelect(dsc)}>
                        <p className="font-semibold">{dsc.description}</p>
                        <p className="text-sm text-muted-foreground">{dsc.serialNumber} - {getDscStatusText(dsc)}</p>
                      </div>
                      {currentUser.role === 'leader' && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ManageDscDialog
                            dsc={dsc}
                            currentUser={currentUser}
                            trigger={
                              <Button variant="ghost" size="icon" disabled={dsc.status !== 'storage'}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                            onSuccess={onEditSuccess}
                          />
                           <AlertDialog onOpenChange={(open) => !open && setSearchTerm(searchTerm)}>
                            <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" disabled={dsc.status !== 'storage'}>
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                 </TooltipTrigger>
                                 {dsc.status !== 'storage' && (
                                  <TooltipContent>
                                    <p>Cannot delete a DSC in use by an employee or client.</p>
                                  </TooltipContent>
                                 )}
                               </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the DSC.
                                        You cannot delete a DSC that is currently in use.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setSearchTerm(searchTerm)}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDsc(dsc)}>
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </CardContent>
      </Card>
      {currentUser.role === 'leader' && (
        <Card className="glass-card">
          <CardHeader>
            <h3 className="font-headline text-2xl">Leader Actions</h3>
          </CardHeader>
          <CardContent>
            <LeaderActions allUsers={allUsers} currentUser={currentUser} refetchData={refetchData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
