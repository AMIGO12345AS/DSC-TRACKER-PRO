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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importDataAction } from '@/app/actions';

interface ImportDataDialogProps {
    trigger: React.ReactNode;
}

export function ImportDataDialog({ trigger }: ImportDataDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
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
            }
            reader.readAsText(file);
        }
    };

    const handleImport = async () => {
        if (!fileContent) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }

        setIsImporting(true);
        const result = await importDataAction(fileContent);

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
        setIsImporting(false);
        setFileContent(null);
        setFileName('');
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset state on close
            setFileContent(null);
            setFileName('');
            setIsImporting(false);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        setIsOpen(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Import Data</DialogTitle>
                    <DialogDescription>
                        Upload a previously exported JSON file to overwrite all existing data.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning: Destructive Action</AlertTitle>
                    <AlertDescription>
                        Importing data will completely **delete all current users and DSCs** before adding the new data. This action cannot be undone.
                    </AlertDescription>
                </Alert>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="import-file">JSON File</Label>
                    <Input id="import-file" type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} />
                </div>
                 {fileName && <p className="text-sm text-muted-foreground">Selected file: {fileName}</p>}

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
