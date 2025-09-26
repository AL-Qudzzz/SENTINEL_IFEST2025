'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider, useFirebase, initiateAnonymousSignIn } from '@/firebase';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

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


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthGate>
        {children}
      </AuthGate>
    </FirebaseProvider>
  );
}
