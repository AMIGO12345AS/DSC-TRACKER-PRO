'use client';

import { useState, useActionState, useEffect, useFormStatus } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyIcon } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import { signUpAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

function SignUpSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Account
    </Button>
  );
}

const SignUpForm = ({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) => {
  const { toast } = useToast();
  const [state, formAction] = useActionState(signUpAction, { message: '', success: false, errors: {} });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
        });
        onSwitchToSignIn(); // Switch back to sign-in form on success
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: state.message,
        });
      }
    }
  }, [state, toast, onSwitchToSignIn]);

  return (
    <form action={formAction}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" placeholder="John Doe" required />
          {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" name="email" type="email" placeholder="john.doe@example.com" required />
          {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" name="password" type="password" required />
          {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <SignUpSubmitButton />
        <Button variant="link" size="sm" onClick={onSwitchToSignIn} type="button">
          Already have an account? Sign In
        </Button>
      </CardFooter>
    </form>
  );
};

const SignInForm = ({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      let errorMessage = 'Failed to log in. Please check your credentials.';
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          default:
            errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            type="email"
            placeholder="leader@certitrack.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
        <Button variant="link" size="sm" onClick={onSwitchToSignUp} type="button">
          Don&apos;t have an account? Sign Up
        </Button>
      </CardFooter>
    </form>
  );
};


export default function LoginPage() {
  const [isSigningUp, setIsSigningUp] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <KeyIcon className="h-7 w-7 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary">CertiTrack</h1>
          </div>
          <CardTitle className="text-xl">{isSigningUp ? 'Create an Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isSigningUp ? 'Enter your details to get started.' : 'Enter your credentials to access your dashboard.'}
          </CardDescription>
        </CardHeader>
        {isSigningUp ? (
          <SignUpForm onSwitchToSignIn={() => setIsSigningUp(false)} />
        ) : (
          <SignInForm onSwitchToSignUp={() => setIsSigningUp(true)} />
        )}
      </Card>
    </div>
  );
}
