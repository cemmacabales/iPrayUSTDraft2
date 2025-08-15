import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


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

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize other Firebase services
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

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
// Example Prayer Document Structure:
// {
//   id: string,
//   title: string,
//   content: string,
//   category: string,
//   tags: string[],
//   image?: string,  // Optional image URL for CMS management
//   createdAt: Timestamp,
//   updatedAt: Timestamp
// }

export default app;

export { firebaseConfig };