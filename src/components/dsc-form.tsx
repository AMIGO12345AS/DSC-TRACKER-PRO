'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addDscAction, editDscAction } from '@/app/actions';
import type { DSC, User } from '@/types';
import { format } from 'date-fns';

type DscFormProps = {
  dsc?: DSC | null;
  currentUser: User;
  onSuccess: () => void;
  onCancel: () => void;
};

const initialState = { message: undefined, errors: {} };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Add DSC'}
    </Button>
  );
}

export function DscForm({ dsc, currentUser, onSuccess, onCancel }: DscFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!dsc;

  const action = isEditing ? editDscAction : addDscAction;
  const [state, dispatch] = useActionState(action, initialState);

  useEffect(() => {
    if (!state) return;
    if (state.message?.includes('successfully')) {
      toast({
        title: 'Success',
        description: state.message,
      });
      onSuccess();
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast, onSuccess]);
  
  const defaultExpiryDate = dsc?.expiryDate ? format(new Date(dsc.expiryDate), 'yyyy-MM-dd') : '';

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <form action={dispatch} ref={formRef}>
      {isEditing && <input type="hidden" name="dscId" value={dsc.id} />}
      <input type="hidden" name="actorId" value={currentUser.id} />
      <input type="hidden" name="actorName" value={currentUser.name} />

      <div className="grid gap-4 py-4">
        <div className="space-y-1">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Input id="description" name="description" defaultValue={dsc?.description ?? ''} placeholder="e.g., Finance Dept Primary" className="col-span-3" />
          </div>
          {state?.errors?.description && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.description.join(', ')}</p>}
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serialNumber" className="text-right">Serial No.</Label>
            <Input id="serialNumber" name="serialNumber" defaultValue={dsc?.serialNumber ?? ''} placeholder="DSC Serial Number" className="col-span-3" />
          </div>
          {state?.errors?.serialNumber && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.serialNumber.join(', ')}</p>}
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
            <Input id="expiryDate" name="expiryDate" type="date" defaultValue={defaultExpiryDate} className="col-span-3" />
          </div>
          {state?.errors?.expiryDate && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.expiryDate.join(', ')}</p>}
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mainBox" className="text-right">Location</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Input id="mainBox" name="mainBox" type="number" defaultValue={dsc?.location.mainBox} placeholder="Main Box (1-8)" />
              <Input
                id="subBox"
                name="subBox"
                defaultValue={dsc?.location.subBox}
                placeholder="Sub Box (a-i)"
                maxLength={1}
                onChange={(e) => { e.target.value = e.target.value.toLowerCase().replace(/[^a-i]/g, ''); }}
              />
            </div>
          </div>
          {state?.errors?.mainBox && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.mainBox.join(', ')}</p>}
          {state?.errors?.subBox && <p className="col-start-2 col-span-3 text-right text-sm text-destructive">{state.errors.subBox.join(', ')}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <SubmitButton isEditing={isEditing} />
      </DialogFooter>
    </form>
  );
}
