'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { takeDscByClientAction, returnDscFromClientAction, getDashboardDataAction } from '@/app/actions';
import type { DSC, User } from '@/types';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';

interface InClientsHandDialogProps {
  trigger: React.ReactNode;
  currentUser: User;
  onSuccess: () => void;
}

export function InClientsHandDialog({ trigger, currentUser, onSuccess }: InClientsHandDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'assign'>('list');
  const [allDscs, setAllDscs] = useState<DSC[]>([]);
  const { toast } = useToast();

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      const result = await getDashboardDataAction();
      if (result.success && result.data) {
        setAllDscs(result.data.dscs);
      }
    } else {
      setView('list');
    }
    setIsOpen(open);
  };

  const handleSuccess = () => {
    onSuccess();
    handleOpenChange(true); // Refetch data
    setView('list');
  };

  const dscsWithClients = useMemo(() => allDscs.filter(d => d.status === 'with-client'), [allDscs]);
  const dscsInStorage = useMemo(() => allDscs.filter(d => d.status === 'storage'), [allDscs]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
            <div className="flex items-center gap-4">
                {view === 'assign' && (
                    <Button variant="ghost" size="icon" onClick={() => setView('list')}>
                        <ArrowLeft />
                    </Button>
                )}
                <div>
                    <DialogTitle className="font-headline">
                        {view === 'list' ? "DSCs in Client's Hand" : "Assign DSC to Client"}
                    </DialogTitle>
                    <DialogDescription>
                        {view === 'list' ? "Manage DSCs currently held by external clients." : "Select a DSC from storage to assign to a client."}
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>

        {view === 'list' ? (
          <ClientDscList dscs={dscsWithClients} onAssignClick={() => setView('assign')} onSuccess={handleSuccess} currentUser={currentUser} />
        ) : (
          <AssignToClientForm dscsInStorage={dscsInStorage} onSuccess={handleSuccess} currentUser={currentUser} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- List View Component ---
function ClientDscList({ dscs, onAssignClick, onSuccess, currentUser }: { dscs: DSC[], onAssignClick: () => void, onSuccess: () => void, currentUser: User }) {
  const [dscToReturn, setDscToReturn] = useState<DSC | null>(null);

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={onAssignClick}>Assign DSC to Client</Button>
      </div>
      <ScrollArea className="h-[400px] border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>DSC Description</TableHead>
              <TableHead>Serial No.</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dscs.length > 0 ? dscs.map(dsc => (
              <TableRow key={dsc.id}>
                <TableCell className="font-medium">{dsc.clientName}</TableCell>
                <TableCell>{dsc.description}</TableCell>
                <TableCell>{dsc.serialNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{dsc.clientDetails}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setDscToReturn(dsc)}>Return</Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">No DSCs are currently with clients.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      {dscToReturn && (
          <ReturnFromClientDialog 
            dsc={dscToReturn} 
            onClose={() => setDscToReturn(null)} 
            onSuccess={onSuccess} 
            currentUser={currentUser}
          />
      )}
    </>
  );
}

// --- Assign Form Component ---
function AssignToClientForm({ dscsInStorage, onSuccess, currentUser }: { dscsInStorage: DSC[], onSuccess: () => void, currentUser: User }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDsc, setSelectedDsc] = useState<DSC | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientDetails, setClientDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const filteredDscs = useMemo(() => {
    if (!searchTerm) return [];
    return dscsInStorage.filter(d => 
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, dscsInStorage]);

  const handleSubmit = async () => {
    if (!selectedDsc || !clientName || !clientDetails) {
      toast({ variant: 'destructive', title: 'Error', description: "Please fill all fields." });
      return;
    }
    setIsSubmitting(true);
    const payload = {
        dscId: selectedDsc.id,
        dscSerialNumber: selectedDsc.serialNumber,
        dscDescription: selectedDsc.description,
        clientName,
        clientDetails,
        actorId: currentUser.id,
        actorName: currentUser.name,
    };
    const result = await takeDscByClientAction(payload);
    if(result.success) {
        toast({ title: "Success", description: result.message });
        onSuccess();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="p-4 border rounded-md">
        <h4 className="font-semibold mb-2">1. Select DSC from Storage</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search DSC by description or S/N..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        {searchTerm && (
          <ScrollArea className="h-40 border rounded-md mt-2">
            {filteredDscs.map(dsc => (
              <div key={dsc.id} className="p-2 hover:bg-secondary cursor-pointer" onClick={() => { setSelectedDsc(dsc); setSearchTerm(''); }}>
                <p className="font-medium">{dsc.description}</p>
                <p className="text-sm text-muted-foreground">{dsc.serialNumber}</p>
              </div>
            ))}
          </ScrollArea>
        )}
        {selectedDsc && (
            <div className="mt-4 p-2 bg-secondary rounded-md">
                <p className="font-semibold">Selected: {selectedDsc.description}</p>
                <p className="text-sm text-muted-foreground">S/N: {selectedDsc.serialNumber} | Expires: {format(new Date(selectedDsc.expiryDate), 'dd MMM yyyy')}</p>
            </div>
        )}
      </div>

      <div className="p-4 border rounded-md space-y-4">
        <h4 className="font-semibold">2. Enter Client Details</h4>
        <div className="space-y-1">
          <Label htmlFor="clientName">Client Name</Label>
          <Input id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="clientDetails">Other Details (e.g., contact info, project name)</Label>
          <Textarea id="clientDetails" value={clientDetails} onChange={e => setClientDetails(e.target.value)} />
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!selectedDsc || !clientName || !clientDetails || isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Assign DSC
        </Button>
      </DialogFooter>
    </div>
  );
}

// --- Return Dialog ---
function ReturnFromClientDialog({ dsc, onClose, onSuccess, currentUser }: { dsc: DSC, onClose: () => void, onSuccess: () => void, currentUser: User }) {
    const [returnNotes, setReturnNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleReturn = async () => {
        setIsSubmitting(true);
        const payload = {
            dscId: dsc.id,
            dscSerialNumber: dsc.serialNumber,
            dscDescription: dsc.description,
            returnNotes,
            actorId: currentUser.id,
            actorName: currentUser.name,
        };
        const result = await returnDscFromClientAction(payload);
        if(result.success) {
            toast({ title: 'Success', description: result.message });
            onSuccess();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsSubmitting(false);
        onClose();
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Return DSC from {dsc.clientName}</DialogTitle>
                    <DialogDescription>
                        Confirm the return of '{dsc.description}' (S/N: {dsc.serialNumber}).
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="returnNotes">Return Notes (optional)</Label>
                    <Textarea id="returnNotes" value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} placeholder="e.g., Project completed." />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleReturn} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Return
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
