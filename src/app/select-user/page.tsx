'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/hooks/use-user-session';
import { useAuth } from '@/hooks/use-auth';
import { getUsersAction } from '@/app/actions';
import type { User } from '@/types';
import { UserCard } from '@/components/user-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';

export default function SelectUserPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { setSelectedUser } = useUserSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            const result = await getUsersAction();
            if (result.success && result.data) {
                setUsers(result.data);
            } else {
                console.error("Failed to fetch users:", result.message);
                // Optionally show a toast message here
            }
            setLoading(false);
        }
        if (user) {
            fetchUsers();
        }
    }, [user]);

    const handleUserSelect = (userToSelect: User) => {
        setSelectedUser(userToSelect);
        router.push('/');
    };
    
    if (authLoading || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl glass-card">
                <CardHeader className="text-center">
                    <Users className="mx-auto h-10 w-10 text-primary" />
                    <CardTitle className="mt-4 font-headline">Select a User Profile</CardTitle>
                    <CardDescription>
                        Choose a profile to act as within the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
                        {users.length > 0 ? (
                            users.map((u) => (
                                <button key={u.id} onClick={() => handleUserSelect(u)} className="w-full text-left">
                                    <UserCard user={u} />
                                </button>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground col-span-2">
                                No user profiles found. Please add users via the dashboard.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
