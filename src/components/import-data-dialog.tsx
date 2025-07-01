'use client';

import { useState, useRef } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importDataAction } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImportDataDialogProps {
    trigger: React.ReactNode;
}

export function ImportDataDialog({ trigger }: ImportDataDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState<'json' | 'csv' | null>(null);
    const { toast } = useToast();
    const jsonInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    
    const CSV_TEMPLATE_HEADERS = ['type', 'name', 'role', 'serialNumber', 'description', 'expiryDate (YYYY-MM-DD)', 'currentHolderName', 'locationMainBox', 'locationSubBox'];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'json' | 'csv') => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setFileType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    setFileContent(text);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Invalid File',
                        description: 'Could not read the file content.',
                    });
                    setFileContent(null);
                    setFileName('');
                    setFileType(null);
                }
            };
            reader.onerror = () => {
                 toast({
                    variant: 'destructive',
                    title: 'File Read Error',
                    description: 'There was an error reading the selected file.',
                });
                setFileContent(null);
                setFileName('');
                setFileType(null);
            }
            reader.readAsText(file);
        }
    };
    
    const handleDownloadTemplate = () => {
        const csvContent = CSV_TEMPLATE_HEADERS.join(',') + '\n';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'certitrack-import-template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const handleImport = async () => {
        if (!fileContent || !fileType) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }

        setIsImporting(true);
        const result = await importDataAction(fileContent, fileType);

        if (result.success) {
            toast({
                title: 'Import Successful',
                description: 'Your data has been imported and applied.',
            });
            setIsOpen(false);
        } else {
            toast({
                variant: 'destructive',
                title: 'Import Failed',
                description: result.message || 'An unknown error occurred during import.',
            });
        }
        
        // Reset state regardless of outcome
        setIsImporting(false);
        setFileContent(null);
        setFileName('');
        setFileType(null);
        if(jsonInputRef.current) jsonInputRef.current.value = '';
        if(csvInputRef.current) csvInputRef.current.value = '';
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset state on close
            setFileContent(null);
            setFileName('');
            setFileType(null);
            setIsImporting(false);
            if(jsonInputRef.current) jsonInputRef.current.value = '';
            if(csvInputRef.current) csvInputRef.current.value = '';
        }
        setIsOpen(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Import Data</DialogTitle>
                    <DialogDescription>
                       Import data from a JSON backup file or a CSV file. This will overwrite all existing data.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="json" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="json">From JSON</TabsTrigger>
                        <TabsTrigger value="csv">From CSV</TabsTrigger>
                    </TabsList>
                    <TabsContent value="json">
                        <div className="space-y-4 py-4">
                           <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warning: Destructive Action</AlertTitle>
                                <AlertDescription>
                                    Importing data will completely **delete all current users and DSCs** before adding the new data. This action cannot be undone.
                                </AlertDescription>
                            </Alert>

                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="json-file">JSON Backup File</Label>
                                <Input id="json-file" type="file" accept=".json" onChange={(e) => handleFileChange(e, 'json')} ref={jsonInputRef} />
                            </div>
                            {fileName && fileType === 'json' && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="csv">
                         <div className="space-y-4 py-4">
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>CSV Import Guide</AlertTitle>
                                <AlertDescription>
                                    Use a single CSV file with a `type` column (`user` or `dsc`) for each row. Relationships are handled via `currentHolderName`.
                                    <Button variant="link" size="sm" className="p-0 h-auto mt-1" onClick={handleDownloadTemplate}>
                                        <Download className="mr-2" />
                                        Download CSV Template
                                    </Button>
                                </AlertDescription>
                            </Alert>
                             <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="csv-file">CSV File</Label>
                                <Input id="csv-file" type="file" accept=".csv" onChange={(e) => handleFileChange(e, 'csv')} ref={csvInputRef}/>
                            </div>
                            {fileName && fileType === 'csv' && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                     <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button disabled={!fileContent || isImporting}>
                                {isImporting ? <Loader2 className="animate-spin" /> : <Upload />}
                                Import Data
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

                                  <AlertDialogDescription>
                                      This action will permanently delete all existing data in the database and replace it with the content of the selected file. This cannot be undone.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleImport}>
                                      Yes, Overwrite Everything
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
