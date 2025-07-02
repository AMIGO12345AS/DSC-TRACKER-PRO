'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportDataAction } from '@/app/actions';
import { Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { User } from '@/types';

interface ExportDataDialogProps {
    trigger: React.ReactNode;
    currentUser: User;
}

export function ExportDataDialog({ trigger, currentUser }: ExportDataDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsExporting(true);
        const result = await exportDataAction(currentUser.id);

        if (result.success && result.data) {
            try {
                const jsonString = JSON.stringify(result.data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const formattedDate = format(new Date(), 'yyyy-MM-dd');
                link.download = `nrs-certitrack-export-${formattedDate}.json`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast({
                    title: 'Export Successful',
                    description: 'Your data has been downloaded.',
                });
                setIsOpen(false);
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Export Failed',
                    description: 'Could not create the download file.',
                });
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: result.message || 'An unknown error occurred.',
            });
        }
        setIsExporting(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Export All Data</DialogTitle>
                    <DialogDescription>
                        This will export all users and DSCs from the database into a single JSON file.
                        This file can be used later to import the data back into the system. Keep it safe.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
                        Export Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
