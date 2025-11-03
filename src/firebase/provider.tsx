'use client';
import {
  FirebaseApp,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import { firebaseConfig } from './config';
import { FirebaseClientProvider } from './client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

type FirebaseContextValue = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  isConfigured: boolean;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

const isFirebaseConfigured = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'INSERISCI_LA_TUA_API_KEY' &&
    firebaseConfig.projectId
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
    
  const value = useMemo(() => {
    if (!isFirebaseConfigured) {
        return { app: null, auth: null, db: null, isConfigured: false };
    }

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db, isConfigured: true };
  }, []);

  return (
    <FirebaseContext.Provider value={value as FirebaseContextValue}>
      <FirebaseClientProvider>
        {children}
        <FirebaseErrorListener />
      </FirebaseClientProvider>
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
