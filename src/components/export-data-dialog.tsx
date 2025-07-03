
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { exportDataAction } from '@/app/actions';
import { Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { DSC, User } from '@/types';
import Papa from 'papaparse';

interface ExportDataDialogProps {
    trigger: React.ReactNode;
    currentUser: User;
}

export function ExportDataDialog({ trigger, currentUser }: ExportDataDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExportingJson, setIsExportingJson] = useState(false);
    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const { toast } = useToast();

    const downloadFile = (content: string, filename: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleJsonExport = async () => {
        setIsExportingJson(true);
        const result = await exportDataAction(currentUser.id);

        if (result.success && result.data) {
            try {
                const jsonString = JSON.stringify(result.data, null, 2);
                const formattedDate = format(new Date(), 'yyyy-MM-dd');
                downloadFile(jsonString, `nrs-certitrack-backup-${formattedDate}.json`, 'application/json');

                toast({
                    title: 'Export Successful',
                    description: 'Your JSON backup has been downloaded.',
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
        setIsExportingJson(false);
    }

    const handleCsvExport = async () => {
        setIsExportingCsv(true);
        const result = await exportDataAction(currentUser.id);

        if (result.success && result.data) {
            const { users, dscs } = result.data;
            try {
                // Prepare and download user data
                const userCsvData = users.map(({ id, password, ...rest }) => rest);
                const userCsvString = Papa.unparse(userCsvData);
                const formattedDate = format(new Date(), 'yyyy-MM-dd');
                downloadFile(userCsvString, `nrs-certitrack-users-${formattedDate}.csv`, 'text/csv');

                // Prepare and download DSC data with a short delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const userMap = new Map(users.map(u => [u.id, u.name]));
                const dscCsvData = dscs.map(d => ({
                    serialNumber: d.serialNumber,
                    description: d.description,
                    'expiryDate_YYYY-MM-DD': format(new Date(d.expiryDate), 'yyyy-MM-dd'),
                    status: d.status,
                    currentHolderName: d.currentHolderId ? userMap.get(d.currentHolderId) || 'N/A' : '',
                    clientName: d.clientName || '',
                    clientDetails: d.clientDetails || '',
                    locationMainBox: d.location.mainBox,
                    locationSubBox: d.location.subBox,
                }));
                const dscCsvString = Papa.unparse(dscCsvData);
                downloadFile(dscCsvString, `nrs-certitrack-dscs-${formattedDate}.csv`, 'text/csv');

                toast({
                    title: 'Export Successful',
                    description: 'Your user and DSC data have been downloaded as separate CSV files.',
                });
                setIsOpen(false);
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: 'Export Failed',
                    description: 'Could not create the CSV download files.',
                });
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: result.message || 'An unknown error occurred.',
            });
        }
        setIsExportingCsv(false);
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Export All Data</DialogTitle>
                    <DialogDescription>
                       Export all user and DSC data. JSON is a full backup that can be re-imported.
                       CSV is for use in spreadsheets and downloads separate files for users and DSCs.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <Button onClick={handleJsonExport} disabled={isExportingJson || isExportingCsv} variant="outline">
                        {isExportingJson ? <Loader2 className="animate-spin" /> : <Download />}
                        Export as JSON
                    </Button>
                    <Button onClick={handleCsvExport} disabled={isExportingJson || isExportingCsv} variant="outline">
                         {isExportingCsv ? <Loader2 className="animate-spin" /> : <Download />}
                        Export as CSV
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
