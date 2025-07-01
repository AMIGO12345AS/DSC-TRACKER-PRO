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
import { DscForm } from './dsc-form';
import type { DSC, User } from '@/types';

interface ManageDscDialogProps {
  dsc?: DSC | null;
  trigger: React.ReactNode;
  onSuccess?: () => void;
  currentUser: User;
}

export function ManageDscDialog({ dsc, trigger, onSuccess, currentUser }: ManageDscDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };
  
  const isEditing = !!dsc;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <h3 className="font-headline text-lg">
            {isEditing ? 'Edit Digital Signature Certificate' : 'Add New Digital Signature Certificate'}
          </h3>
          <DialogDescription>
            {isEditing ? 'Update the details for this DSC.' : 'Enter the details for the new DSC and assign it to a physical location.'}
          </DialogDescription>
        </DialogHeader>
        <DscForm 
            dsc={dsc}
            currentUser={currentUser}
            onSuccess={handleSuccess}
            onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
