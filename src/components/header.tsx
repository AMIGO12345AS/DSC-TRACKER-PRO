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
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KeyIcon } from './icons';
import { NotificationSettingsDialog } from './settings/notification-settings-dialog';
import type { User } from '@/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    // The onIdTokenChanged listener in AuthProvider will handle cookie clearing.
    // We just need to navigate the user to the login page.
    router.push('/login');
  };

  if (!user || !userProfile) {
    return null; // Or a skeleton loader
  }

  const isLeader = userProfile.role === 'leader';
  const initial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : '?';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 ml-8">
          <KeyIcon className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold text-primary">CertiTrack</h1>
        </div>
        <div className="flex items-center mr-8">
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
                    <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
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
                <DropdownMenuItem onClick={handleLogout}>
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
