
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/hooks/use-user-session';
import { useAuth } from '@/hooks/use-auth';
import { getUsersAction, verifyUserPasswordAction } from '@/app/actions';
import type { User } from '@/types';
import { UserCard } from '@/components/user-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Users, Search } from 'lucide-react';
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

    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users;
        }
        return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);

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
            <Card className="w-full max-w-4xl glass-card">
                <CardHeader className="text-center">
                    <Users className="mx-auto h-10 w-10 text-primary" />
                    <CardTitle className="mt-4 font-headline">Select a User Profile</CardTitle>
                    <CardDescription>
                        Choose a profile to act as within the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <div className="mx-auto mb-4 w-full max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by user name..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <button key={u.id} onClick={() => handleUserSelect(u)} className="w-full text-left">
                                        <UserCard user={u} />
                                    </button>
                                ))
                            ) : (
                                <p className="col-span-1 py-10 text-center text-muted-foreground md:col-span-2 lg:col-span-3">
                                    No user profiles found matching your search.
                                </p>
                            )}
                        </div>
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
                    <div className="space-y-2 py-4">
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
