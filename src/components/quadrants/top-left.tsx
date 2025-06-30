import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCard } from '../user-card';
import type { User } from '@/types';
import { KeyIcon } from '../icons';
import { Button } from '../ui/button';

interface TopLeftQuadrantProps {
  leaders: User[];
  loggedInUser: User;
}

export default function TopLeftQuadrant({ leaders, loggedInUser }: TopLeftQuadrantProps) {
  const myDsc = loggedInUser.hasDsc ? { serialNumber: 'SN1234' } : null;

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
              <Button size="sm" variant="outline">
                Return DSC
              </Button>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Your DSC is in storage.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
