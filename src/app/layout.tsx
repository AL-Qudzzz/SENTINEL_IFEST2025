
'use client';

import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/app-layout';
import './globals.css';
import { FirebaseClientProvider, useFirebase, initiateAnonymousSignIn } from '@/firebase';
import { useEffect } from 'react';

// This metadata is not used in the client-rendered layout,
// but it's good practice to keep it for potential static generation.
// export const metadata: Metadata = {
//   title: 'Sentinel: Intelligent Contract Lifecycle Management',
//   description: 'Proactively manage your contracts with AI-powered insights and automation.',
// };

function AuthGate({ children }: { children: React.ReactNode }) {
  const { auth, user, isUserLoading } = useFirebase();

  useEffect(() => {
    // If auth is ready, user is not loaded yet, and there's no user object,
    // initiate anonymous sign-in.
    if (auth && !isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

  // While checking user status, show a loader and do not render children.
  // This prevents child components from making unauthenticated Firestore requests.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Authenticating...</p>
      </div>
    );
  }

  // Once loading is complete and user status is known, render the children.
  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Sentinel: Intelligent Contract Lifecycle Management</title>
        <meta name="description" content="Proactively manage your contracts with AI-powered insights and automation." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
           <AuthGate>
             <AppLayout>{children}</AppLayout>
           </AuthGate>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
