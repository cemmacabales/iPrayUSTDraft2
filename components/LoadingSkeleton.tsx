import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/styles';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonItem: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4, 
  style 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.primary[100],
          opacity,
        },
        style,
      ]}
    />
  );
};

interface PrayerCardSkeletonProps {
  style?: any;
}

export const PrayerCardSkeleton: React.FC<PrayerCardSkeletonProps> = ({ style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardHeader}>
      <SkeletonItem width={32} height={32} borderRadius={16} />
      <SkeletonItem width={40} height={20} borderRadius={10} />
    </View>
    <View style={styles.cardContent}>
      <SkeletonItem height={16} style={styles.titleSkeleton} />
      <SkeletonItem height={16} style={styles.titleSkeleton} />
      <SkeletonItem height={12} style={styles.descriptionSkeleton} />
      <SkeletonItem height={12} style={styles.descriptionSkeleton} />
      <SkeletonItem height={12} style={styles.descriptionSkeleton} />
    </View>
    <View style={styles.cardFooter}>
      <SkeletonItem width={80} height={12} />
    </View>
  </View>
);

export const LoadingSkeleton: React.FC = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <PrayerCardSkeleton key={item} style={styles.cardSpacing} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 160,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSpacing: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  descriptionSkeleton: {
    marginBottom: 4,
  },
  cardFooter: {
    marginTop: 12,
  },
});

export default LoadingSkeleton;
