'use client';

import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KeyIcon } from './icons';
import { NotificationSettingsDialog } from './settings/notification-settings-dialog';
import type { User } from '@/types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface HeaderProps {
    allUsers: User[];
    currentUser: User;
    setCurrentUser: (user: User) => void;
}

export function Header({ allUsers, currentUser, setCurrentUser }: HeaderProps) {
  const isLeader = currentUser.role === 'leader';
  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?';

  const handleUserChange = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <KeyIcon className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold text-primary">NRS CertiTrack</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className='w-48'>
                <Select value={currentUser.id} onValueChange={handleUserChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Switch user..." />
                  </SelectTrigger>
                  <SelectContent>
                     {allUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                            <div className='flex items-center gap-2'>
                               <Avatar className='h-6 w-6'>
                                 <AvatarFallback
                                    className={cn(
                                        'font-semibold text-xs',
                                        user.role === 'leader'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground'
                                    )}
                                    >
                                    {user.name.charAt(0).toUpperCase()}
                                 </AvatarFallback>
                               </Avatar>
                               <span>{user.name}</span>
                            </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarFallback
                      className={cn(
                        'font-semibold',
                        isLeader
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {initial}
                    </AvatarFallback>
                  </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {currentUser.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLeader && (
                  <NotificationSettingsDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Notification Settings</span>
                    </DropdownMenuItem>
                  </NotificationSettingsDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
