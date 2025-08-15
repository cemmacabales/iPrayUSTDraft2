import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseService } from './firebaseService';
import { Prayer, User } from '../types';

interface CachedData {
  prayers: Prayer[];
  suggestedPrayers: Prayer[];
  userProfile: User | null;
  lastUpdated: number;
  version: string;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number;
  pendingUpdates: any[];
}

class OfflineService {
  private static readonly CACHE_KEY = 'app_cache';
  private static readonly SYNC_STATUS_KEY = 'sync_status';
  private static readonly CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly APP_VERSION = '1.0.0';

  // Cache keys
  private static readonly CACHE_KEYS = {
    PRAYERS: 'cached_prayers',
    PRAYER_CATEGORIES: 'cached_prayer_categories',
    SUGGESTED_PRAYERS: 'cached_suggested_prayers',
    USER_PROFILE: 'cached_user_profile',
    SYNC_STATUS: 'sync_status',
    LAST_SYNC: 'last_sync_time',
    DATA_VERSION: 'data_version'
  };

  // Cache management
  static async getCachedData(): Promise<CachedData | null> {
    try {
      const cachedDataString = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cachedDataString) return null;
      
      const cachedData: CachedData = JSON.parse(cachedDataString);
      
      // Check if cache is expired or version mismatch
      const now = Date.now();
      const isExpired = now - cachedData.lastUpdated > this.CACHE_EXPIRY_TIME;
      const isVersionMismatch = cachedData.version !== this.APP_VERSION;
      
      if (isExpired || isVersionMismatch) {
        await this.clearCache();
        return null;
      }
      
      return cachedData;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  static async setCachedData(data: Partial<CachedData>): Promise<void> {
    try {
      const existingData = await this.getCachedData();
      const updatedData: CachedData = {
        prayers: data.prayers || existingData?.prayers || [],
        suggestedPrayers: data.suggestedPrayers || existingData?.suggestedPrayers || [],
        userProfile: data.userProfile !== undefined ? data.userProfile : existingData?.userProfile || null,
        lastUpdated: Date.now(),
        version: this.APP_VERSION
      };
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Sync status management
  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const syncStatusString = await AsyncStorage.getItem(this.SYNC_STATUS_KEY);
      if (!syncStatusString) {
        return {
          isOnline: true,
          lastSyncTime: 0,
          pendingUpdates: []
        };
      }
      return JSON.parse(syncStatusString);
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isOnline: true,
        lastSyncTime: 0,
        pendingUpdates: []
      };
    }
  }

  static async setSyncStatus(status: Partial<SyncStatus>): Promise<void> {
    try {
      const existingStatus = await this.getSyncStatus();
      const updatedStatus: SyncStatus = {
        ...existingStatus,
        ...status
      };
      
      await AsyncStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(updatedStatus));
    } catch (error) {
      console.error('Error setting sync status:', error);
    }
  }

  // Data synchronization
  static async syncPrayers(): Promise<Prayer[]> {
    try {
      // Try to fetch fresh data from Firebase
      const freshPrayers = await FirebaseService.getAllPrayers();
      
      // Cache the fresh data
      await this.setCachedData({ prayers: freshPrayers });
      await this.setSyncStatus({ 
        isOnline: true, 
        lastSyncTime: Date.now() 
      });
      
      return freshPrayers;
    } catch (error) {
      console.error('Error syncing prayers, using cached data:', error);
      
      // Mark as offline and return cached data
      await this.setSyncStatus({ isOnline: false });
      
      const cachedData = await this.getCachedData();
      return cachedData?.prayers || [];
    }
  }

  static async syncUserProfile(userId: string): Promise<User | null> {
    try {
      // Try to fetch fresh user profile from Firebase
      const freshProfile = await FirebaseService.getUserDocument(userId);
      
      // Cache the fresh data
      await this.setCachedData({ userProfile: freshProfile });
      await this.setSyncStatus({ 
        isOnline: true, 
        lastSyncTime: Date.now() 
      });
      
      return freshProfile;
    } catch (error) {
      console.error('Error syncing user profile, using cached data:', error);
      
      // Mark as offline and return cached data
      await this.setSyncStatus({ isOnline: false });
      
      const cachedData = await this.getCachedData();
      return cachedData?.userProfile || null;
    }
  }

  // Get data with offline fallback
  static async getPrayersWithOfflineSupport(): Promise<Prayer[]> {
    const cachedData = await this.getCachedData();
    
    // If we have recent cached data, return it immediately
    if (cachedData && cachedData.prayers.length > 0) {
      // Try to sync in background for next time
      this.syncPrayers().catch(() => {});
      return cachedData.prayers;
    }
    
    // No cached data, try to sync
    return await this.syncPrayers();
  }

  static async getUserProfileWithOfflineSupport(userId: string): Promise<User | null> {
    const cachedData = await this.getCachedData();
    
    // If we have cached user profile, return it immediately
    if (cachedData && cachedData.userProfile) {
      // Try to sync in background for next time
      this.syncUserProfile(userId).catch(() => {});
      return cachedData.userProfile;
    }
    
    // No cached data, try to sync
    return await this.syncUserProfile(userId);
  }

  // Force refresh data
  static async forceRefresh(): Promise<void> {
    await this.clearCache();
    await this.setSyncStatus({ 
      isOnline: true, 
      lastSyncTime: 0, 
      pendingUpdates: [] 
    });
  }

  // Sync suggested prayers
  static async syncSuggestedPrayers(): Promise<Prayer[]> {
    try {
      console.log('🔄 OfflineService: Starting sync for suggested prayers...');
      // Try to fetch fresh suggested prayers from Firebase (now from prayers collection)
      const freshSuggestedPrayers = await FirebaseService.getSuggestedPrayers();
      console.log('✅ OfflineService: Successfully fetched', freshSuggestedPrayers.length, 'suggested prayers');
      
      // Cache the fresh data
      await this.setCachedData({ suggestedPrayers: freshSuggestedPrayers });
      await this.setSyncStatus({ 
        isOnline: true, 
        lastSyncTime: Date.now() 
      });
      console.log('✅ OfflineService: Successfully cached suggested prayers');
      
      return freshSuggestedPrayers;
    } catch (error: any) {
      console.error('❌ OfflineService: Error syncing suggested prayers, using cached data:', error.message, error.code);
      
      // Mark as offline and return cached data
      await this.setSyncStatus({ isOnline: false });
      
      const cachedData = await this.getCachedData();
      const cachedPrayers = cachedData?.suggestedPrayers || [];
      console.log('📦 OfflineService: Returning', cachedPrayers.length, 'cached suggested prayers');
      return cachedPrayers;
    }
  }

  // Get suggested prayers with offline support
  static async getSuggestedPrayersWithOfflineSupport(): Promise<Prayer[]> {
    console.log('🔍 OfflineService: Getting suggested prayers with offline support...');
    const cachedData = await this.getCachedData();
    
    // If we have recent cached data, return it immediately
    if (cachedData && cachedData.suggestedPrayers.length > 0) {
      console.log('📦 OfflineService: Found', cachedData.suggestedPrayers.length, 'cached suggested prayers, returning immediately');
      // Try to sync in background for next time
      this.syncSuggestedPrayers().catch(() => {});
      return cachedData.suggestedPrayers;
    }
    
    console.log('📦 OfflineService: No cached data found, attempting fresh sync...');
    // No cached data, try to sync
    return await this.syncSuggestedPrayers();
  }

  // Check if app needs data update
  static async needsDataUpdate(): Promise<boolean> {
    const cachedData = await this.getCachedData();
    if (!cachedData) return true;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - cachedData.lastUpdated;
    
    // Update if data is older than 1 hour or version mismatch
    return timeSinceLastUpdate > (60 * 60 * 1000) || cachedData.version !== this.APP_VERSION;
  }
}

export { OfflineService };