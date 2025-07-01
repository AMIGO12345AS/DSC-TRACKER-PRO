'use client';
import { useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import type { DSC } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface ExpiringDscAlertProps {
  dscs: DSC[];
}

const EXPIRY_THRESHOLD_DAYS = 30;

export function ExpiringDscAlert({ dscs }: ExpiringDscAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { userProfile } = useAuth();

  const expiringDscs = useMemo(() => {
    if (userProfile?.role !== 'leader') {
      return [];
    }
    const now = new Date();
    return dscs.filter(dsc => {
      const expiryDate = new Date(dsc.expiryDate);
      const daysUntilExpiry = differenceInDays(expiryDate, now);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= EXPIRY_THRESHOLD_DAYS;
    });
  }, [dscs, userProfile]);

  if (expiringDscs.length === 0 || !isVisible || !userProfile) {
    return null;
  }

  return (
    <Alert variant="destructive" className="relative pr-12">
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
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 h-6 w-6 text-destructive hover:bg-destructive/10"
        onClick={() => setIsVisible(false)}
        aria-label="Close alert"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
