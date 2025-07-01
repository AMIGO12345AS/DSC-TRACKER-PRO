'use client';
import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import type { DSC, User } from '@/types';

interface ExpiringDscAlertProps {
  dscs: DSC[];
  user: User;
}

const EXPIRY_THRESHOLD_DAYS = 30;

export function ExpiringDscAlert({ dscs, user }: ExpiringDscAlertProps) {
  const expiringDscs = useMemo(() => {
    if (user.role !== 'leader') {
      return [];
    }
    const now = new Date();
    return dscs.filter(dsc => {
      const expiryDate = new Date(dsc.expiryDate);
      const daysUntilExpiry = differenceInDays(expiryDate, now);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= EXPIRY_THRESHOLD_DAYS;
    });
  }, [dscs, user.role]);

  if (expiringDscs.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Expiring DSCs Alert!</AlertTitle>
      <AlertDescription>
        The following {expiringDscs.length} DSC(s) will expire in the next {EXPIRY_THRESHOLD_DAYS} days. Please take action.
        <ul className="mt-2 list-disc pl-5">
            {expiringDscs.map(dsc => (
                <li key={dsc.id}>
                    <strong>{dsc.description}</strong> (S/N: {dsc.serialNumber}) - Expires on {format(new Date(dsc.expiryDate), 'dd MMM yyyy')}
                </li>
            ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
