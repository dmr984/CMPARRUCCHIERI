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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  isConfigured: boolean;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

// Check if the firebase config is valid
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

  if (!value.isConfigured) {
    return (
        <div className='min-h-screen flex flex-col'>
            <div className='p-4 md:p-8'>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configurazione di Firebase Mancante</AlertTitle>
                    <AlertDescription>
                        <p>Le credenziali di Firebase non sono state configurate correttamente.</p>
                        <p className='mt-2'>Copia le credenziali dal tuo progetto Firebase nel file <strong>.env.local</strong> e riavvia il server di sviluppo.</p>
                    </AlertDescription>
                </Alert>
            </div>
            <div className='flex-grow bg-muted/40'>{children}</div>
        </div>
    )
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
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
