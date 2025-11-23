import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundService from 'react-native-background-actions';
import notificationService from './notificationService';
import { NOTIFICATION_REMINDER_INTERVAL } from '../config/constants';

class ReminderService {
  constructor() {
    this.intervalId = null;
    this.isActive = false;
  }

  /**
   * Start periodic checks to remind user to start tracking if inactive
   */
  async start() {
    if (this.isActive) {
      console.log('⚠️ Reminder service already active');
      return;
    }

    console.log('🔔 Starting reminder service...');
    console.log(
      `Will check every ${NOTIFICATION_REMINDER_INTERVAL / 1000} seconds`,
    );

    this.isActive = true;

    // Check immediately
    await this.checkAndNotify();

    // Then check periodically
    this.intervalId = setInterval(async () => {
      await this.checkAndNotify();
    }, NOTIFICATION_REMINDER_INTERVAL);

    console.log('✅ Reminder service started');
  }

  /**
   * Stop the reminder service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log('🛑 Reminder service stopped');
  }

  /**
   * Check if current time is within working hours (7 AM - 5 PM)
   */
  isWorkingHours() {
    const now = new Date();
    const hours = now.getHours();
    const isWorkingHours = hours >= 7 && hours < 17; // 7 AM to 5 PM (17:00)
    
    console.log(`⏰ Current time: ${now.toLocaleTimeString()}, Working hours: ${isWorkingHours}`);
    return isWorkingHours;
  }

  /**
   * Check if tracking is active, if not send reminder notification
   */
  async checkAndNotify() {
    try {
      console.log('\n🔍 Checking tracking status...');

      // First check if we're in working hours
      if (!this.isWorkingHours()) {
        console.log('🌙 Outside working hours (7 AM - 5 PM), skipping notification');
        return;
      }

      // Check if background service is running
      const isTrackingActive = BackgroundService.isRunning();
      console.log('Is tracking active?', isTrackingActive);

      if (!isTrackingActive) {
        // Check last notification time to enforce 40-minute interval
        const lastNotificationStr = await AsyncStorage.getItem('lastReminderNotification');
        const now = Date.now();

        if (lastNotificationStr) {
          const lastNotification = parseInt(lastNotificationStr);
          const timeSinceLastNotification = now - lastNotification;
          const minutesSinceNotification = Math.floor(timeSinceLastNotification / 1000 / 60);

          console.log(`📱 Last notification was ${minutesSinceNotification} minutes ago`);

          // Only send reminder if it's been more than 40 minutes since last notification
          if (timeSinceLastNotification < 40 * 60 * 1000) {
            console.log('⏳ Less than 40 minutes since last notification, skipping');
            return;
          }
        }

        // Check last location update
        const lastUpdateStr = await AsyncStorage.getItem('lastLocationUpdate');

        if (lastUpdateStr) {
          const lastUpdate = parseInt(lastUpdateStr);
          const timeSinceLastUpdate = now - lastUpdate;
          const minutesSinceUpdate = Math.floor(timeSinceLastUpdate / 1000 / 60);

          console.log(`⏰ Last location update was ${minutesSinceUpdate} minutes ago`);

          // Only send reminder if it's been more than 5 minutes since last update
          if (timeSinceLastUpdate > 5 * 60 * 1000) {
            console.log('⚠️ Tracking is inactive - sending reminder notification');
            await notificationService.showReminderNotification();
            // Save notification time
            await AsyncStorage.setItem('lastReminderNotification', now.toString());
          } else {
            console.log('✅ Recent update found, no reminder needed yet');
          }
        } else {
          console.log('⚠️ No tracking history - sending reminder notification');
          await notificationService.showReminderNotification();
          // Save notification time
          await AsyncStorage.setItem('lastReminderNotification', now.toString());
        }
      } else {
        console.log('✅ Tracking is active, no reminder needed');
      }
    } catch (error) {
      console.error('❌ Error in reminder check:', error);
    }
  }

  /**
   * Check if reminder service is active
   */
  isRunning() {
    return this.isActive;
  }
}

const reminderService = new ReminderService();
export default reminderService;
