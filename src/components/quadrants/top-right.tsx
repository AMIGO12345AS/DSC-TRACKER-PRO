'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubBoxModal } from '../sub-box-modal';
import type { DSC } from '@/types';
import { cn } from '@/lib/utils';
import { KeyRound } from 'lucide-react';

interface TopRightQuadrantProps {
  dscs: DSC[];
  highlightedId: string | null;
  onDscSelect: (dsc: DSC) => void;
}

export default function TopRightQuadrant({ dscs, highlightedId, onDscSelect }: TopRightQuadrantProps) {
  const [selectedMainBox, setSelectedMainBox] = useState<number | null>(null);

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
      <Card className="h-full">
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
                    highlightedId === box.id.toString() && 'ring-4 ring-yellow-400',
                    box.dscCount > 0 ? 'bg-accent/20 hover:bg-accent/30' : 'bg-secondary'
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
        onDscSelect={onDscSelect}
      />
    </>
  );
}
