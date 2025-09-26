
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/app-layout';
import './globals.css';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';


function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      // Don't redirect if we are already on a public auth page.
      if (pathname !== '/login' && pathname !== '/signup') {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, router, pathname]);

  // While checking user status, show a loader.
  // This prevents rendering the app layout for a moment before redirecting.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading Sentinel...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, or we are on a public auth page, show the children.
  if (user || pathname === '/login' || pathname === '/signup') {
     return <>{children}</>;
  }

  // If no user and not on a public page, we are about to redirect, so show a loader.
  return (
     <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Redirecting...</p>
        </div>
      </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

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
           <AuthGuard>
            {isAuthPage ? (
              children
            ) : (
              <AppLayout>{children}</AppLayout>
            )}
          </AuthGuard>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
