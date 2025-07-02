'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/hooks/use-user-session';
import { useAuth } from '@/hooks/use-auth';
import { getUsersAction, verifyUserPasswordAction } from '@/app/actions';
import type { User } from '@/types';
import { UserCard } from '@/components/user-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


export default function SelectUserPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { setSelectedUser } = useUserSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [verifyingUser, setVerifyingUser] = useState<User | null>(null);
    const [password, setPassword] = useState('');
    const [isCheckingPassword, setIsCheckingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

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
                toast({ variant: 'destructive', title: "Failed to fetch users", description: result.message });
            }
            setLoading(false);
        }
        if (user) {
            fetchUsers();
        }
    }, [user, toast]);

    const handleUserSelect = (userToSelect: User) => {
        setPassword('');
        setPasswordError(null);
        setVerifyingUser(userToSelect);
    };

    const handlePasswordVerification = async () => {
        if (!verifyingUser) return;
        setIsCheckingPassword(true);
        setPasswordError(null);

        const result = await verifyUserPasswordAction({ userId: verifyingUser.id, password: password });

        if (result.success) {
            setSelectedUser(verifyingUser);
            router.push('/');
        } else {
            setPasswordError(result.message);
        }
        setIsCheckingPassword(false);
    }
    
    const handleDialogClose = () => {
        setVerifyingUser(null);
    }
    
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

            <Dialog open={!!verifyingUser} onOpenChange={(open) => !open && handleDialogClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Password for {verifyingUser?.name}</DialogTitle>
                        <DialogDescription>
                            Please enter the password for this user profile to proceed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerification()}
                        />
                        {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                        <Button onClick={handlePasswordVerification} disabled={isCheckingPassword}>
                            {isCheckingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Proceed
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
