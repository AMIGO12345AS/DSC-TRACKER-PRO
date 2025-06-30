'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NotificationForm } from './notification-form';

export function NotificationSettingsDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Customize Renewal Notifications</DialogTitle>
          <DialogDescription>
            Use this form to edit the templates for automated email and in-app renewal notifications.
            The changes will be applied to all future renewal alerts.
          </DialogDescription>
        </DialogHeader>
        <NotificationForm />
      </DialogContent>
    </Dialog>
  );
}
