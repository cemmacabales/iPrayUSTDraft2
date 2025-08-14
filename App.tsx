import 'react-native-url-polyfill/auto';
import { Slot } from 'expo-router';
import { AuthProvider } from './contexts/AuthContext';
import { PrayerProvider } from './contexts/PrayerContext';

export default function App() {
  return (
    <AuthProvider>
      <PrayerProvider>
        <Slot />
      </PrayerProvider>
    </AuthProvider>
  );
}
