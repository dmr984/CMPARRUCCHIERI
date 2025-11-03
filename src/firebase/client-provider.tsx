'use client';
import { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Check if the firebase config is valid
const isFirebaseConfigured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'INSERISCI_LA_TUA_API_KEY' &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  if (!isFirebaseConfigured) {
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

  return <>{children}</>;
}
