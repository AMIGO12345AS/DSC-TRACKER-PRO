'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCard } from '../user-card';
import type { User, DSC } from '@/types';
import { KeyIcon } from '../icons';
import { Button } from '../ui/button';
import { returnDscAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface TopLeftQuadrantProps {
  allDscs: DSC[];
  currentUser: User;
}

export default function TopLeftQuadrant({ allDscs, currentUser }: TopLeftQuadrantProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isReturning, setIsReturning] = useState(false);

  const userDsc = useMemo(() => {
    if (!currentUser.hasDsc) return null;
    return allDscs.find(dsc => dsc.currentHolderId === currentUser.id) || null;
  }, [allDscs, currentUser]);

  const handleReturnDsc = async () => {
    if (!userDsc) return;
    
    setIsReturning(true);
    const payload = {
        dscId: userDsc.id,
        actorId: currentUser.id,
        actorName: currentUser.name,
        serialNumber: userDsc.serialNumber,
        description: userDsc.description,
    };
    const result = await returnDscAction(payload);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      router.refresh();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsReturning(false);
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="flex h-full flex-col glass-card">
      <CardHeader>
        <CardTitle className="font-headline">Selected User Profile</CardTitle>
        <CardDescription>You are currently acting as this user.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <UserCard user={currentUser} />
        
        <div className="mt-4 rounded-lg border p-4">
            <h4 className="font-semibold mb-2">Assigned DSC</h4>
            {userDsc ? (
                <div>
                    <div className="flex items-center gap-3">
                        <KeyIcon className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-medium">{userDsc.description}</p>
                            <p className="text-sm text-muted-foreground">S/N: {userDsc.serialNumber}</p>
                            <p className="text-sm text-muted-foreground">Expires: {format(new Date(userDsc.expiryDate), 'dd MMM yyyy')}</p>
                        </div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleReturnDsc} disabled={isReturning}>
                        {isReturning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Return DSC to Storage
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-center text-muted-foreground py-4">This user does not hold a DSC.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
