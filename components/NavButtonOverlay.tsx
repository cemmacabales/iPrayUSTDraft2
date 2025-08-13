import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/styles';

const { width, height } = Dimensions.get('window');

interface NavButtonOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const NavButtonOverlay = ({ isVisible, onDismiss }: NavButtonOverlayProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);

  useEffect(() => {
    if (isVisible) {
      // Start entrance animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // Start exit animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      // Double tap detected
      onDismiss();
      lastTap.current = 0; // Reset to prevent multiple triggers
    } else {
      lastTap.current = now;
    }
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <TouchableOpacity 
          style={styles.instructionContainer}
          onPress={handleDoubleTap}
          activeOpacity={0.8}
        >
          <Text style={styles.instructionText}>Double Tap to Show Navigation Bar</Text>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={16} color={colors.yellow} />
          </View>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  blurContainer: {
    flex: 1,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 25,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
    marginRight: 4,
  },
  arrowContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NavButtonOverlay;
