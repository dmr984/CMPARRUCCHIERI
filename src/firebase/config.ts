import { FirebaseOptions } from 'firebase/app';

// This is a placeholder for the Firebase config.
// In a real application, you would replace this with your actual Firebase project configuration.
// IMPORTANT: Do not commit your real Firebase config to a public repository.
// Use environment variables to store your config securely.
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD7Cc33XfOyfXGUSysa8dHiKl_nOvb6yFc',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'studio-3870871470-6cb53.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-3870871470-6cb53',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'studio-3870871470-6cb53.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '612603739185',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:612603739185:web:598502f0047ff5a346a910',
};
