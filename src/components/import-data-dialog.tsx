'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
import { AlertTriangle, Loader2, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importJsonBackupAction, importUsersFromCsvAction, importDscsFromCsvAction } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from '@/types';

interface ImportDataDialogProps {
    trigger: React.ReactNode;
    currentUser: User;
}

const USER_CSV_TEMPLATE = 'name,role,password\nJohn Doe,employee,password123\nJane Smith,leader,strongpassword';
const DSC_CSV_TEMPLATE = 'serialNumber,description,expiryDate (YYYY-MM-DD),currentHolderName,locationMainBox,locationSubBox\nSN001,Finance DSC,2025-12-31,John Doe,1,a';


export function ImportDataDialog({ trigger, currentUser }: ImportDataDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [activeTab, setActiveTab] = useState('users');

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset state on close
            setIsImporting(false);
        }
        setIsOpen(open);
    }
    
    const handleDownloadTemplate = (type: 'user' | 'dsc') => {
        const content = type === 'user' ? USER_CSV_TEMPLATE : DSC_CSV_TEMPLATE;
        const filename = type === 'user' ? 'users-import-template.csv' : 'dscs-import-template.csv';
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Import Data</DialogTitle>
                    <DialogDescription>
                       Import Users or DSCs from a CSV file, or restore a full backup from JSON.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="users" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="users">Users (CSV)</TabsTrigger>
                        <TabsTrigger value="dscs">DSCs (CSV)</TabsTrigger>
                        <TabsTrigger value="json">JSON Backup</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="users">
                        <ImportTabContent
                            title="Import Users via CSV"
                            description="This will permanently delete all current users and replace them with the data from the CSV file. DSCs and Audit Logs will not be affected."
                            fileType="text/csv"
                            onDownloadTemplate={() => handleDownloadTemplate('user')}
                            importAction={importUsersFromCsvAction}
                            isImporting={isImporting}
                            setIsImporting={setIsImporting}
                            onSuccess={() => setIsOpen(false)}
                            confirmationMessage="This will permanently delete all existing users."
                            actorId={currentUser.id}
                        />
                    </TabsContent>
                    
                    <TabsContent value="dscs">
                        <ImportTabContent
                            title="Import DSCs via CSV"
                            description="This will permanently delete all current DSCs and replace them with the data from the CSV file. Users and Audit Logs will not be affected."
                            fileType="text/csv"
                            onDownloadTemplate={() => handleDownloadTemplate('dsc')}
                            importAction={importDscsFromCsvAction}
                            isImporting={isImporting}
                            setIsImporting={setIsImporting}
                            onSuccess={() => setIsOpen(false)}
                            confirmationMessage="This will permanently delete all existing DSCs."
                            actorId={currentUser.id}
                        />
                    </TabsContent>

                    <TabsContent value="json">
                        <ImportTabContent
                            title="Restore from JSON Backup"
                            description="This will permanently delete all current users, DSCs, and audit logs, replacing them with the data from the JSON backup file. This action cannot be undone."
                            fileType="application/json"
                            importAction={importJsonBackupAction}
                            isImporting={isImporting}
                            setIsImporting={setIsImporting}
                            onSuccess={() => setIsOpen(false)}
                            confirmationMessage="This will permanently delete all existing data in the database (users, DSCs, and audit logs)."
                            actorId={currentUser.id}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}


interface ImportTabContentProps {
    title: string;
    description: string;
    fileType: string;
    onDownloadTemplate?: () => void;
    importAction: (fileContent: string, actorId: string) => Promise<{ success: boolean; message: string; }>;
    isImporting: boolean;
    setIsImporting: (isImporting: boolean) => void;
    onSuccess: () => void;
    confirmationMessage: string;
    actorId: string;
}

function ImportTabContent({ title, description, fileType, onDownloadTemplate, importAction, isImporting, setIsImporting, onSuccess, confirmationMessage, actorId }: ImportTabContentProps) {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => setFileContent(e.target?.result as string);
            reader.onerror = () => toast({ variant: 'destructive', title: 'File Read Error' });
            reader.readAsText(file);
        }
    };
    
    const resetState = () => {
        setFileContent(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const handleImport = async () => {
        if (!fileContent) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }
        setIsImporting(true);
        const result = await importAction(fileContent, actorId);

        if (result.success) {
            toast({ title: 'Import Successful', description: result.message });
            onSuccess();
        } else {
            toast({ variant: 'destructive', title: 'Import Failed', description: result.message, duration: 8000 });
        }
        
        setIsImporting(false);
        resetState();
    };

    return (
        <div className="space-y-4 py-4">
            <Alert variant={title.includes("JSON") ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>
                    {description}
                    {onDownloadTemplate && (
                         <Button variant="link" size="sm" className="p-0 h-auto mt-1" onClick={onDownloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                    )}
                </AlertDescription>
            </Alert>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor={`file-upload-${title}`}>{fileName || 'Select file'}</Label>
                <Input id={`file-upload-${title}`} type="file" accept={fileType} onChange={handleFileChange} ref={fileInputRef} />
            </div>
             <div className="flex justify-end pt-4">
                 <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button disabled={!fileContent || isImporting}>
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Import Data
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {confirmationMessage} This action cannot be undone.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleImport}>
                                  Yes, Overwrite
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
            </div>
        </div>
    );
}
