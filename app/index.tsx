import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../constants/styles';
import { StorageUtils } from '../utils/storage';

export default function IndexPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const isOnboardingCompleted = await StorageUtils.isOnboardingCompleted();
      const isUserLoggedIn = await StorageUtils.isUserLoggedIn();
      
      if (!isOnboardingCompleted) {
        // User hasn't completed onboarding
        router.replace('/onboarding');
      } else if (!isUserLoggedIn) {
        // User completed onboarding but not logged in
        router.replace('/login');
      } else {
        // User completed onboarding and is logged in
        router.replace('/main');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding if there's an error
      router.replace('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Loading...</Text>
      <ActivityIndicator size="large" color={colors.yellow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.secondary[600],
    marginBottom: 20,
  },
});
