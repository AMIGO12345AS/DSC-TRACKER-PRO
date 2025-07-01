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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ScrollArea } from './ui/scroll-area';
import { UserForm } from './user-form';
import { useToast } from '@/hooks/use-toast';
import { deleteUserAction } from '@/app/actions';
import type { User } from '@/types';
import { PlusCircle, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface ManageUsersDialogProps {
  users: User[];
  trigger: React.ReactNode;
}

export function ManageUsersDialog({ users, trigger }: ManageUsersDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleAddUser = () => {
    setUserToEdit(null);
    setView('form');
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setView('form');
  };

  const handleDeleteUser = async (userId: string) => {
      const result = await deleteUserAction(userId);
      if (result.message.includes('successfully')) {
          toast({ title: 'Success', description: result.message });
          router.refresh();
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
  };

  const handleFormSuccess = () => {
    setView('list');
    setUserToEdit(null);
  };
  
  // When closing the main dialog, reset the view
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          setView('list');
          setUserToEdit(null);
      }
      setIsDialogOpen(open);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
             {view === 'form' && (
                <Button variant="ghost" size="icon" onClick={() => setView('list')}>
                    <ArrowLeft />
                </Button>
             )}
             <div>
                <DialogTitle className="font-headline">
                    {view === 'list' ? 'Manage Users' : userToEdit ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogDescription>
                    {view === 'list' ? 'Add, edit, or remove users from the system.' : 'Fill in the details below.'}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>
        
        {view === 'list' ? (
          <>
            <div className="my-4 flex justify-end">
              <Button onClick={handleAddUser}>
                <PlusCircle className="mr-2" /> Add New User
              </Button>
            </div>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Has DSC</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>{user.hasDsc ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit User</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" disabled={user.hasDsc} title={user.hasDsc ? "Cannot delete user with DSC" : "Delete User"}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete User</span>
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the user.
                                      You cannot delete a user who currently holds a DSC.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                      Continue
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
           <UserForm 
            user={userToEdit} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setView('list')}
           />
        )}
      </DialogContent>
    </Dialog>
  );
}
