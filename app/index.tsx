import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../constants/styles';
import { StorageUtils } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export default function IndexPage() {
  const { user, loading } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!loading) {
      checkOnboardingStatus();
    }
  }, [loading, user]);

  const checkOnboardingStatus = async () => {
    try {
      const isOnboardingCompleted = await StorageUtils.isOnboardingCompleted();
      
      if (!isOnboardingCompleted) {
        // User hasn't completed onboarding
        router.replace('/onboarding');
      } else if (!user) {
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
      setIsCheckingOnboarding(false);
    }
  };

  if (loading || isCheckingOnboarding) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
        <ActivityIndicator size="large" color={colors.yellow} />
      </View>
    );
  }

  return null;
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
