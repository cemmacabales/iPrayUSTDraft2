import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FirebaseService } from '../services/firebaseService';
import { OfflineService } from '../services/offlineService';
import { StorageUtils } from '../utils/storage';
import { User } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, studentNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Load user profile from Firestore
        try {
          const profile = await OfflineService.getUserProfileWithOfflineSupport(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await FirebaseService.signIn(email, password);
      // Mark user as logged in in local storage
      await StorageUtils.markUserLoggedIn();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string, studentNumber: string) => {
    try {
      setLoading(true);
      const displayName = `${firstName} ${lastName}`;
      await FirebaseService.signUp(email, password, displayName, firstName, lastName, studentNumber);
      // Mark user as logged in in local storage
      await StorageUtils.markUserLoggedIn();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await FirebaseService.signOut();
      // Clear local storage authentication state
      await StorageUtils.markUserLoggedOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await OfflineService.syncUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};