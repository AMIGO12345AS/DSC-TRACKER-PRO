'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { KeyIcon } from './icons';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import type { DSC } from '@/types';
import { useState } from 'react';

interface SubBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainBoxId: number | null;
  dscs: DSC[];
  onDscSelect: (dsc: DSC) => void;
}

export function SubBoxModal({ isOpen, onClose, mainBoxId, dscs, onDscSelect }: SubBoxModalProps) {
  const [selectedDsc, setSelectedDsc] = useState<DSC | null>(null);

  const handleDscClick = (dsc: DSC) => {
    setSelectedDsc(dsc);
    onDscSelect(dsc);
  };
  
  const handleTakeDsc = () => {
    // In a real app, this would trigger a database update.
    console.log(`Taking DSC: ${selectedDsc?.id}`);
    onClose();
  }

  const subBoxes = Array.from({ length: 9 }, (_, i) => {
    const subBoxId = String.fromCharCode(97 + i);
    const dsc = dscs.find((d) => d.location.subBox === subBoxId);
    return { id: subBoxId, dsc };
  });

  if (!mainBoxId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Main Box {mainBoxId}</DialogTitle>
          <DialogDescription>Select a sub-box to view DSC details or take your assigned DSC.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              {subBoxes.map(({ id, dsc }) => (
                <Button
                  key={id}
                  variant="outline"
                  className={cn(
                    'h-24 w-full flex-col p-2 text-center',
                    dsc ? 'bg-accent/20 hover:bg-accent/30' : 'bg-secondary',
                    selectedDsc?.location.subBox === id && 'ring-2 ring-primary'
                  )}
                  onClick={() => dsc && handleDscClick(dsc)}
                  disabled={!dsc}
                >
                  {dsc && <KeyIcon className="h-8 w-8 text-accent" />}
                  <span className="font-mono text-lg font-bold">{id.toUpperCase()}</span>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col items-center justify-center p-4 text-center">
                {selectedDsc ? (
                  <>
                    <h3 className="font-semibold">{selectedDsc.issuedTo}</h3>
                    <p className="text-sm text-muted-foreground">S/N: {selectedDsc.serialNumber}</p>
                    <p className="text-xs text-muted-foreground">Expires: {new Date(selectedDsc.expiryDate).toLocaleDateString()}</p>
                    <Button className="mt-4 w-full" onClick={handleTakeDsc}>Take DSC</Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a DSC to see details.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
