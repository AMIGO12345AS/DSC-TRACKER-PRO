import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, ListChecks, Users, KeyRound, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function SetupGuide({ isNewUser }: { isNewUser?: boolean }) {
  if (isNewUser) {
    return (
       <div className="container mx-auto max-w-4xl py-10">
        <Card className="border-primary shadow-lg">
          <CardHeader className="text-center">
            <UserPlus className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4 text-3xl font-headline">Welcome to NRS CertiTrack!</CardTitle>
            <CardDescription className="text-lg">
              Your login was successful, but your user profile hasn't been set up in the database yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
             <p className="text-muted-foreground">
              This can happen if the sign-up process was interrupted. Please contact a system administrator to have them assign you a role. Once your profile is created, you will be able to access the dashboard.
            </p>
            <Link href="/login">
                <Button variant="outline">Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card className="border-primary shadow-lg">
        <CardHeader className="text-center">
          <Rocket className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-3xl font-headline">Welcome to NRS CertiTrack!</CardTitle>
          <CardDescription className="text-lg">
            Your app is connected to Firebase, but your database is empty. Let's get you set up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <ListChecks className="h-6 w-6 text-accent" />
              Your Next Steps
            </h3>
            <p className="text-muted-foreground">
              The application requires at least one 'leader' user to function correctly. You can create your first user account through the sign-up page.
            </p>
            <div className="pt-4 text-center">
                <Link href="/signup">
                    <Button>Create First User Account</Button>
                </Link>
            </div>
            <p className="pt-4 text-muted-foreground">
              After creating your first user, you will need to manually promote them to a 'leader' in the Firestore database.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="flex items-center gap-2 font-bold">
              <Users className="h-5 w-5" />
              Promote User to Leader
            </h4>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Go to your Firestore Database in the Firebase Console.</li>
              <li>Open the <strong>users</strong> collection.</li>
              <li>Find the document for the user you just created.</li>
              <li>Edit the `role` field from `employee` to `leader`.</li>
              <li>Click <strong>Update</strong>.</li>
              <li>Once complete, refresh this page to access the dashboard.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
