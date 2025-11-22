import { Alert } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';

class NotificationService {
  constructor() {
    this.configured = false;
    this.channelId = 'cartsync-reminders';
  }

  async configure() {
    if (this.configured) {
      return;
    }

    try {
      // Request notification permission
      await notifee.requestPermission();

      // Create notification channel for Android
      await notifee.createChannel({
        id: this.channelId,
        name: 'CartSync Reminders',
        description: 'Location tracking reminder notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });

      console.log('NotificationService configured with Notifee');
      this.configured = true;
    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  }

  async showReminderNotification() {
    await this.configure();
    console.log('🔔 Showing reminder notification to start tracking');

    try {
      await notifee.displayNotification({
        title: '📍 Start Location Sharing',
        body: 'You are not sharing your location. Please open CartSync and start tracking.',
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [300, 500],
          pressAction: {
            id: 'default',
          },
          color: '#f39c12',
          largeIcon: require('../../android/app/src/main/res/mipmap-hdpi/ic_launcher.png'),
        },
      });
      console.log('✅ Reminder notification displayed');
    } catch (error) {
      console.error('Error showing reminder notification:', error);
    }
  }

  showLocationPermissionReminder() {
    Alert.alert(
      'Location Permission Required',
      'Please enable location access to continue tracking',
      [{ text: 'OK' }],
    );
  }

  async showErrorNotification(message) {
    await this.configure();
    console.log('🔔 Showing error notification:', message);

    try {
      await notifee.displayNotification({
        title: '⚠️ CartSync Error',
        body: message,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          pressAction: {
            id: 'default',
          },
          color: '#e74c3c',
        },
      });
    } catch (error) {
      console.error('Error showing error notification:', error);
    }
  }

  showLocationUpdateNotification() {
    console.log('Location shared successfully');
  }

  async cancelAll() {
    console.log('Cancelling all notifications');
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  cancelAllNotifications() {
    return this.cancelAll();
  }
}

const notificationService = new NotificationService();
export default notificationService;
