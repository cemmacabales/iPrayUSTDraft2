import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp
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
        bookmarks: [],
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
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
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
        
        // Get prayers for this category
        const prayersRef = collection(db, 'prayers');
        const prayersQuery = query(prayersRef, where('category', '==', categoryData.id));
        const prayersSnap = await getDocs(prayersQuery);
        
        const prayers = prayersSnap.docs.map(doc => doc.data() as Prayer);
        
        categories.push({
          ...categoryData,
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
      const prayersRef = collection(db, 'prayers');
      const prayersQuery = query(prayersRef, where('category', '==', categoryId));
      const prayersSnap = await getDocs(prayersQuery);
      
      return prayersSnap.docs.map(doc => doc.data() as Prayer);
    } catch (error) {
      console.error('Error getting prayers by category:', error);
      throw error;
    }
  }

  // Bookmark Methods
  static async addBookmark(userId: string, prayerId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        bookmarks: arrayUnion(prayerId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  static async removeBookmark(userId: string, prayerId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        bookmarks: arrayRemove(prayerId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
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
      const recentRef = doc(db, 'userRecent', userId);
      const recentSnap = await getDoc(recentRef);
      
      let recentPrayers: string[] = [];
      if (recentSnap.exists()) {
        recentPrayers = recentSnap.data().prayers || [];
      }
      
      // Remove if already exists and add to front
      recentPrayers = recentPrayers.filter(id => id !== prayerId);
      recentPrayers.unshift(prayerId);
      
      // Keep only last 10
      recentPrayers = recentPrayers.slice(0, 10);
      
      await setDoc(recentRef, {
        userId,
        prayers: recentPrayers,
        updatedAt: serverTimestamp()
      });
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
      await updateDoc(userRef, {
        preferences,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}