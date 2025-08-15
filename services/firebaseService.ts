import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { Prayer, PrayerCategory, User, VerseOfTheDay } from '../types';

export class FirebaseService {
  // Authentication Methods
  static async signUp(email: string, password: string, displayName: string, firstName?: string, lastName?: string, studentNumber?: string): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await this.createUserDocument(user.uid, {
        id: user.uid,
        displayName,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        studentNumber: studentNumber || '',
        role: 'user',
        bookmarks: [],
        personalLibrary: {
          bookmarkedPrayers: [],
          customPrayers: [],
          favoriteCategories: []
        },
        preferences: {
          morningReminder: false,
          eveningReminder: false,
          reminderTime: '08:00'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // User Document Methods
  static async createUserDocument(userId: string, userData: any): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, userData);
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  static async getUserDocument(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user document:', error);
      throw error;
    }
  }

  static async updateUserDocument(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // Check if user document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document with basic structure
        await setDoc(userRef, {
          uid: userId,
          ...updates,
          personalLibrary: {
            favoriteCategories: [],
            bookmarkedPrayers: [],
            customPrayers: [],
            ...updates.personalLibrary
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user document:', error);
      throw error;
    }
  }

  // Prayer Library Methods
  static async getPrayerCategories(): Promise<PrayerCategory[]> {
    try {
      const categoriesRef = collection(db, 'prayerCategories');
      const categoriesSnap = await getDocs(categoriesRef);
      
      const categories: PrayerCategory[] = [];
      for (const categoryDoc of categoriesSnap.docs) {
        const categoryData = categoryDoc.data() as PrayerCategory;
        
        // Ensure category has a valid ID
        const categoryId = categoryData.id || categoryDoc.id;
        if (!categoryId) {
          console.warn('Category document missing ID:', categoryDoc.id);
          continue;
        }
        
        // Get prayers for this category
        const prayersRef = collection(db, 'prayers');
        const prayersQuery = query(prayersRef, where('category', '==', categoryId));
        const prayersSnap = await getDocs(prayersQuery);
        
        const prayers = prayersSnap.docs.map(doc => ({
          ...doc.data() as Prayer,
          id: doc.id // Ensure the document ID is included
        }));
        
        categories.push({
          ...categoryData,
          id: categoryId,
          prayers
        });
      }
      
      return categories;
    } catch (error) {
      console.error('Error getting prayer categories:', error);
      throw error;
    }
  }

  static async getPrayer(prayerId: string): Promise<Prayer | null> {
    try {
      const prayerRef = doc(db, 'prayers', prayerId);
      const prayerSnap = await getDoc(prayerRef);
      
      if (prayerSnap.exists()) {
        return prayerSnap.data() as Prayer;
      }
      return null;
    } catch (error) {
      console.error('Error getting prayer:', error);
      throw error;
    }
  }

  static async getPrayersByCategory(categoryId: string): Promise<Prayer[]> {
    try {
      if (!categoryId) {
        console.warn('getPrayersByCategory called with undefined or empty categoryId');
        return [];
      }
      
      const prayersRef = collection(db, 'prayers');
      const prayersQuery = query(prayersRef, where('category', '==', categoryId));
      const prayersSnap = await getDocs(prayersQuery);
      
      return prayersSnap.docs.map(doc => doc.data() as Prayer);
    } catch (error) {
      console.error('Error getting prayers by category:', error);
      throw error;
    }
  }

  static async getAllPrayers(): Promise<Prayer[]> {
    try {
      const prayersRef = collection(db, 'prayers');
      const prayersSnap = await getDocs(prayersRef);
      
      return prayersSnap.docs.map(doc => doc.data() as Prayer);
    } catch (error) {
      console.error('Error getting all prayers:', error);
      throw error;
    }
  }

  // Get suggested prayers from the prayers collection
  static async getSuggestedPrayers(): Promise<Prayer[]> {
    try {
      console.log('🔍 Fetching suggested prayers from prayers collection...');
      const prayersRef = collection(db, 'prayers');
      
      // Query prayers where isSuggested is true
      const suggestedQuery = query(prayersRef, where('isSuggested', '==', true));
      const suggestedSnap = await getDocs(suggestedQuery);
      
      console.log('✅ Found', suggestedSnap.size, 'suggested prayers');
      
      const prayers = suggestedSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prayer[];
      
      // Sort by suggestionOrder, defaulting to 999 for prayers without order
      const sortedPrayers = prayers.sort((a, b) => {
        const orderA = a.suggestionOrder || 999;
        const orderB = b.suggestionOrder || 999;
        return orderA - orderB;
      });
      
      console.log('✅ Returning', sortedPrayers.length, 'sorted suggested prayers');
      return sortedPrayers;
    } catch (error: any) {
      console.error('❌ Error getting suggested prayers:', error.message, error.code);
      throw error;
    }
  }

  static async addSuggestedPrayer(suggestedPrayer: any): Promise<void> {
    try {
      const suggestedRef = collection(db, 'suggested_prayers');
      await setDoc(doc(suggestedRef, suggestedPrayer.id), {
        ...suggestedPrayer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding suggested prayer:', error);
      throw error;
    }
  }

  static async updateSuggestedPrayer(id: string, updates: any): Promise<void> {
    try {
      const suggestedRef = doc(db, 'suggested_prayers', id);
      await updateDoc(suggestedRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating suggested prayer:', error);
      throw error;
    }
  }

  static async deleteSuggestedPrayer(id: string): Promise<void> {
    try {
      const suggestedRef = doc(db, 'suggested_prayers', id);
      await deleteDoc(suggestedRef);
    } catch (error) {
      console.error('Error deleting suggested prayer:', error);
      throw error;
    }
  }

  // Bookmark Methods
  static async addBookmark(userId: string, prayerId: string): Promise<void> {
    try {
      // Validate parameters
      if (!userId || !prayerId) {
        console.error('Invalid parameters for addBookmark:', { userId, prayerId });
        return;
      }
      
      const userRef = doc(db, 'users', userId);
      // Check if user document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document with basic structure if it doesn't exist
        await setDoc(userRef, {
          id: userId,
          bookmarks: [prayerId],
          personalLibrary: {
            bookmarkedPrayers: [prayerId],
            customPrayers: [],
            favoriteCategories: []
          },
          preferences: {
            morningReminder: false,
            eveningReminder: false,
            reminderTime: '08:00'
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          bookmarks: arrayUnion(prayerId),
          'personalLibrary.bookmarkedPrayers': arrayUnion(prayerId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  static async removeBookmark(userId: string, prayerId: string): Promise<void> {
    try {
      // Validate parameters
      if (!userId || !prayerId) {
        console.error('Invalid parameters for removeBookmark:', { userId, prayerId });
        return;
      }
      
      const userRef = doc(db, 'users', userId);
      // Check if user document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // If document doesn't exist, there's nothing to remove
        console.log('User document does not exist, nothing to remove');
        return;
      }
      
      // Update existing document
      await updateDoc(userRef, {
        bookmarks: arrayRemove(prayerId),
        'personalLibrary.bookmarkedPrayers': arrayRemove(prayerId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  // Personal Library Methods
  static async addFavoriteCategory(userId: string, categoryId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // Check if user document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document with basic structure
        await setDoc(userRef, {
          uid: userId,
          personalLibrary: {
            favoriteCategories: [categoryId],
            bookmarkedPrayers: [],
            customPrayers: []
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          'personalLibrary.favoriteCategories': arrayUnion(categoryId),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding favorite category:', error);
      throw error;
    }
  }

  static async removeFavoriteCategory(userId: string, categoryId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // Check if user document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // If document doesn't exist, there's nothing to remove
        console.log('User document does not exist, nothing to remove');
        return;
      }
      
      // Update existing document
      await updateDoc(userRef, {
        'personalLibrary.favoriteCategories': arrayRemove(categoryId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing favorite category:', error);
      throw error;
    }
  }

  static async getUserPersonalLibrary(userId: string): Promise<any> {
    try {
      const userDoc = await this.getUserDocument(userId);
      return userDoc?.personalLibrary || {
        bookmarkedPrayers: [],
        customPrayers: [],
        favoriteCategories: []
      };
    } catch (error) {
      console.error('Error getting user personal library:', error);
      throw error;
    }
  }

  // Prayer Stats Methods
  static async incrementPrayerCount(userId: string, prayerId: string): Promise<void> {
    try {
      const statsRef = doc(db, 'userStats', userId);
      const statsSnap = await getDoc(statsRef);
      
      if (!statsSnap.exists()) {
        // Create initial stats document
        await setDoc(statsRef, {
          userId,
          prayerCounts: { [prayerId]: 1 },
          totalPrayers: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing stats
        await updateDoc(statsRef, {
          [`prayerCounts.${prayerId}`]: increment(1),
          totalPrayers: increment(1),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing prayer count:', error);
      throw error;
    }
  }

  static async getPrayerStats(userId: string): Promise<Record<string, number>> {
    try {
      const statsRef = doc(db, 'userStats', userId);
      const statsSnap = await getDoc(statsRef);
      
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        return data.prayerCounts || {};
      }
      return {};
    } catch (error) {
      console.error('Error getting prayer stats:', error);
      return {};
    }
  }

  // Recent Prayers Methods
  static async addRecentPrayer(userId: string, prayerId: string): Promise<void> {
    try {
      // Validate parameters
      if (!userId || !prayerId) {
        console.error('Invalid parameters for addRecentPrayer:', { userId, prayerId });
        return;
      }
      
      // Additional validation to ensure parameters are strings
      if (typeof userId !== 'string' || typeof prayerId !== 'string') {
        console.error('Parameters must be strings for addRecentPrayer:', { userId: typeof userId, prayerId: typeof prayerId });
        return;
      }
      
      const recentRef = doc(db, 'userRecent', userId);
      const recentSnap = await getDoc(recentRef);
      
      let recentPrayers: string[] = [];
      if (recentSnap.exists()) {
        const data = recentSnap.data();
        recentPrayers = Array.isArray(data?.prayers) ? data.prayers.filter(p => p && typeof p === 'string') : [];
      }
      
      // Remove if already exists and add to front
      recentPrayers = recentPrayers.filter(id => id !== prayerId);
      recentPrayers.unshift(prayerId);
      
      // Keep only last 10
      recentPrayers = recentPrayers.slice(0, 10);
      
      // Create the document data
      const documentData = {
        userId: userId,
        prayers: recentPrayers,
        updatedAt: serverTimestamp()
      };
      
      // Validate that critical fields are not undefined (excluding serverTimestamp)
      if (!userId || !Array.isArray(recentPrayers)) {
        console.error('Critical fields are invalid in addRecentPrayer:', { userId, recentPrayers });
        throw new Error('Invalid data for addRecentPrayer');
      }
      
      // Log the data being saved for debugging
      console.log('Saving recent prayer data:', {
        userId,
        prayerId,
        prayersCount: recentPrayers.length,
        prayers: recentPrayers
      });
      
      await setDoc(recentRef, documentData);
    } catch (error) {
      console.error('Error adding recent prayer:', error);
      throw error;
    }
  }

  static async getRecentPrayers(userId: string): Promise<string[]> {
    try {
      const recentRef = doc(db, 'userRecent', userId);
      const recentSnap = await getDoc(recentRef);
      
      if (recentSnap.exists()) {
        return recentSnap.data().prayers || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting recent prayers:', error);
      return [];
    }
  }

  // Verse of the Day Methods
  static async getVerseOfTheDay(): Promise<VerseOfTheDay | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const versesRef = collection(db, 'versesOfTheDay');
      const verseQuery = query(versesRef, where('date', '==', today), limit(1));
      const verseSnap = await getDocs(verseQuery);
      
      if (!verseSnap.empty) {
        return verseSnap.docs[0].data() as VerseOfTheDay;
      }
      return null;
    } catch (error) {
      console.error('Error getting verse of the day:', error);
      return null;
    }
  }

  // User Preferences Methods
  static async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      // Check if user document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document with basic structure
        await setDoc(userRef, {
          uid: userId,
          preferences,
          personalLibrary: {
            favoriteCategories: [],
            bookmarkedPrayers: [],
            customPrayers: []
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          preferences,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // App Configuration Methods
  static async getAppConfig(): Promise<any> {
    try {
      const configRef = doc(db, 'appConfig', 'main');
      const configDoc = await getDoc(configRef);
      
      if (configDoc.exists()) {
        return configDoc.data();
      } else {
        // Return default config if none exists
        return {
          logo: {
            iconName: 'heart-outline',
            iconLibrary: 'ionicons',
            color: '#FF6B6B',
            size: 24
          },
          appName: 'iPrayUST',
          version: '1.0.0'
        };
      }
    } catch (error) {
      console.error('Error fetching app config:', error);
      // Return default config on error
      return {
        logo: {
          iconName: 'heart-outline',
          iconLibrary: 'ionicons',
          color: '#FF6B6B',
          size: 24
        },
        appName: 'iPrayUST',
        version: '1.0.0'
      };
    }
  }

  static async updateAppConfig(updates: any): Promise<void> {
    try {
      const configRef = doc(db, 'appConfig', 'main');
      await updateDoc(configRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating app config:', error);
      throw error;
    }
  }

  static async getLogoConfig(): Promise<any> {
    try {
      const config = await this.getAppConfig();
      return config.logo || {
        iconName: 'heart-outline',
        iconLibrary: 'ionicons',
        color: '#FF6B6B',
        size: 24
      };
    } catch (error) {
      console.error('Error fetching logo config:', error);
      return {
        iconName: 'heart-outline',
        iconLibrary: 'ionicons',
        color: '#FF6B6B',
        size: 24
      };
    }
  }
}