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
  loggedInUser: User;
  onClose?: () => void;
}

export function ManageDscDialog({ dsc, trigger, loggedInUser, onClose }: ManageDscDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onClose?.();
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onClose?.();
    }
  }
  
  const isEditing = !!dsc;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isEditing ? 'Edit Digital Signature Certificate' : 'Add New Digital Signature Certificate'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this DSC.' : 'Enter the details for the new DSC and assign it to a physical location.'}
          </DialogDescription>
        </DialogHeader>
        <DscForm 
            dsc={dsc}
            loggedInUser={loggedInUser}
            onSuccess={handleSuccess}
            onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
