import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { LOCATION_OPTIONS } from '../config/constants';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        // First request foreground location permission
        const fineLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'CartSync needs access to your location to track your cart.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (fineLocationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Fine location permission denied');
          Alert.alert(
            'Permission Required',
            'Location permission is required for cart tracking.',
          );
          return false;
        }

        console.log('Fine location permission granted');

        // Request background location for Android 10+ (API 29+)
        if (Platform.Version >= 29) {
          const backgroundGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message:
                'CartSync needs background location access to track your cart even when the app is closed.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (backgroundGranted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Background location permission denied');
            Alert.alert(
              'Limited Permission',
              'Background location not granted. Tracking will only work when app is open.',
            );
            // Still return true as we have foreground permission
          } else {
            console.log('Background location permission granted');
          }
        }

        return true;
      } catch (error) {
        console.error('Permission request error:', error);
        Alert.alert('Error', 'Failed to request location permissions');
        return false;
      }
    }

    // iOS permissions are handled in Info.plist
    return true;
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          this.currentLocation = position;
          resolve(position);
        },
        error => {
          console.error('Get location error:', error);
          reject(error);
        },
        LOCATION_OPTIONS,
      );
    });
  }

  startWatchingLocation(callback) {
    this.watchId = Geolocation.watchPosition(
      position => {
        this.currentLocation = position;
        callback(position);
      },
      error => {
        console.error('Watch location error:', error);
      },
      LOCATION_OPTIONS,
    );

    return this.watchId;
  }

  stopWatchingLocation() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getLastKnownLocation() {
    return this.currentLocation;
  }
}

const locationService = new LocationService();
export default locationService;
