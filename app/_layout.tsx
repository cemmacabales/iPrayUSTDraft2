import { Stack, usePathname } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/styles';
import { AuthProvider } from '../contexts/AuthContext';
import { PrayerProvider } from '../contexts/PrayerContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';
  const isAuth = pathname === '/login' || pathname === '/signup';
  const isMain = pathname === '/main';

  useEffect(() => {
    if (fontsLoaded) {
      // Fonts are loaded
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <PrayerProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <View style={styles.content}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
              <Stack.Screen name="main" />
              <Stack.Screen name="prayer-detail" />
            </Stack>
          </View>
        </View>
      </PrayerProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
});
