
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubBoxModal } from '../sub-box-modal';
import type { DSC, User } from '@/types';
import { cn } from '@/lib/utils';
import { KeyRound } from 'lucide-react';
import type { HighlightInfo } from '../dashboard-client';

interface TopRightQuadrantProps {
  dscs: DSC[];
  highlightedInfo: HighlightInfo;
  onDscSelect: (dsc: DSC) => void;
  currentUser: User;
  refetchData: () => void;
}

export default function TopRightQuadrant({ dscs, highlightedInfo, onDscSelect, currentUser, refetchData }: TopRightQuadrantProps) {
  const [selectedMainBox, setSelectedMainBox] = useState<number | null>(null);

  useEffect(() => {
    if (highlightedInfo?.type === 'dsc' && highlightedInfo.id) {
      const boxId = parseInt(highlightedInfo.id, 10);
      if (!isNaN(boxId)) {
        setSelectedMainBox(boxId);
      }
    }
  }, [highlightedInfo]);

  const mainBoxes = Array.from({ length: 8 }, (_, i) => {
    const boxId = i + 1;
    const dscCount = dscs.filter((dsc) => dsc.location.mainBox === boxId).length;
    return { id: boxId, dscCount };
  });

  const dscsInSelectedBox = dscs.filter(
    (dsc) => dsc.location.mainBox === selectedMainBox
  );

  return (
    <>
      <Card className="h-full glass-card">
        <CardHeader>
          <h3 className="font-headline text-2xl">DSC Storage</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {mainBoxes.map((box) => (
              <Button
                key={box.id}
                variant="outline"
                className={cn(
                    'h-24 w-full flex-col gap-2 p-2 transition-all duration-300',
                    highlightedInfo?.type === 'dsc' && highlightedInfo.id === box.id.toString() && 'ring-4 ring-primary/50 ring-offset-2 ring-offset-background',
                    box.dscCount > 0 ? 'bg-primary/10 hover:bg-primary/20' : 'bg-secondary'
                )}
                onClick={() => setSelectedMainBox(box.id)}
              >
                <KeyRound className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <span className="font-bold">Box {box.id}</span>
                  <p className="text-xs text-muted-foreground">{box.dscCount} DSCs</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <SubBoxModal
        isOpen={selectedMainBox !== null}
        onClose={() => setSelectedMainBox(null)}
        mainBoxId={selectedMainBox}
        dscs={dscsInSelectedBox}
        currentUser={currentUser}
        onDscSelect={onDscSelect}
        refetchData={refetchData}
        highlightedInfo={highlightedInfo}
      />
    </>
  );
}
