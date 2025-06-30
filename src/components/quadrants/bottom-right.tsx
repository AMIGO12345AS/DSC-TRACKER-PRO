'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { LeaderActions } from '../leader-actions';
import type { DSC, User } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { KeyIcon } from '../icons';

interface BottomRightQuadrantProps {
  allDscs: DSC[];
  allUsers: User[];
  onHighlight: (item: { type: 'dsc' | 'employee'; id: string } | null) => void;
  loggedInUser: User;
}

export default function BottomRightQuadrant({ allDscs, allUsers, onHighlight, loggedInUser }: BottomRightQuadrantProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedTerm = searchTerm.toLowerCase();
    
    const dscResults = allDscs.filter(dsc => 
      dsc.serialNumber.toLowerCase().includes(lowercasedTerm) || 
      dsc.issuedTo.toLowerCase().includes(lowercasedTerm)
    );
    
    return dscResults.map(dsc => {
      const user = allUsers.find(u => u.name === dsc.issuedTo);
      return { ...dsc, user };
    });
  }, [searchTerm, allDscs, allUsers]);

  const handleSelect = (dsc: (typeof searchResults)[0]) => {
    if (dsc.status === 'with-employee' && dsc.user) {
      onHighlight({ type: 'employee', id: dsc.user.id });
    } else {
      onHighlight({ type: 'dsc', id: dsc.location.mainBox.toString() });
    }
    setSearchTerm('');
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="font-headline">Live DSC Search</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by Employee or S/N..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <Card className="absolute top-full z-10 mt-2 w-full">
              <ScrollArea className="h-auto max-h-48">
                <CardContent className="p-2">
                  {searchResults.map((dsc) => (
                    <div
                      key={dsc.id}
                      onClick={() => handleSelect(dsc)}
                      className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-secondary"
                    >
                      <KeyIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{dsc.issuedTo}</p>
                        <p className="text-sm text-muted-foreground">{dsc.serialNumber} - {dsc.status === 'storage' ? `Box ${dsc.location.mainBox}` : 'With User'}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </CardContent>
      </Card>
      {loggedInUser.role === 'leader' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Leader Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderActions allUsers={allUsers} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
