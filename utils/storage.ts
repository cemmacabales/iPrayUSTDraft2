import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const BOOKMARKS_KEY = 'user_bookmarks';
const RECENT_PRAYERS_KEY = 'recent_prayers';
const PRAYER_STATS_KEY = 'prayer_stats';
const NAV_INSTRUCTION_SEEN_KEY = 'nav_instruction_seen';
const USER_LOGGED_IN_KEY = 'user_logged_in';
const FEATURE_OVERLAY_SEEN_KEY = 'feature_overlay_seen';

export const StorageUtils = {
  // Check if onboarding has been completed
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error reading onboarding status:', error);
      return false;
    }
  },

  // Mark onboarding as completed
  async markOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  // Reset onboarding status (for testing)
  async resetOnboardingStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  },

  // Bookmark functionality
  async getBookmarks(): Promise<string[]> {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Error reading bookmarks:', error);
      return [];
    }
  },

  async addBookmark(prayerId: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      if (!bookmarks.includes(prayerId)) {
        bookmarks.push(prayerId);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  },

  async removeBookmark(prayerId: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const updatedBookmarks = bookmarks.filter(id => id !== prayerId);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  },

  async isBookmarked(prayerId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarks();
      return bookmarks.includes(prayerId);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  },

  // Recent prayers functionality
  async getRecentPrayers(): Promise<string[]> {
    try {
      const recent = await AsyncStorage.getItem(RECENT_PRAYERS_KEY);
      return recent ? JSON.parse(recent) : [];
    } catch (error) {
      console.error('Error reading recent prayers:', error);
      return [];
    }
  },

  async addRecentPrayer(prayerId: string): Promise<void> {
    try {
      const recent = await this.getRecentPrayers();
      const updatedRecent = [prayerId, ...recent.filter(id => id !== prayerId)].slice(0, 10);
      await AsyncStorage.setItem(RECENT_PRAYERS_KEY, JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Error adding recent prayer:', error);
    }
  },

  // Prayer statistics
  async getPrayerStats(): Promise<Record<string, number>> {
    try {
      const stats = await AsyncStorage.getItem(PRAYER_STATS_KEY);
      return stats ? JSON.parse(stats) : {};
    } catch (error) {
      console.error('Error reading prayer stats:', error);
      return {};
    }
  },

  async incrementPrayerCount(prayerId: string): Promise<void> {
    try {
      const stats = await this.getPrayerStats();
      stats[prayerId] = (stats[prayerId] || 0) + 1;
      await AsyncStorage.setItem(PRAYER_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error incrementing prayer count:', error);
    }
  },

  // Navigation instruction tracking
  async hasSeenNavInstruction(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(NAV_INSTRUCTION_SEEN_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error reading nav instruction status:', error);
      return false;
    }
  },

  async markNavInstructionSeen(): Promise<void> {
    try {
      await AsyncStorage.setItem(NAV_INSTRUCTION_SEEN_KEY, 'true');
    } catch (error) {
      console.error('Error saving nav instruction status:', error);
    }
  },

  async resetNavInstruction(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NAV_INSTRUCTION_SEEN_KEY);
    } catch (error) {
      console.error('Error resetting nav instruction status:', error);
    }
  },

  // Authentication methods
  async isUserLoggedIn(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(USER_LOGGED_IN_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error reading user login status:', error);
      return false;
    }
  },

  async markUserLoggedIn(): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_LOGGED_IN_KEY, 'true');
    } catch (error) {
      console.error('Error saving user login status:', error);
    }
  },

  async markUserLoggedOut(): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_LOGGED_IN_KEY, 'false');
    } catch (error) {
      console.error('Error saving user logout status:', error);
    }
  },

  // Feature overlay tracking
  async hasSeenFeatureOverlay(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(FEATURE_OVERLAY_SEEN_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error reading feature overlay status:', error);
      return false;
    }
  },

  async markFeatureOverlaySeen(): Promise<void> {
    try {
      await AsyncStorage.setItem(FEATURE_OVERLAY_SEEN_KEY, 'true');
    } catch (error) {
      console.error('Error saving feature overlay status:', error);
    }
  },

  async resetFeatureOverlay(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FEATURE_OVERLAY_SEEN_KEY);
    } catch (error) {
      console.error('Error resetting feature overlay status:', error);
    }
  },

  // Tab visit tracking for feature overlay
  async getVisitedTabs(): Promise<string[]> {
    try {
      const visitedTabs = await AsyncStorage.getItem('visited_tabs');
      return visitedTabs ? JSON.parse(visitedTabs) : [];
    } catch (error) {
      console.error('Error reading visited tabs:', error);
      return [];
    }
  },

  async markTabVisited(tab: string): Promise<void> {
    try {
      const visitedTabs = await this.getVisitedTabs();
      if (!visitedTabs.includes(tab)) {
        visitedTabs.push(tab);
        await AsyncStorage.setItem('visited_tabs', JSON.stringify(visitedTabs));
      }
    } catch (error) {
      console.error('Error marking tab as visited:', error);
    }
  },

  async resetVisitedTabs(): Promise<void> {
    try {
      await AsyncStorage.removeItem('visited_tabs');
    } catch (error) {
      console.error('Error resetting visited tabs:', error);
    }
  },
};
