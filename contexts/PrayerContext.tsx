import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseService } from '../services/firebaseService';
import { Prayer, PrayerCategory, VerseOfTheDay } from '../types';
import { useAuth } from './AuthContext';

interface PrayerContextType {
  prayerCategories: PrayerCategory[];
  userBookmarks: string[];
  recentPrayers: string[];
  prayerStats: Record<string, number>;
  verseOfTheDay: VerseOfTheDay | null;
  loading: boolean;
  refreshPrayers: () => Promise<void>;
  addBookmark: (prayerId: string) => Promise<void>;
  removeBookmark: (prayerId: string) => Promise<void>;
  addRecentPrayer: (prayerId: string) => Promise<void>;
  incrementPrayerCount: (prayerId: string) => Promise<void>;
  getPrayerById: (prayerId: string) => Prayer | null;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

export const usePrayer = () => {
  const context = useContext(PrayerContext);
  if (context === undefined) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
};

export const PrayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [prayerCategories, setPrayerCategories] = useState<PrayerCategory[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<string[]>([]);
  const [recentPrayers, setRecentPrayers] = useState<string[]>([]);
  const [prayerStats, setPrayerStats] = useState<Record<string, number>>({});
  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrayerData();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear user-specific data when logged out
      setUserBookmarks([]);
      setRecentPrayers([]);
      setPrayerStats({});
    }
  }, [user]);

  const loadPrayerData = async () => {
    try {
      setLoading(true);
      const [categories, verse] = await Promise.all([
        FirebaseService.getPrayerCategories(),
        FirebaseService.getVerseOfTheDay(),
      ]);
      
      setPrayerCategories(categories);
      setVerseOfTheDay(verse);
    } catch (error) {
      console.error('Error loading prayer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [userProfile, recent, stats] = await Promise.all([
        FirebaseService.getUserDocument(user.uid),
        FirebaseService.getRecentPrayers(user.uid),
        FirebaseService.getPrayerStats(user.uid),
      ]);
      
      if (userProfile) {
        setUserBookmarks(userProfile.bookmarks || []);
      }
      setRecentPrayers(recent);
      setPrayerStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const refreshPrayers = async () => {
    await loadPrayerData();
    if (user) {
      await loadUserData();
    }
  };

  const addBookmark = async (prayerId: string) => {
    if (!user) return;
    
    try {
      await FirebaseService.addBookmark(user.uid, prayerId);
      setUserBookmarks(prev => [...prev, prayerId]);
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  const removeBookmark = async (prayerId: string) => {
    if (!user) return;
    
    try {
      await FirebaseService.removeBookmark(user.uid, prayerId);
      setUserBookmarks(prev => prev.filter(id => id !== prayerId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  const addRecentPrayer = async (prayerId: string) => {
    if (!user) return;
    
    try {
      await FirebaseService.addRecentPrayer(user.uid, prayerId);
      setRecentPrayers(prev => {
        const filtered = prev.filter(id => id !== prayerId);
        return [prayerId, ...filtered].slice(0, 10);
      });
    } catch (error) {
      console.error('Error adding recent prayer:', error);
    }
  };

  const incrementPrayerCount = async (prayerId: string) => {
    if (!user) return;
    
    try {
      await FirebaseService.incrementPrayerCount(user.uid, prayerId);
      setPrayerStats(prev => ({
        ...prev,
        [prayerId]: (prev[prayerId] || 0) + 1,
      }));
    } catch (error) {
      console.error('Error incrementing prayer count:', error);
    }
  };

  const getPrayerById = (prayerId: string): Prayer | null => {
    for (const category of prayerCategories) {
      const prayer = category.prayers.find(p => p.id === prayerId);
      if (prayer) {
        return {
          ...prayer,
          isBookmarked: userBookmarks.includes(prayerId),
        };
      }
    }
    return null;
  };

  const value: PrayerContextType = {
    prayerCategories: prayerCategories.map(category => ({
      ...category,
      prayers: category.prayers.map(prayer => ({
        ...prayer,
        isBookmarked: userBookmarks.includes(prayer.id),
      })),
    })),
    userBookmarks,
    recentPrayers,
    prayerStats,
    verseOfTheDay,
    loading,
    refreshPrayers,
    addBookmark,
    removeBookmark,
    addRecentPrayer,
    incrementPrayerCount,
    getPrayerById,
  };

  return (
    <PrayerContext.Provider value={value}>
      {children}
    </PrayerContext.Provider>
  );
};