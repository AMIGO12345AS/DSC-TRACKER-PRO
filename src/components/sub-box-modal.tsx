
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
import { ScrollArea } from './ui/scroll-area';
import type { HighlightInfo } from './dashboard-client';

interface SubBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainBoxId: number | null;
  dscs: DSC[];
  currentUser: User;
  refetchData: () => void;
  highlightedInfo: HighlightInfo;
}

export function SubBoxModal({ isOpen, onClose, mainBoxId, dscs, currentUser, refetchData, highlightedInfo }: SubBoxModalProps) {
  const [selectedDsc, setSelectedDsc] = useState<DSC | null>(null);
  const [selectedSubBox, setSelectedSubBox] = useState<string | null>(null);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // If modal opened via a highlight, set the initial state
      if (
        highlightedInfo?.type === 'dsc' &&
        highlightedInfo.subBoxId &&
        highlightedInfo.dscId &&
        parseInt(highlightedInfo.id, 10) === mainBoxId
      ) {
        setSelectedSubBox(highlightedInfo.subBoxId);
        const dscToSelect = dscs.find((d) => d.id === highlightedInfo.dscId);
        if (dscToSelect) {
          setSelectedDsc(dscToSelect);
        }
      }
    } else {
      // Reset state on close with a small delay to prevent visual glitch
      setTimeout(() => {
        setSelectedDsc(null);
        setSelectedSubBox(null);
      }, 200);
    }
  }, [isOpen, mainBoxId, highlightedInfo, dscs]);
  
  const handleTakeDsc = async () => {
    if (!selectedDsc || !currentUser) return;
    
    setIsSubmitting(true);
    const payload = {
        dscId: selectedDsc.id,
        actorId: currentUser.id,
        actorName: currentUser.name,
        serialNumber: selectedDsc.serialNumber,
        description: selectedDsc.description,
    };
    const result = await takeDscAction(payload);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      refetchData();
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
    const dscsInSubBox = dscs.filter((d) => d.location.subBox === subBoxId);
    return { id: subBoxId, dscs: dscsInSubBox, count: dscsInSubBox.length };
  });

  const dscsInSelectedSubBox = selectedSubBox
    ? dscs.filter((d) => d.location.subBox === selectedSubBox)
    : [];

  if (!mainBoxId || !currentUser) return null;

  const canTakeSelectedDsc = selectedDsc && !currentUser.hasDsc;

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
              {subBoxes.map(({ id, count }) => (
                <Button
                  key={id}
                  variant="outline"
                  className={cn(
                    'h-24 w-full flex-col p-2 text-center transition-all duration-300',
                    count > 0 ? 'bg-accent/20 hover:bg-accent/30' : 'bg-secondary',
                    selectedSubBox === id && 'ring-4 ring-primary/50 ring-offset-2 ring-offset-background'
                  )}
                  onClick={() => {
                    if (count > 0) {
                      setSelectedSubBox(id);
                      setSelectedDsc(null);
                    }
                  }}
                  disabled={count === 0}
                >
                  {count > 0 && <KeyIcon className="h-8 w-8 text-accent" />}
                  <span className="font-mono text-lg font-bold">{id.toUpperCase()}</span>
                  {count > 0 && <p className="text-xs text-muted-foreground">{count} DSCs</p>}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col p-4 text-center">
                {!selectedSubBox ? (
                    <p className="m-auto text-sm text-muted-foreground">Select a sub-box to see details.</p>
                ) : (
                    <>
                        <h3 className="font-semibold mb-2">Sub-box {selectedSubBox.toUpperCase()}</h3>
                        <ScrollArea className="h-auto flex-grow max-h-[240px]">
                            <div className="space-y-1 text-left p-2">
                                {dscsInSelectedSubBox.map((dsc) => (
                                    <div
                                        key={dsc.id}
                                        onClick={() => {
                                          setSelectedDsc(dsc);
                                        }}
                                        className={cn(
                                            "cursor-pointer rounded-md p-2 hover:bg-secondary",
                                            selectedDsc?.id === dsc.id && "bg-secondary ring-2 ring-primary"
                                        )}
                                    >
                                        <p className="text-sm font-medium truncate">{dsc.description}</p>
                                        <p className="text-xs text-muted-foreground">S/N: {dsc.serialNumber}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="mt-4 pt-4 border-t">
                            {selectedDsc ? (
                            <>
                                <p className="text-xs text-muted-foreground">Expires: {new Date(selectedDsc.expiryDate).toLocaleDateString()}</p>
                                <Button className="mt-2 w-full" onClick={handleTakeDsc} disabled={!canTakeSelectedDsc || isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Take DSC'}
                                </Button>
                                {currentUser.hasDsc && (
                                    <p className="mt-2 text-xs text-destructive">
                                    You already hold a DSC.
                                    </p>
                                )}
                            </>
                            ) : (
                              <p className="text-sm text-muted-foreground">Select a DSC to take.</p>
                            )}
                        </div>
                    </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
