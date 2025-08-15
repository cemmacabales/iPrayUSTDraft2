export interface Prayer {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  isBookmarked?: boolean;
}

export interface PrayerCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  prayers: Prayer[];
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  studentNumber?: string;
  role: 'user' | 'admin';
  bookmarks: string[];
  personalLibrary: {
    bookmarkedPrayers: string[];
    customPrayers?: string[];
    favoriteCategories?: string[];
  };
  preferences: {
    morningReminder: boolean;
    eveningReminder: boolean;
    reminderTime: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

export interface ReminderSettings {
  morningReminder: boolean;
  eveningReminder: boolean;
  reminderTime: string;
}

export interface VerseOfTheDay {
  id: string;
  verse: string;
  reference: string;
  date: string;
}

export type RootStackParamList = {
  index: undefined;
  prayers: undefined;
  reminders: undefined;
  account: undefined;
  'prayer-detail': { prayerId: string };
};
