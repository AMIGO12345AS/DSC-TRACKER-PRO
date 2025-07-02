'use client';

import { Settings, LogOut } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export function Header() {
  const { userProfile: currentUser } = useAuth();
  const router = useRouter();
  const auth = getAuth(app);

  if (!currentUser) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
                <KeyIcon className="h-6 w-6 text-primary" />
                <h1 className="font-headline text-xl font-bold text-primary">NRS CertiTrack</h1>
            </div>
        </div>
      </header>
    );
  }

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isLeader = currentUser.role === 'leader';
  const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <KeyIcon className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-bold text-primary">NRS CertiTrack</h1>
        </div>
        <div className="flex items-center gap-4">
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
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
