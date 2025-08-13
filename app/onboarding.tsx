import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/styles';
import { StorageUtils } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const onboardingData = [
    {
      id: 1,
      title: 'Welcome to iPrayUST',
      subtitle: 'Your Digital Prayer Companion',
      description: 'Discover a collection of beautiful prayers and spiritual guidance designed specifically for UST students.',
      icon: 'heart-circle',
      color: '#FFD700',
      image: require('../assets/tiger.png'),
    },
    {
      id: 2,
      title: 'Daily Prayer Reminders',
      subtitle: 'Stay Connected to Your Faith',
      description: 'Set personalized prayer reminders that fit your busy student schedule. Never miss your daily moments of reflection and spiritual connection.',
      icon: 'notifications',
      color: '#FF8C00',
      image: require('../assets/tiger.png'),
    },
    {
      id: 3,
      title: 'Prayer Collections',
      subtitle: 'Curated for Thomasians',
      description: 'Access a rich library of prayers including morning prayers, exam prayers, thanksgiving prayers, and special UST traditions.',
      icon: 'library',
      color: '#FF6B35',
      image: require('../assets/tiger.png'),
    },
    {
      id: 4,
      title: 'Track Your Journey',
      subtitle: 'Grow Spiritually Every Day',
      description: 'Monitor your prayer habits, set spiritual goals, and celebrate your growth as you deepen your relationship with God.',
      icon: 'analytics',
      color: '#FFD700',
      image: require('../assets/tiger.png'),
    },
  ];

  useEffect(() => {
    // Animate content entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    console.log('Current page:', currentPage);
    console.log('Current data:', onboardingData[currentPage]);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      // Animate page transition
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);

      // Scroll to next page
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });
    }
  };

  const handleSkip = async () => {
    await StorageUtils.markOnboardingCompleted();
    // Reset navigation instruction so it shows after onboarding
    await StorageUtils.resetNavInstruction();
    // Reset feature overlay so it shows after login
    await StorageUtils.resetFeatureOverlay();
    // Reset visited tabs so feature overlay shows for each tab
    await StorageUtils.resetVisitedTabs();
    // Don't mark user as logged in for guest mode
    router.replace('/main');
  };

  const handleGetStarted = async () => {
    await StorageUtils.markOnboardingCompleted();
    // Reset navigation instruction so it shows after onboarding
    await StorageUtils.resetNavInstruction();
    // Reset feature overlay so it shows after login
    await StorageUtils.resetFeatureOverlay();
    // Reset visited tabs so feature overlay shows for each tab
    await StorageUtils.resetVisitedTabs();
    router.replace('/login');
  };

  const currentData = onboardingData[currentPage];

  return (
    <View style={styles.container}>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={[styles.page, { width }]}>
          <View style={styles.pageContent}>
            <View style={styles.iconContainer}>
              <View
                style={[styles.iconGradient, { backgroundColor: currentData.color }]}
              >
                <Ionicons name={currentData.icon as any} size={48} color={colors.white} />
              </View>
            </View>
            
            <Text style={styles.title}>{currentData.title}</Text>
            <Text style={styles.subtitle}>{currentData.subtitle}</Text>
            <Text style={styles.description}>{currentData.description}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Page Indicators */}
        <View style={styles.indicators}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPage && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {currentPage < onboardingData.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleGetStarted} style={styles.getStartedButton}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
              <Ionicons name="rocket" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  pageContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.secondary[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary[300],
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.yellow,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: colors.secondary[500],
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellow,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellow,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
});

export default OnboardingScreen;
