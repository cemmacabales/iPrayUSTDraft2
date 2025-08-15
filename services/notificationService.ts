import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  // Request notification permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Get Expo push token
  static async getExpoPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // For development with Expo Go, we may not have a projectId configured
      // This is acceptable for local development and testing
      try {
        const token = await Notifications.getExpoPushTokenAsync();
        return token.data;
      } catch (tokenError: any) {
        if (tokenError.message?.includes('projectId')) {
          console.warn('Push notifications require an Expo project ID for production use. Skipping for development.');
          return null;
        }
        throw tokenError;
      }
    } catch (error) {
      console.error('Error getting Expo push token:', error);
      return null;
    }
  }

  // Register device token with user in Firebase
  static async registerDeviceToken(userId: string): Promise<void> {
    try {
      const token = await this.getExpoPushToken();
      if (token) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          expoPushToken: token,
          updatedAt: serverTimestamp()
        });
        console.log('Device token registered successfully');
      } else {
        console.log('No push token available - this is normal for development with Expo Go');
      }
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  }

  // Schedule simple local notification
  static async scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number = 1
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  // Cancel all scheduled notifications
  static async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  // Send push notification via Expo Push API (for server-side use)
  static async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Handle notification received while app is running
  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Handle notification response (when user taps notification)
  static addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Schedule prayer streak celebration
  static async schedulePrayerStreakNotification(streakCount: number): Promise<void> {
    try {
      await this.scheduleLocalNotification(
        `🔥 ${streakCount} Day Prayer Streak!`,
        `Amazing! You've maintained your prayer streak for ${streakCount} days. Keep it up!`,
        2
      );
    } catch (error) {
      console.error('Error scheduling streak notification:', error);
    }
  }

  // Get all scheduled notifications
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Show immediate notification
  static async showImmediateNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.presentNotificationAsync({
        title,
        body,
        sound: 'default',
      });
    } catch (error) {
      console.error('Error showing immediate notification:', error);
    }
  }
}