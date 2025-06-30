import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import { KeyIcon } from './icons';

interface UserCardProps {
  user: {
    name: string;
    role: 'leader' | 'employee';
    hasDsc: boolean;
  };
  isHighlighted?: boolean;
}

export function UserCard({ user, isHighlighted = false }: UserCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-300',
        isHighlighted && 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-background'
      )}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`https://placehold.co/100x100.png`} data-ai-hint="person portrait" />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="truncate font-medium">{user.name}</p>
          <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
        </div>
        {user.hasDsc && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent" title="Has DSC">
            <KeyIcon className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
