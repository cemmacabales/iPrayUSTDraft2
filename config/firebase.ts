import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration for UST Prayer Library
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
apiKey: "AIzaSyCJ_mI74aKePbU4EIwLQ71RSjyd_PswG0Y",
  authDomain: "iprayust.firebaseapp.com",
  projectId: "iprayust",
  storageBucket: "iprayust.firebasestorage.app",
  messagingSenderId: "621299528420",
  appId: "1:621299528420:web:849b274eea4ca211a432f1",
  measurementId: "G-E9JB73KM1N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Initialize Analytics (optional, for web only)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error);
  }
}
export { analytics };

// Initialize Messaging for push notifications (optional)
let messaging = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Messaging not available:', error);
  }
}
export { messaging };

// Development environment emulator connections
// Uncomment these lines if you want to use Firebase emulators for development
/*
if (__DEV__ && !auth._delegate._config.emulator) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}
*/

// Firebase Collections Structure for UST Prayer Library:
// 
// Collections:
// - users: User profiles and preferences
// - prayerCategories: Prayer categories with metadata
// - prayers: Individual prayers with content
// - userStats: User prayer statistics and counts
// - userRecent: User's recent prayer history
// - versesOfTheDay: Daily verses with dates
// - notifications: Push notification logs (optional)
// - analytics: Custom analytics data (optional)
//
// Security Rules Required:
// - Users can only read/write their own user documents
// - Prayer categories and prayers are read-only for all authenticated users
// - User stats and recent prayers are private to each user
// - Verses of the day are read-only for all users

export default app;

// Export configuration for reference
export { firebaseConfig };