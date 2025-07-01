import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, ListChecks, Users, KeyRound } from 'lucide-react';

export default function SetupGuide() {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      <Card className="border-primary shadow-lg">
        <CardHeader className="text-center">
          <Rocket className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-3xl font-headline">Welcome to CertiTrack!</CardTitle>
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
              You need to create two collections in your Firestore database: `users` and `dscs`. Follow the steps below in your Firebase Console.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="flex items-center gap-2 font-bold">
                <Users className="h-5 w-5" />
                Step 1: Create 'users' Collection
              </h4>
              <ol className="list-inside list-decimal space-y-2 text-sm">
                <li>Go to your Firestore Database in the Firebase Console.</li>
                <li>Click <strong>+ Start collection</strong>.</li>
                <li>For Collection ID, enter: <strong>users</strong></li>
                <li>Click <strong>Auto-ID</strong> for the Document ID.</li>
                <li>Add these fields:
                  <ul className="ml-4 mt-2 list-disc space-y-1">
                    <li>`name` (string): `Sample Leader`</li>
                    <li>`role` (string): `leader`</li>
                    <li>`hasDsc` (boolean): `false`</li>
                  </ul>
                </li>
                <li>Click <strong>Save</strong>. You've added your first user!</li>
              </ol>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="flex items-center gap-2 font-bold">
                <KeyRound className="h-5 w-5" />
                Step 2: Create 'dscs' Collection
              </h4>
              <ol className="list-inside list-decimal space-y-2 text-sm">
                <li>Click <strong>+ Start collection</strong> again.</li>
                <li>For Collection ID, enter: <strong>dscs</strong></li>
                <li>Click <strong>Auto-ID</strong> for the Document ID.</li>
                <li>Add these fields:
                  <ul className="ml-4 mt-2 list-disc space-y-1">
                    <li>`serialNumber` (string): `SN0001`</li>
                    <li>`description` (string): `Initial Sample DSC`</li>
                    <li>`status` (string): `storage`</li>
                    <li>`expiryDate` (timestamp): Set to a future date.</li>
                    <li>`currentHolderId` (string): `null` (leave value blank)</li>
                    <li>`location` (map): Add two fields inside:
                        <ul className="ml-4 list-disc">
                            <li>`mainBox` (number): `1`</li>
                            <li>`subBox` (string): `a`</li>
                        </ul>
                    </li>
                  </ul>
                </li>
                <li>Click <strong>Save</strong>.</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="font-semibold">Once you've added one document to each collection, refresh this page.</p>
            <p className="text-sm text-muted-foreground">The app will then display the main dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
