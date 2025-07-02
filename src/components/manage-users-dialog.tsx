
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
import { Trash2, Edit, ArrowLeft, UserPlus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface ManageUsersDialogProps {
  users: User[];
  trigger: React.ReactNode;
  currentUser: User;
  onSuccess: () => void;
}

export function ManageUsersDialog({ users, trigger, currentUser, onSuccess }: ManageUsersDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { toast } = useToast();

  const handleAddNewUser = () => {
      setUserToEdit(null);
      setView('form');
  }

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setView('form');
  };

  const handleDeleteUser = async (userId: string) => {
      const result = await deleteUserAction({ userIdToDelete: userId, actorId: currentUser.id });
      if (result.success) {
          toast({ title: 'Success', description: result.message });
          onSuccess();
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
  };

  const handleFormSuccess = () => {
    setView('list');
    setUserToEdit(null);
    onSuccess();
  };
  
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          setView('list');
          setUserToEdit(null);
      }
      setIsDialogOpen(open);
  }

  const getTooltipMessage = (user: User) => {
      if(user.id === currentUser.id) return "You cannot delete yourself.";
      if(user.hasDsc) return "Cannot delete a user who holds a DSC.";
      return "Delete User";
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
                    {view === 'list' ? "Add, edit, or remove user profiles. Passwords are required and stored securely." : "Enter the user's details. Passwords are encrypted and cannot be viewed once set."}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>
        
        {view === 'list' ? (
          <>
            <div className="mt-4">
                <Button onClick={handleAddNewUser}>
                    <UserPlus className="mr-2" />
                    Add New User
                </Button>
            </div>
            <ScrollArea className="h-[300px] border rounded-md mt-4">
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={user.hasDsc || user.id === currentUser.id}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Delete User</span>
                                    </Button>
                                  </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p>{getTooltipMessage(user)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the user's profile from the database. You cannot delete a user who currently holds a DSC.
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
            currentUser={currentUser}
            onSuccess={handleFormSuccess} 
            onCancel={() => setView('list')}
           />
        )}
      </DialogContent>
    </Dialog>
  );
}
