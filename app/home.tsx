import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { VERSE_OF_THE_DAY } from '../constants/prayers';
import { colors, commonStyles } from '../constants/styles';
import { getPrayerOfTheDay, getPrayerSubtitle, getPrayerIcon, getTimeContext, getAllPrayers } from '../utils/prayerUtils';
import { StorageUtils } from '../utils/storage';
import { Prayer } from '../types';

const { width } = Dimensions.get('window');

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prayerOfTheDay, setPrayerOfTheDay] = useState(() => getPrayerOfTheDay());
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recentPrayers, setRecentPrayers] = useState<string[]>([]);
  const [prayerStats, setPrayerStats] = useState<Record<string, number>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const slideAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(20))).current;
  
  // Prayer journey animations
  const journeyFadeAnim = useRef(new Animated.Value(0)).current;
  const journeyScaleAnim = useRef(new Animated.Value(0.8)).current;
  const streakScaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const remindersFadeAnim = useRef(new Animated.Value(0)).current;

  const getSuggestedPrayers = () => {
    const context = getTimeContext();
    const allPrayers = getAllPrayers();
    
    // Time-based suggestions using actual prayer data
    if (context.isMorning) {
      const morningPrayers = allPrayers.filter(prayer => 
        prayer.id === 'before-study' || 
        prayer.id === 'guardian-angel' ||
        prayer.id === 'angelus' ||
        prayer.id === 'st-joseph'
      );
      
      return morningPrayers.slice(0, 4).map(prayer => ({
        id: prayer.id,
        title: prayer.title,
        subtitle: prayer.description || getPrayerSubtitle(prayer, 'Perfect for starting your day'),
        icon: getPrayerIcon(prayer),
        image: getPrayerImage(prayer),
        onPress: () => router.push('/main?tab=prayers&prayerId=' + prayer.id),
      }));
    }
    
    if (context.isEvening) {
      const eveningPrayers = allPrayers.filter(prayer => 
        prayer.id === 'angelus' || 
        prayer.id === 'guardian-angel' ||
        prayer.id === 'act-contrition' ||
        prayer.id === 'st-michael'
      );
      
      return eveningPrayers.slice(0, 4).map(prayer => ({
        id: prayer.id,
        title: prayer.title,
        subtitle: prayer.description || getPrayerSubtitle(prayer, 'Perfect for ending your day'),
        icon: getPrayerIcon(prayer),
        image: getPrayerImage(prayer),
        onPress: () => router.push('/main?tab=prayers&prayerId=' + prayer.id),
      }));
    }
    
    // Default suggestions - use popular prayers or rotate through categories
    const defaultPrayers = allPrayers.filter(prayer => 
      prayer.id === 'angelus' ||
      prayer.id === 'before-study' ||
      prayer.id === 'guardian-angel' ||
      prayer.id === 'sacred-heart'
    );
    
    return defaultPrayers.slice(0, 4).map(prayer => ({
      id: prayer.id,
      title: prayer.title,
      subtitle: prayer.description || getPrayerSubtitle(prayer, 'A prayer for your spiritual journey'),
      icon: getPrayerIcon(prayer),
      image: getPrayerImage(prayer),
      onPress: () => router.push('/main?tab=prayers&prayerId=' + prayer.id),
    }));
  };

  // Helper function to get appropriate image for each prayer
  const getPrayerImage = (prayer: Prayer): string => {
    // Use consistent, themed images based on prayer category
    const imageMap: Record<string, string> = {
      'angelus': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop&crop=center',
      'before-study': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
      'guardian-angel': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center',
      'st-joseph': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=400&fit=crop&crop=center',
      'sacred-heart': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop&crop=center',
      'st-michael': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
      'act-contrition': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center',
      'immaculate-heart': 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=400&fit=crop&crop=center',
      'rosary-intro': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=400&fit=crop&crop=center',
      'before-exams': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
      'dominican-blessing': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop&crop=center',
    };
    
    return imageMap[prayer.id] || imageMap['angelus']; // Default fallback
  };

  const suggestedPrayers = getSuggestedPrayers();

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const [bookmarksData, recentData, statsData] = await Promise.all([
      StorageUtils.getBookmarks(),
      StorageUtils.getRecentPrayers(),
      StorageUtils.getPrayerStats(),
    ]);
    setBookmarks(bookmarksData);
    setRecentPrayers(recentData);
    setPrayerStats(statsData);
  };

  // Staggered animations on mount
  useEffect(() => {
    const animations = fadeAnims.map((anim, index) => 
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(150, animations).start();

    // Prayer journey animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(journeyFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(journeyScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(streakScaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(progressBarAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(remindersFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh prayer of the day every hour
  useEffect(() => {
    const interval = setInterval(() => {
      setPrayerOfTheDay(getPrayerOfTheDay());
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const cardWidth = 224 + 16;
    const newIndex = Math.round(contentOffset / cardWidth);
    setCurrentIndex(newIndex);
  };

  const scrollToCard = (index: number) => {
    const cardWidth = 224 + 16;
    scrollViewRef.current?.scrollTo({
      x: index * cardWidth,
      animated: true,
    });
  };

  return (
    <ScrollView style={[commonStyles.scrollView, styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/tiger.png')} style={styles.logoImage} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.appTitle}>
              iPrayUST
            </Text>
            <Text style={styles.appSubtitle}>
              Your Digital Prayer Companion
            </Text>
          </View>
        </View>
      </View>



      {/* Goal Chart & Reminders Summary */}
      <View style={commonStyles.section}>
        <Animated.View
          style={[
            styles.goalsCard,
            {
              opacity: journeyFadeAnim,
              transform: [{ scale: journeyScaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.goalsCardGradient}
          >
          <View style={styles.goalsHeader}>
            <Text style={styles.goalsTitle}>
              Your Prayer Journey
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/reminders')}
              style={styles.remindersButton}
            >
              <Ionicons name="notifications" size={16} color={colors.white} />
              <Text style={styles.remindersButtonText}>Reminders</Text>
            </TouchableOpacity>
          </View>
          
          {/* Goal Chart */}
          <View style={styles.goalChart}>
            <Animated.View 
              style={[
                styles.streakContainer,
                {
                  transform: [{ scale: streakScaleAnim }],
                },
              ]}
            >
              <View style={styles.streakCircle}>
                <Text style={styles.streakNumber}>7</Text>
                <Text style={styles.streakLabel}>Days</Text>
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakTitle}>Prayer Streak</Text>
                <Text style={styles.streakSubtitle}>Keep it going! 🔥</Text>
              </View>
            </Animated.View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>This Week</Text>
                <Text style={styles.progressValue}>5/7 days</Text>
              </View>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: progressBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '71%'],
                      }),
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          {/* Reminders Summary */}
          <Animated.View 
            style={[
              styles.remindersSummary,
              {
                opacity: remindersFadeAnim,
              },
            ]}
          >
            <View style={styles.remindersHeader}>
              <Ionicons name="time" size={16} color={colors.white} />
              <Text style={styles.remindersTitle}>Daily Reminders</Text>
            </View>
            <View style={styles.reminderItems}>
              <View style={styles.reminderItem}>
                <View style={styles.reminderDot} />
                <Text style={styles.reminderText}>Morning Prayer - 8:00 AM</Text>
                <View style={styles.reminderStatus}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
              </View>
              <View style={styles.reminderItem}>
                <View style={styles.reminderDot} />
                <Text style={styles.reminderText}>Evening Prayer - 8:00 PM</Text>
                <View style={styles.reminderStatus}>
                  <Ionicons name="time" size={16} color={colors.white} />
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/reminders')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All Reminders</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Suggested Prayers */}
      <View style={styles.cardsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Suggested Prayers for Today
          </Text>
          <View style={styles.indicators}>
            {suggestedPrayers.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToCard(index)}
                style={[
                  styles.indicator,
                  index === currentIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          decelerationRate={0.6}
          snapToInterval={224 + 16}
          snapToAlignment="start"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {suggestedPrayers.map((prayer, index) => (
            <Animated.View
              key={prayer.id}
              style={[
                styles.cardWrapper,
                {
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={prayer.onPress}
                style={styles.card}
                activeOpacity={0.9}
              >
                <View style={styles.cardImageContainer}>
                  <Image 
                    source={{ uri: prayer.image }} 
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cardOverlay} />
                  <View style={styles.cardContent}>
                    <View style={[styles.cardIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                      <Ionicons name={prayer.icon as any} size={32} color={colors.white} />
                    </View>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardCategory}>
                        Daily Prayer
                      </Text>
                      <Text style={styles.cardTitle}>
                        {prayer.title}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {prayer.subtitle}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* My Prayers Section */}
      {(bookmarks.length > 0 || recentPrayers.length > 0) && (
        <View style={commonStyles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              My Prayers
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/main')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.myPrayersContainer}
          >
            {/* Recent Prayers */}
            {recentPrayers.slice(0, 3).map((prayerId, index) => {
              const allPrayers = getAllPrayers();
              const prayer = allPrayers.find(p => p.id === prayerId);
              if (!prayer) return null;
              
              return (
                <TouchableOpacity
                  key={`recent-${prayerId}`}
                  onPress={() => router.push('/main?tab=prayers&prayerId=' + prayerId)}
                  style={styles.myPrayerCard}
                >
                  <View style={styles.myPrayerIcon}>
                    <Ionicons name="time" size={16} color={colors.primary[600]} />
                  </View>
                  <Text style={styles.myPrayerTitle}>
                    {prayer.title}
                  </Text>
                  <Text style={styles.myPrayerSubtitle}>
                    Recently viewed
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Bookmarked Prayers */}
            {bookmarks.slice(0, 3).map((prayerId, index) => {
              const allPrayers = getAllPrayers();
              const prayer = allPrayers.find(p => p.id === prayerId);
              if (!prayer) return null;
              
              return (
                <TouchableOpacity
                  key={`bookmark-${prayerId}`}
                  onPress={() => router.push('/main?tab=prayers&prayerId=' + prayerId)}
                  style={styles.myPrayerCard}
                >
                  <View style={styles.myPrayerIcon}>
                    <Ionicons name="bookmark" size={16} color={colors.yellow} />
                  </View>
                  <Text style={styles.myPrayerTitle}>
                    {prayer.title}
                  </Text>
                  <Text style={styles.myPrayerSubtitle}>
                    Bookmarked
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Featured Prayer */}
      <View style={commonStyles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>
              Prayer of the Day
            </Text>
            <TouchableOpacity
              onPress={() => setPrayerOfTheDay(getPrayerOfTheDay())}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={16} color={colors.yellow} />
            </TouchableOpacity>
          </View>
          <View style={styles.prayerReason}>
            <Ionicons name={getPrayerIcon(prayerOfTheDay.prayer) as any} size={16} color={colors.yellow} />
            <Text style={styles.prayerReasonText}>
              {prayerOfTheDay.reason}
            </Text>
          </View>
          <View style={styles.timeContext}>
            <Text style={styles.timeContextText}>
              {getTimeContext().isMorning ? '🌅 Morning' : 
               getTimeContext().isAfternoon ? '☀️ Afternoon' : '🌙 Evening'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/main?tab=prayers&prayerId=' + prayerOfTheDay.prayer.id)}
          style={styles.featuredPrayerCard}
        >
          <View style={styles.featuredPrayerHeader}>
            <View style={styles.featuredPrayerIcon}>
              <Ionicons name={getPrayerIcon(prayerOfTheDay.prayer) as any} size={24} color={colors.black} />
            </View>
            <Text style={styles.featuredPrayerTitle}>
              {prayerOfTheDay.prayer.title}
            </Text>
          </View>
          <Text style={styles.featuredPrayerDescription}>
            {getPrayerSubtitle(prayerOfTheDay.prayer, prayerOfTheDay.reason)}
          </Text>
          <View style={styles.featuredPrayerFooter}>
            <Text style={styles.featuredPrayerReadNow}>
              Read Now
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.black} style={styles.featuredPrayerArrow} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            "Pray without ceasing" — 1 Thessalonians 5:17
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  appSubtitle: {
    color: colors.black,
    fontSize: 14,
    opacity: 0.8,
  },

  cardsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary[300],
  },
  activeIndicator: {
    backgroundColor: colors.yellow,
    width: 24,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    paddingRight: 48,
    gap: 16,
  },
  cardWrapper: {
    width: 224, // w-56 = 14rem = 224px
  },
  card: {
    height: 320, // h-80 = 20rem = 320px
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardImageContainer: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    lineHeight: 28,
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  featuredPrayerCard: {
    backgroundColor: colors.yellow,
    borderRadius: 12,
    padding: 24,
  },
  featuredPrayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredPrayerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featuredPrayerTitle: {
    color: colors.black,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  featuredPrayerDescription: {
    color: colors.black,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuredPrayerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredPrayerReadNow: {
    color: colors.black,
    fontWeight: '600',
  },
  featuredPrayerArrow: {
    marginLeft: 8,
  },
  prayerReason: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  prayerReasonText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  timeContext: {
    marginTop: 8,
  },
  timeContextText: {
    color: colors.secondary[600],
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  footerCard: {
    backgroundColor: colors.secondary[100],
    borderRadius: 12,
    padding: 16,
  },
  footerText: {
    color: colors.black,
    textAlign: 'center',
    fontSize: 14,
  },
  goalsCard: {
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  goalsCardGradient: {
    borderRadius: 16,
    padding: 24,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  goalsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  remindersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  remindersButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  goalChart: {
    marginBottom: 24,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.white,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 12,
    color: colors.white,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.secondary[300],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.yellow,
    borderRadius: 4,
  },
  remindersSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  reminderItems: {
    marginBottom: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reminderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    marginRight: 12,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
  },
  reminderStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  myPrayersContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  myPrayerCard: {
    width: 160,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  myPrayerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  myPrayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[800],
    marginBottom: 4,
  },
  myPrayerSubtitle: {
    fontSize: 12,
    color: colors.secondary[600],
  },

});
