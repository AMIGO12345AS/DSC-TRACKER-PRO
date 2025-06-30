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

interface TopLeftQuadrantProps {
  leaders: User[];
  loggedInUser: User;
  allDscs: DSC[];
}

export default function TopLeftQuadrant({ leaders, loggedInUser, allDscs }: TopLeftQuadrantProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find the specific DSC the logged-in user is currently holding.
  const myDsc = loggedInUser.hasDsc
    ? allDscs.find((dsc) => dsc.currentHolderId === loggedInUser.id && dsc.status === 'with-employee')
    : null;

  const handleReturnDsc = async () => {
    if (!myDsc) return;
    setIsSubmitting(true);
    const result = await returnDscAction(myDsc.id, loggedInUser.id);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
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
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="font-headline">Leadership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {leaders.map((leader) => (
              <UserCard key={leader.id} user={leader} />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My DSC</CardTitle>
        </CardHeader>
        <CardContent>
          {myDsc ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <KeyIcon className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">DSC In Possession</p>
                  <p className="text-sm text-muted-foreground">S/N: {myDsc.serialNumber}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleReturnDsc} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Return DSC
              </Button>
            </div>
          ) : (
             <div className="text-center text-sm text-muted-foreground">
              {loggedInUser.hasDsc
                ? 'Loading your DSC info...'
                : 'You can take your assigned DSC from storage.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
