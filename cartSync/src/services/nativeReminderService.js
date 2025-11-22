import { NativeModules } from 'react-native';

const { ReminderModule } = NativeModules;

class NativeReminderService {
  /**
   * Schedule periodic reminders using Android WorkManager
   * This will work even if the app is killed
   * @param {number} intervalMinutes - How often to check (minimum 15 minutes for Android)
   */
  async scheduleReminder(intervalMinutes = 15) {
    try {
      // Android WorkManager requires minimum 15 minutes
      const safeInterval = Math.max(15, intervalMinutes);
      const result = await ReminderModule.scheduleReminder(safeInterval);
      console.log('✅ Native reminder scheduled:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to schedule native reminder:', error);
      return false;
    }
  }

  /**
   * Cancel scheduled reminders
   */
  async cancelReminder() {
    try {
      const result = await ReminderModule.cancelReminder();
      console.log('✅ Native reminder cancelled:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to cancel native reminder:', error);
      return false;
    }
  }
}

const nativeReminderService = new NativeReminderService();
export default nativeReminderService;
