'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * This is a client-side component that listens for custom Firebase permission errors
 * and throws them to be caught by Next.js's error overlay in development.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: unknown) => {
      // We only want to surface our custom, contextual errors.
      if (FirestorePermissionError.isFirestorePermissionError(error)) {
        // Asynchronously throw the error to break out of the promise chain
        // and be caught by the development error overlay.
        setTimeout(() => {
          throw error;
        });
      }
    };

    const unsubscribe = errorEmitter.on('permission-error', handlePermissionError);

    // Clean up the subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
