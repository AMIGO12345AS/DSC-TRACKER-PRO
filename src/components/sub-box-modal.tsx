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
import type { DSC, User } from '@/types';
import { useState, useEffect } from 'react';
import { takeDscAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SubBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainBoxId: number | null;
  dscs: DSC[];
  onDscSelect: (dsc: DSC) => void;
  loggedInUser: User;
}

export function SubBoxModal({ isOpen, onClose, mainBoxId, dscs, onDscSelect, loggedInUser }: SubBoxModalProps) {
  const [selectedDsc, setSelectedDsc] = useState<DSC | null>(null);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedDsc(null);
      }, 200); 
    }
  }, [isOpen]);

  const handleDscClick = (dsc: DSC) => {
    setSelectedDsc(dsc);
    onDscSelect(dsc);
  };
  
  const handleTakeDsc = async () => {
    if (!selectedDsc || !loggedInUser) return;
    
    setIsSubmitting(true);
    const result = await takeDscAction(selectedDsc.id, loggedInUser.id);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      onClose();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsSubmitting(false);
  }

  const subBoxes = Array.from({ length: 9 }, (_, i) => {
    const subBoxId = String.fromCharCode(97 + i);
    const dsc = dscs.find((d) => d.location.subBox === subBoxId);
    return { id: subBoxId, dsc };
  });

  if (!mainBoxId) return null;

  const canTakeSelectedDsc = selectedDsc && !loggedInUser.hasDsc;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Main Box {mainBoxId}</DialogTitle>
          <DialogDescription>Select a sub-box to view DSC details or take any available DSC.</DialogDescription>
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
                    <Button className="mt-4 w-full" onClick={handleTakeDsc} disabled={!canTakeSelectedDsc || isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Take DSC'}
                    </Button>
                     {!canTakeSelectedDsc && !isSubmitting && loggedInUser.hasDsc && (
                        <p className="mt-2 text-xs text-destructive">
                           You already hold a DSC.
                        </p>
                    )}
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
