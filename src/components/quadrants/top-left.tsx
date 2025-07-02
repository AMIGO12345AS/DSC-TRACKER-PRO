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
  currentUser: User; // This is the Operator
}

export default function TopLeftQuadrant({ leaders, allDscs, currentUser }: TopLeftQuadrantProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) {
    return null;
  }

  // The operator does not hold a DSC in this model.
  // We check if any of the in-app users with role 'leader' hold a DSC,
  // but the return functionality is disabled for the operator.
  // A leader *within the app data* might have a DSC, which is what `leaders.find(l => l.hasDsc)` would check.
  // For simplicity, we will just display the list of leaders. The 'My DSC' section is not relevant for the operator.

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="flex-1 glass-card h-full">
        <CardHeader>
          <h3 className="font-headline text-2xl">Leadership Team</h3>
           <p className="text-sm text-muted-foreground">List of users with the 'leader' role.</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {leaders.length > 0 ? leaders.map((leader) => (
              <UserCard key={leader.id} user={leader} />
            )) : (
              <p className='text-sm text-muted-foreground'>No leaders have been added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
