'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KeyIcon } from '@/components/icons';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center glass-card">
        <CardHeader>
           <KeyIcon className="mx-auto h-10 w-10 text-destructive" />
          <CardTitle className="mt-4 font-headline">Sign Up Disabled</CardTitle>
          <CardDescription>
            New user registration is not available. Please contact an administrator to get access to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild>
                <Link href="/login">Return to Login</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
