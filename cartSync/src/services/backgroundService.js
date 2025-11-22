import BackgroundService from 'react-native-background-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import locationService from './locationService';
import { locationAPI } from './api';
import notificationService from './notificationService';
import {
  LOCATION_UPDATE_INTERVAL,
  NOTIFICATION_REMINDER_INTERVAL,
} from '../config/constants';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const backgroundTask = async taskDataArguments => {
  const { delay } = taskDataArguments;
  let updateCount = 0;

  console.log('🚀 Background task started with delay:', delay, 'ms');

  await new Promise(async resolve => {
    while (BackgroundService.isRunning()) {
      try {
        updateCount++;
        console.log(
          `\n📍 Background update #${updateCount} at ${new Date().toLocaleTimeString()}`,
        );

        // Get current location
        console.log('Getting current location...');
        const position = await locationService.getCurrentLocation();

        const { latitude, longitude } = position.coords;
        const accuracy = position.coords.accuracy;

        console.log('✅ Location obtained:', {
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          accuracy: accuracy ? accuracy.toFixed(2) + 'm' : 'N/A',
        });

        // Send to server
        console.log('📤 Sending to server...');
        await locationAPI.updateLocation(latitude, longitude, accuracy);
        console.log('✅ Location sent successfully to server');

        // Update last update time
        await AsyncStorage.setItem('lastLocationUpdate', Date.now().toString());

        // Update notification with current status
        await BackgroundService.updateNotification({
          taskDesc: `Update #${updateCount} at ${new Date().toLocaleTimeString()}`,
        });

        console.log(`⏳ Waiting ${delay}ms before next update...\n`);
      } catch (error) {
        console.error('❌ Background task error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
        });

        // If app is killed or unable to send, notify user
        if (error.response?.status === 401 || error.code === 'ECONNABORTED') {
          notificationService.showErrorNotification(
            'Unable to send location update. Please open the app.',
          );
        }
      }

      await sleep(delay);
    }
  });
};

class BackgroundLocationService {
  async start() {
    console.log('🔧 BackgroundLocationService.start() called');
    console.log(
      'Current LOCATION_UPDATE_INTERVAL:',
      LOCATION_UPDATE_INTERVAL,
      'ms',
    );

    // Check if already running
    const isRunning = BackgroundService.isRunning();
    console.log('Is background service already running?', isRunning);

    if (isRunning) {
      console.log(
        '⚠️ Background service already running, stopping it first...',
      );
      await this.stop();
      await sleep(1000); // Wait a bit before restarting
    }

    const options = {
      taskName: 'CartSync Location Tracking',
      taskTitle: 'CartSync Active',
      taskDesc: 'Tracking cart location...',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#667eea',
      linkingURI: 'cartsync://',
      parameters: {
        delay: LOCATION_UPDATE_INTERVAL,
      },
    };

    console.log(
      '📋 Background service options:',
      JSON.stringify(options, null, 2),
    );

    try {
      console.log('🚀 Calling BackgroundService.start()...');
      await BackgroundService.start(backgroundTask, options);
      console.log('✅ BackgroundService.start() completed without error');

      // Verify it's actually running
      const nowRunning = BackgroundService.isRunning();
      console.log('Is it running now?', nowRunning);

      if (!nowRunning) {
        console.error(
          '⚠️ BackgroundService.start() succeeded but isRunning() returns false!',
        );
        return false;
      }

      console.log('✅ Background service confirmed running');
      return true;
    } catch (error) {
      console.error('❌ Error starting background service:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  async stop() {
    console.log('🛑 BackgroundLocationService.stop() called');

    try {
      const isRunning = BackgroundService.isRunning();
      console.log('Is service running before stop?', isRunning);

      if (!isRunning) {
        console.log('⚠️ Service not running, nothing to stop');
        return true;
      }

      await BackgroundService.stop();
      console.log('✅ Background service stopped successfully');

      // Verify it stopped
      const stillRunning = BackgroundService.isRunning();
      console.log('Is it still running?', stillRunning);

      return true;
    } catch (error) {
      console.error('❌ Error stopping background service:', error);
      console.error('Error details:', error.message);
      return false;
    }
  }

  isRunning() {
    const running = BackgroundService.isRunning();
    console.log('BackgroundLocationService.isRunning():', running);
    return running;
  }
}

const backgroundLocationService = new BackgroundLocationService();
export default backgroundLocationService;
