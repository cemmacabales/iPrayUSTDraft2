import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/styles';

const { width, height } = Dimensions.get('window');

interface NavbarFeatureOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
  activeTab?: 'home' | 'prayers' | 'reminders' | 'account';
  visitedTabs?: string[];
}

const NavbarFeatureOverlay = ({ isVisible, onDismiss, activeTab = 'home', visitedTabs = [] }: NavbarFeatureOverlayProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isVisible) {
      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Start fade out exit animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleDismiss = () => {
    onDismiss();
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'home':
        return {
          title: 'Home',
          description: 'Your daily prayer hub with suggested prayers and spiritual insights.',
          icon: 'home',
          color: '#FFD700',
        };
      case 'prayers':
        return {
          title: 'Prayers',
          description: 'Access your personal library and explore UST\'s prayer collection.',
          icon: 'book',
          color: '#FF8C00',
        };
      case 'reminders':
        return {
          title: 'Reminders',
          description: 'Set up daily prayer reminders and stay connected to your routine.',
          icon: 'notifications',
          color: '#FF6B35',
        };
      case 'account':
        return {
          title: 'Account',
          description: 'Manage your profile, view statistics, and customize your experience.',
          icon: 'person',
          color: '#4A90E2',
        };
      default:
        return {
          title: 'Navigation',
          description: 'Double tap to show/hide the navigation bar.',
          icon: 'menu',
          color: '#FFD700',
        };
    }
  };

  const tabInfo = getTabDescription();

  // Calculate progress - start at 1 and count homepage as first tab, limit to 4
  const allTabs = ['home', 'prayers', 'reminders', 'account'];
  const progress = Math.min(4, Math.max(1, visitedTabs.length)); // Use visitedTabs.length directly since home is already included
  const totalTabs = allTabs.length;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: tabInfo.color }]}>
          <Ionicons name={tabInfo.icon as any} size={24} color={colors.white} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{tabInfo.title}</Text>
          <Text style={styles.description}>{tabInfo.description}</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {progress} of {totalTabs} tabs visited
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(progress / totalTabs) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 140,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.secondary[600],
    lineHeight: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 12,
    width: '100%',
  },
  progressText: {
    fontSize: 12,
    color: colors.secondary[600],
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.secondary[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
});

export default NavbarFeatureOverlay;
