import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { UserSessionProvider } from '@/contexts/user-session-context';

export const metadata: Metadata = {
  title: 'NRS CertiTrack',
  description: 'Digital Signature Certificate (DSC) Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <UserSessionProvider>
            {children}
          </UserSessionProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
