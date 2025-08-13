import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/styles';
import NavButtonOverlay from './NavButtonOverlay';
import NavbarFeatureOverlay from './NavbarFeatureOverlay';
import { StorageUtils } from '../utils/storage';

const { width, height } = Dimensions.get('window');

type TabType = 'home' | 'prayers' | 'reminders' | 'account';

interface NavbarProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
  showOverlayInstruction?: boolean;
  onOverlayDismiss?: () => void;
  showFeatureOverlay?: boolean;
  onFeatureOverlayDismiss?: () => void;
  onShowFeatureOverlay?: () => void;
  onTutorialComplete?: () => void;
  visitedTabs?: string[];
}

const Navbar = ({ activeTab, onTabPress, showOverlayInstruction = false, onOverlayDismiss, showFeatureOverlay = false, onFeatureOverlayDismiss, onShowFeatureOverlay, onTutorialComplete, visitedTabs = [] }: NavbarProps) => {
  const [isVisible, setIsVisible] = useState(false); // Start hidden after onboarding
  const [showOverlay, setShowOverlay] = useState(showOverlayInstruction);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translateY = useRef(new Animated.Value(150)).current; // Start translated down
  

  
  // Update overlay state when prop changes
  useEffect(() => {
    setShowOverlay(showOverlayInstruction);
  }, [showOverlayInstruction]);

  // Clear hide timeout when feature overlay is visible
  useEffect(() => {
    if (showFeatureOverlay && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, [showFeatureOverlay]);
  
  // Double tap tracking for navbar show/hide
  const lastNavbarTapRef = useRef<number>(0);
  const doubleTapDelay = 300; // milliseconds

  const tabs = [
    {
      name: 'Home',
      icon: 'home-outline' as const,
      activeIcon: 'home' as const,
      tab: 'home' as TabType,
    },
    {
      name: 'Prayers',
      icon: 'book-outline' as const,
      activeIcon: 'book' as const,
      tab: 'prayers' as TabType,
    },
    {
      name: 'Reminders',
      icon: 'notifications-outline' as const,
      activeIcon: 'notifications' as const,
      tab: 'reminders' as TabType,
    },
    {
      name: 'Account',
      icon: 'person-outline' as const,
      activeIcon: 'person' as const,
      tab: 'account' as TabType,
    },
  ];

  const animatedValues = useRef(tabs.map(() => new Animated.Value(0))).current;
  const pulseAnimations = useRef(tabs.map(() => new Animated.Value(1))).current;
  const iconScaleAnims = useRef(tabs.map(() => new Animated.Value(1))).current;
  
  // Animation for floating trigger button
  const floatingTriggerScale = useRef(new Animated.Value(1)).current;
  const floatingTriggerOpacity = useRef(new Animated.Value(0)).current;

  // Auto-hide functionality
  const showNavbar = () => {
    setIsVisible(true);
    
    // Hide floating trigger button with animation
    Animated.parallel([
      Animated.timing(floatingTriggerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(floatingTriggerScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Set new timeout to hide after 1.5 seconds, but only if feature overlay is not visible
    if (!showFeatureOverlay) {
      hideTimeoutRef.current = setTimeout(() => {
        hideNavbar();
      }, 1500);
    }
  };

  const hideNavbar = () => {
    setIsVisible(false);
    
    // Run navbar hide and floating trigger show animations in parallel
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 150,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.sequence([
        Animated.timing(floatingTriggerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(floatingTriggerScale, {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]),
    ]).start(() => {
      Animated.spring(floatingTriggerScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
  };

  // Start with floating trigger button visible
  useEffect(() => {
    // Animate floating trigger button entrance
    Animated.sequence([
      Animated.timing(floatingTriggerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(floatingTriggerScale, {
        toValue: 1.05,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start(() => {
      Animated.spring(floatingTriggerScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
    
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const isActive = (tab: TabType) => {
    return activeTab === tab;
  };

  // Animate active tab on mount and route change
  useEffect(() => {
    const animations = tabs.map((tab, index) => {
      const active = isActive(tab.tab);
      return Animated.spring(animatedValues[index], {
        toValue: active ? 1 : 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      });
    });

    Animated.parallel(animations).start();

    // Start pulse animation for active tab
    const activeIndex = tabs.findIndex(tab => isActive(tab.tab));
    if (activeIndex !== -1) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimations[activeIndex], {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnimations[activeIndex], {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      pulseAnimation.start();
    }
  }, [activeTab]);

  const handleTabPress = (tab: TabType, index: number) => {
    // Show navbar when tab is pressed
    showNavbar();

    // New icon animation - bounce and glow effect
    Animated.sequence([
      Animated.parallel([
        Animated.timing(iconScaleAnims[index], {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValues[index], {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.spring(iconScaleAnims[index], {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
        Animated.spring(animatedValues[index], {
          toValue: 1,
          useNativeDriver: false,
          tension: 200,
          friction: 5,
        }),
      ]),
    ]).start();

    onTabPress(tab);
  };

  const handleTouchAreaPress = () => {
    const now = Date.now();
    const lastTap = lastNavbarTapRef.current;
    
    // Check if this is a double tap
    if (now - lastTap < doubleTapDelay) {
      // Double tap detected - show navbar
      showNavbar();
      lastNavbarTapRef.current = 0; // Reset after successful double tap
    } else {
      // First tap - just store timestamp
      lastNavbarTapRef.current = now;
    }
  };

  const handleSwipeAreaPress = () => {
    const now = Date.now();
    const lastTap = lastNavbarTapRef.current;
    
    // Check if this is a double tap
    if (now - lastTap < doubleTapDelay) {
      // Double tap detected - toggle navbar visibility
      if (isVisible) {
        hideNavbar();
      } else {
        showNavbar();
      }
      lastNavbarTapRef.current = 0; // Reset after successful double tap
    } else {
      // First tap - just store timestamp
      lastNavbarTapRef.current = now;
    }
  };

  // Add a small invisible trigger area at the bottom center
  const handleBottomTriggerPress = () => {
    const now = Date.now();
    const lastTap = lastNavbarTapRef.current;
    
    // Check if this is a double tap
    if (now - lastTap < doubleTapDelay) {
      // Double tap detected - toggle navbar visibility and dismiss overlay
      if (isVisible) {
        hideNavbar();
      } else {
        showNavbar();
      }
      // Dismiss overlay when double tap is detected
      if (showOverlay) {
        handleOverlayDismiss();
      }
      lastNavbarTapRef.current = 0; // Reset after successful double tap
    } else {
      // First tap - just store timestamp
      lastNavbarTapRef.current = now;
    }
  };

  // Animated trigger press handler for floating button
  const handleFloatingTriggerPress = () => {
    const now = Date.now();
    const lastTap = lastNavbarTapRef.current;
    
    // Check if this is a double tap
    if (now - lastTap < doubleTapDelay) {
      // Double tap detected - toggle navbar visibility and dismiss overlay
      if (isVisible) {
        hideNavbar();
      } else {
        showNavbar();
      }
      // Dismiss overlay when double tap is detected
      if (showOverlay) {
        handleOverlayDismiss();
      }
      lastNavbarTapRef.current = 0; // Reset after successful double tap
    } else {
      // First tap - just store timestamp and animate button
      lastNavbarTapRef.current = now;
      
      // Animate the floating trigger button when pressed
      Animated.sequence([
        Animated.timing(floatingTriggerScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(floatingTriggerScale, {
          toValue: 1.05,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
        Animated.spring(floatingTriggerScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      // Don't show navbar or feature overlay on first tap - wait for double tap
    }
  };

  const handleOverlayDismiss = async () => {
    setShowOverlay(false);
    // Call parent callback to mark instruction as seen
    onOverlayDismiss?.();
    
    // Show feature overlay after nav button overlay is dismissed
    if (onShowFeatureOverlay) {
      onShowFeatureOverlay();
    }
  };

  const handleFeatureOverlayDismiss = () => {
    onFeatureOverlayDismiss?.();
    
    // Keep navbar visible for a moment after dismissing feature overlay
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Set a new timeout to hide navbar after feature overlay is dismissed
    hideTimeoutRef.current = setTimeout(() => {
      hideNavbar();
    }, 2000); // Give user 2 seconds to interact with navbar
  };

  const handleTutorialComplete = () => {
    console.log('Navbar handleTutorialComplete called');
    // Hide navbar when tutorial is complete
    hideNavbar();
    
    // Call parent callback
    onTutorialComplete?.();
  };

  return (
    <>
      {/* Small bottom trigger area - only at the very bottom center */}
      <TouchableWithoutFeedback onPress={handleBottomTriggerPress}>
        <View style={styles.bottomTrigger} />
      </TouchableWithoutFeedback>
      
      {/* Floating trigger button - visible when navbar is hidden or any overlay is visible */}
      {(!isVisible || showOverlay || showFeatureOverlay) && (
        <Animated.View
          style={[
            styles.floatingTrigger,
            {
              opacity: floatingTriggerOpacity,
              transform: [
                { scale: floatingTriggerScale },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleFloatingTriggerPress}
            style={styles.floatingTriggerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Overlay instruction */}
      <NavButtonOverlay 
        isVisible={showOverlay} 
        onDismiss={handleOverlayDismiss} 
      />
      
      {/* Feature overlay */}
      <NavbarFeatureOverlay 
        isVisible={showFeatureOverlay} 
        onDismiss={handleFeatureOverlayDismiss}
        activeTab={activeTab}
        visitedTabs={visitedTabs}
      />

      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.navbar}>
          {tabs.map((tab, index) => {
            const active = isActive(tab.tab);
            
            const scale = Animated.multiply(
              animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
              pulseAnimations[index]
            );

            const translateY = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0, -6],
            });

            const backgroundColor = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255, 215, 0, 0)', 'rgba(255, 215, 0, 0.15)'],
            });

            const iconColor = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['#6B7280', '#FFD700'],
            });

            const textColor = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: ['#6B7280', '#FFD700'],
            });

            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabContainer}
                onPress={() => handleTabPress(tab.tab, index)}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.tabBackground,
                    {
                      backgroundColor,
                      transform: [{ scale }, { translateY }],
                    },
                  ]}
                />
                <Animated.View style={[styles.tab, { transform: [{ translateY }] }]}>
                  <Animated.View 
                    style={[
                      styles.iconContainer,
                      {
                        transform: [{ scale: iconScaleAnims[index] }],
                      },
                    ]}
                  >
                    <Ionicons
                      name={active ? tab.activeIcon : tab.icon}
                      size={20}
                      color={active ? '#FFD700' : '#6B7280'}
                    />
                  </Animated.View>
                  <Animated.Text
                    style={[
                      styles.tabText,
                      {
                        color: textColor,
                        fontWeight: active ? '600' : '500',
                      },
                    ]}
                  >
                    {tab.name}
                  </Animated.Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  bottomTrigger: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 60,
    height: 40,
    marginLeft: -30, // Center the trigger
    zIndex: 1,
  },
  floatingTrigger: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    zIndex: 1001,
  },
  floatingTriggerButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingBottom: 18,
    paddingTop: 12,
    paddingHorizontal: 16,
    zIndex: 3,
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 3,
  },
  tabBackground: {
    position: 'absolute',
    top: 0,
    left: 6,
    right: 6,
    bottom: 0,
    borderRadius: 14,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
});

export default Navbar;
