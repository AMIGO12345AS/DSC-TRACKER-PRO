'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addUserAction, updateUserAction } from '@/app/actions';
import type { User } from '@/types';

type UserFormProps = {
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const initialState = { message: undefined, errors: {} };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Add User'}
    </Button>
  );
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = !!user;

  const action = isEditing ? updateUserAction : addUserAction;
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

  return (
    <form action={dispatch} ref={formRef}>
      {isEditing && <input type="hidden" name="userId" value={user.id} />}
      <div className="grid gap-4 py-4">
        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={user?.name ?? ''} />
          {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue={user?.role ?? 'employee'}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="leader">Leader</SelectItem>
            </SelectContent>
          </Select>
          {state?.errors?.role && <p className="text-sm text-destructive">{state.errors.role.join(', ')}</p>}
        </div>
      </div>
      <DialogFooter>
         <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <SubmitButton isEditing={isEditing} />
      </DialogFooter>
    </form>
  );
}
