'use client';

import { Settings, LogOut, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KeyIcon } from './icons';
import { NotificationSettingsDialog } from './settings/notification-settings-dialog';
import type { User } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  allUsers: User[];
  loggedInUser: User;
  onUserChange: (user: User) => void;
}

export function Header({ allUsers, loggedInUser, onUserChange }: HeaderProps) {
  const isLeader = loggedInUser.role === 'leader';
  const initial = loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : '?';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 ml-4">
          <KeyIcon className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold text-primary">CertiTrack</h1>
        </div>
        <div className="flex items-center">
          <nav className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
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
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{loggedInUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {loggedInUser.name.toLowerCase().replace(' ', '.')}@certitrack.app
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Switch User</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            {allUsers.map((user) => (
                                <DropdownMenuItem key={user.id} onClick={() => onUserChange(user)}>
                                    {user.id === loggedInUser.id ? (
                                        <Check className="mr-2 h-4 w-4" />
                                    ) : (
                                        <span className="mr-2 h-4 w-4" /> 
                                    )}
                                    <span>{user.name} ({user.role})</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                {isLeader && (
                  <NotificationSettingsDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Notification Settings</span>
                    </DropdownMenuItem>
                  </NotificationSettingsDialog>
                )}
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
