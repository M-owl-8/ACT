import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications and get the push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Constants.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get the push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = tokenData.data;

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('financial', {
          name: 'Financial Updates',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Schedule a daily reminder notification
   */
  async scheduleDailyReminder(
    title: string,
    body: string,
    hour: number,
    minute: number
  ): Promise<string | null> {
    return this.scheduleLocalNotification(
      { title, body },
      {
        hour,
        minute,
        repeats: true,
      }
    );
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Remove notification listener
   */
  removeNotificationSubscription(subscription: Notifications.Subscription): void {
    Notifications.removeNotificationSubscription(subscription);
  }

  /**
   * Present a notification immediately
   */
  async presentNotification(notification: NotificationData): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });

      return id;
    } catch (error) {
      console.error('Error presenting notification:', error);
      return null;
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

/**
 * Initialize notifications
 * Call this once at app startup
 */
export const initializeNotifications = async (): Promise<void> => {
  try {
    console.log('Initializing notifications...');
    
    // Register for push notifications
    const token = await notificationService.registerForPushNotifications();
    
    if (token) {
      console.log('✅ Notifications initialized. Push token:', token);
    } else {
      console.log('⚠️ Notifications initialized without push token (emulator or permissions denied)');
    }
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};

// Export default for convenience
export default notificationService;