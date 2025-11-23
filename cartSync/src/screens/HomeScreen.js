import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, locationAPI } from '../services/api';
import locationService from '../services/locationService';
import backgroundLocationService from '../services/backgroundService';
import socketService from '../services/socket';
import notificationService from '../services/notificationService';
import reminderService from '../services/reminderService';
import nativeReminderService from '../services/nativeReminderService';
import CustomAlert from '../components/CustomAlert';

const HomeScreen = ({ navigation }) => {
  const [cart, setCart] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Custom alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const showAlert = (title, message, type = 'info', buttons = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    loadCartData();
    checkTrackingStatus();
    requestLocationPermissions(); // Request permissions on mount

    // Start JS reminder service (works when app is running)
    reminderService.start();

    // Schedule native reminder (works even when app is killed)
    // Checks every 40 minutes during working hours (7 AM - 5 PM)
    nativeReminderService.scheduleReminder(40);

    return () => {
      // Cleanup on unmount
      locationService.stopWatchingLocation();
      reminderService.stop();
      // Keep native reminder running even after unmount
    };
  }, []);

  const requestLocationPermissions = async () => {
    try {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        showAlert(
          'Location Permission Required',
          'CartSync needs location access to track your cart. Please grant location permission in the next dialog.',
          'warning',
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const loadCartData = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setCart(parsedCart);

        // Connect to socket (don't wait for it, let it connect in background)
        socketService
          .connect(parsedCart.cartId)
          .then(() => {
            console.log('Socket connection established');
          })
          .catch(error => {
            console.error('Socket connection failed:', error);
          });
      }

      const lastUpdateTime = await AsyncStorage.getItem('lastLocationUpdate');
      if (lastUpdateTime) {
        setLastUpdate(new Date(parseInt(lastUpdateTime)));
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
      showAlert('Error', 'Failed to load cart data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkTrackingStatus = async () => {
    const isRunning = backgroundLocationService.isRunning();
    setIsTracking(isRunning);
  };

  const handleStartTracking = async () => {
    try {
      console.log('Starting tracking...');

      // Request location permissions
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        showAlert(
          'Permission Required',
          'Location permission is required to track your cart. Please enable location access in Settings > Apps > CartSync > Permissions.',
          'warning',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              style: 'default',
              onPress: () => {
                showAlert(
                  'Enable Location',
                  'Go to: Settings > Apps > CartSync > Permissions > Location > Allow all the time',
                  'info',
                );
              },
            },
          ],
        );
        return;
      }

      // Get initial location
      console.log('Getting current location...');
      const position = await locationService.getCurrentLocation();
      console.log('Location obtained:', position.coords);
      setCurrentLocation(position.coords);

      // Send initial location update
      console.log('Sending location to server...');
      try {
        await locationAPI.updateLocation(
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy,
        );
        console.log('Location sent successfully');
      } catch (apiError) {
        console.error('Failed to send location to server:', apiError);
        // Continue anyway - we can retry later
      }

      // Start background service
      console.log('🚀 Attempting to start background service...');
      console.log('Background service config:', {
        interval: '3000ms (3 seconds)',
        taskName: 'CartSync Location Tracking',
      });

      const started = await backgroundLocationService.start();
      console.log('Background service start result:', started);

      if (started) {
        console.log('✅ Background service started successfully!');
        console.log('📍 Location updates should now happen every 3 seconds');

        setIsTracking(true);
        setLastUpdate(new Date());
        await AsyncStorage.setItem('lastLocationUpdate', Date.now().toString());

        notificationService.showLocationUpdateNotification();
        showAlert(
          'Success',
          'Location tracking started - Updates every 30 seconds',
          'success',
        );
        console.log('Tracking started successfully');
      } else {
        console.error(
          '❌ Failed to start background service - service returned false',
        );
        console.log(
          'This means background updates will NOT happen automatically',
        );
        showAlert('Error', 'Failed to start location tracking', 'error');
      }
    } catch (error) {
      console.error('Error starting tracking:', error);

      // Check if it's a location permission error
      if (error.message && error.message.includes('permission')) {
        showAlert(
          'Location Permission Denied',
          'Please enable location permission in Settings to use this feature.',
          'error',
        );
      } else {
        showAlert(
          'Error',
          'Failed to start tracking: ' + (error.message || 'Unknown error'),
          'error',
        );
      }
    }
  };

  const handleStopTracking = async () => {
    showAlert(
      'Stop Tracking',
      'Are you sure you want to stop sharing your location?',
      'confirm',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              await backgroundLocationService.stop();
              locationService.stopWatchingLocation();
              setIsTracking(false);
              notificationService.cancelAll();
              showAlert('Stopped', 'Location tracking stopped', 'success');
            } catch (error) {
              console.error('Error stopping tracking:', error);
              showAlert('Error', 'Failed to stop tracking', 'error');
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    showAlert(
      'Logout',
      'Are you sure you want to logout? Location tracking will be stopped.',
      'confirm',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isTracking) {
                await backgroundLocationService.stop();
                locationService.stopWatchingLocation();
              }

              socketService.disconnect();
              await authAPI.logout();
              notificationService.cancelAll();

              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CartSync</Text>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              isTracking ? styles.statusOnline : styles.statusOffline,
            ]}
          />
          <Text style={styles.statusText}>
            {isTracking ? 'Sharing Location' : 'Not Sharing'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cart Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cart ID:</Text>
          <Text style={styles.infoValue}>{cart?.cartId}</Text>
        </View>
        {cart?.name && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{cart?.name}</Text>
          </View>
        )}
        {cart?.description && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Description:</Text>
            <Text style={styles.infoValue}>{cart?.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location Tracking</Text>

        {/* Main Toggle Button */}
        <TouchableOpacity
          style={[
            styles.trackingToggleButton,
            isTracking ? styles.trackingActive : styles.trackingInactive,
          ]}
          onPress={isTracking ? handleStopTracking : handleStartTracking}
          activeOpacity={0.8}
        >
          <View style={styles.toggleButtonContent}>
            <View style={styles.toggleIconContainer}>
              <Text style={styles.toggleIcon}>{isTracking ? '📍' : '📍'}</Text>
            </View>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleStatus}>
                {isTracking ? 'TRACKING ACTIVE' : 'START TRACKING'}
              </Text>
              <Text style={styles.toggleSubtext}>
                {isTracking
                  ? 'Tap to stop location sharing'
                  : 'Tap to start sharing your location'}
              </Text>
            </View>
            <View
              style={[
                styles.toggleIndicator,
                isTracking ? styles.indicatorActive : styles.indicatorInactive,
              ]}
            >
              <Text style={styles.indicatorText}>
                {isTracking ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {isTracking && (
          <View style={styles.trackingInfo}>
            <Text style={styles.trackingStatus}>
              ✓ Location updates every 30 seconds
            </Text>
          </View>
        )}

        {lastUpdate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Update:</Text>
            <Text style={styles.infoValue}>{lastUpdate.toLocaleString()}</Text>
          </View>
        )}

        {currentLocation && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Latitude:</Text>
              <Text style={styles.infoValue}>
                {currentLocation.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Longitude:</Text>
              <Text style={styles.infoValue}>
                {currentLocation.longitude.toFixed(6)}
              </Text>
            </View>
            {currentLocation.accuracy && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Accuracy:</Text>
                <Text style={styles.infoValue}>
                  ±{currentLocation.accuracy.toFixed(1)}m
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Information</Text>
        <Text style={styles.infoText}>
          • Keep the app running in the background for continuous tracking
        </Text>
        <Text style={styles.infoText}>
          • You'll receive reminder notifications every 40 minutes during work
          hours (7 AM - 5 PM)
        </Text>
        <Text style={styles.infoText}>
          • Location updates are sent automatically every 30 seconds
        </Text>
        <Text style={styles.infoText}>
          • Make sure location services are enabled
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onDismiss={hideAlert}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#27ae60',
  },
  statusOffline: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackingToggleButton: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  trackingActive: {
    backgroundColor: '#27ae60',
  },
  trackingInactive: {
    backgroundColor: '#95a5a6',
  },
  toggleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 28,
  },
  toggleTextContainer: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  toggleStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  toggleSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  toggleIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  indicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trackingInfo: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  trackingStatus: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
