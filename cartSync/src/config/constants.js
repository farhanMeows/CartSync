// API Configuration
// Use your computer's local IP for real device testing
export const API_URL = 'http://192.168.141.150:5001'; // Real device (UPDATE if IP changes)
// export const API_URL = 'http://10.0.2.2:5001'; // Android emulator
// export const API_URL = 'http://localhost:5001'; // iOS simulator

export const SOCKET_URL = API_URL;

// Location update interval (3 seconds)
export const LOCATION_UPDATE_INTERVAL = 30000;

// Notification reminder interval (30 seconds for testing)
export const NOTIFICATION_REMINDER_INTERVAL = 30 * 1000; // 30 seconds

// Location options
export const LOCATION_OPTIONS = {
  accuracy: {
    android: 'high',
    ios: 'best',
  },
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
  distanceFilter: 10, // Update when moved 10 meters
  forceRequestLocation: true,
  forceLocationManager: false,
  showLocationDialog: true,
};
