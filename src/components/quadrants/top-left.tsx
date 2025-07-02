'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCard } from '../user-card';
import type { User, DSC } from '@/types';
import { KeyIcon } from '../icons';
import { Button } from '../ui/button';
import { returnDscAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopLeftQuadrantProps {
  leaders: User[];
  allDscs: DSC[];
  currentUser: User;
}

export default function TopLeftQuadrant({ leaders, allDscs, currentUser }: TopLeftQuadrantProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) {
    return null;
  }

  const myDsc = currentUser.hasDsc
    ? allDscs.find((dsc) => dsc.currentHolderId === currentUser.id && dsc.status === 'with-employee')
    : null;

  const handleReturnDsc = async () => {
    if (!myDsc) return;
    setIsSubmitting(true);
    
    const payload = {
      dscId: myDsc.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      serialNumber: myDsc.serialNumber,
      description: myDsc.description,
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
    setIsSubmitting(false);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="flex-1 glass-card">
        <CardHeader>
          <h3 className="font-headline text-2xl">Leadership</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {leaders.map((leader) => (
              <UserCard key={leader.id} user={leader} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardHeader>
          <h3 className="font-headline text-2xl">My DSC</h3>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          {myDsc ? (
            <div className="flex w-full items-center justify-between rounded-lg border bg-background/50 p-4">
              <div className="flex items-center gap-3">
                <KeyIcon className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">{myDsc.description}</p>
                  <p className="text-sm text-muted-foreground">S/N: {myDsc.serialNumber}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleReturnDsc} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Return DSC
              </Button>
            </div>
          ) : (
             <div className="text-sm text-muted-foreground">
              {currentUser.hasDsc
                ? 'Loading your DSC info...'
                : 'You do not currently hold a DSC.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
