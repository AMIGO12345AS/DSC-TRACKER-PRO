'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { useAuth } from '@/hooks/use-auth';

interface BottomRightQuadrantProps {
  allDscs: DSC[];
  allUsers: User[];
  onHighlight: (item: { type: 'dsc' | 'employee'; id: string } | null) => void;
}

export default function BottomRightQuadrant({ allDscs, allUsers, onHighlight }: BottomRightQuadrantProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { userProfile } = useAuth();

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
        (dsc.user && dsc.user.name.toLowerCase().includes(lowercasedTerm))
      );
    
    return dscResults;
  }, [searchTerm, allDscs, allUsers]);

  const handleDeleteDsc = async (dsc: (typeof searchResults)[0]) => {
    if (!userProfile) return;
    const payload = {
      dscId: dsc.id,
      actorId: userProfile.id,
      actorName: userProfile.name,
      serialNumber: dsc.serialNumber,
      description: dsc.description,
    };
    const result = await deleteDscAction(payload);
    if (result.message.includes('successfully')) {
        toast({ title: 'Success', description: result.message });
        setSearchTerm('');
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleSelect = (dsc: (typeof searchResults)[0]) => {
    if (dsc.status === 'with-employee' && dsc.user) {
      onHighlight({ type: 'employee', id: dsc.user.id });
    } else {
      onHighlight({ type: 'dsc', id: dsc.location.mainBox.toString() });
    }
    setSearchTerm('');
  };
  
  const onEditSuccess = () => {
      setSearchTerm('');
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="flex-1">
        <CardHeader>
          <h3 className="font-headline text-2xl">Live DSC Search</h3>
        </CardHeader>
        <CardContent className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Description, S/N, or User..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && searchTerm && (
            <Card className="absolute top-full z-10 mt-2 w-full">
              <ScrollArea className="h-auto max-h-60">
                <CardContent className="p-2">
                  {searchResults.map((dsc) => (
                    <div
                      key={dsc.id}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary group"
                    >
                      <div className="flex-shrink-0 cursor-pointer" onClick={() => handleSelect(dsc)}>
                        <KeyIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 cursor-pointer" onClick={() => handleSelect(dsc)}>
                        <p className="font-semibold">{dsc.description}</p>
                        <p className="text-sm text-muted-foreground">{dsc.serialNumber} - {dsc.status === 'storage' ? `Box ${dsc.location.mainBox}` : `With ${dsc.user?.name || 'User'}`}</p>
                      </div>
                      {userProfile.role === 'leader' && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ManageDscDialog
                            dsc={dsc}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                            onSuccess={onEditSuccess}
                          />
                           <AlertDialog onOpenChange={(open) => !open && setSearchTerm(searchTerm)}>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" disabled={dsc.status !== 'storage'} title={dsc.status !== 'storage' ? "Cannot delete a DSC in use" : "Delete DSC"}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                               </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the DSC.
                                        You cannot delete a DSC that is currently in use by an employee.
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
      {userProfile.role === 'leader' && (
        <Card>
          <CardHeader>
            <h3 className="font-headline text-2xl">Leader Actions</h3>
          </CardHeader>
          <CardContent>
            <LeaderActions allUsers={allUsers} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
