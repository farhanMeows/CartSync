import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      hasAuth: !!config.headers.Authorization,
    });
    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  error => {
    if (error.response) {
      // Server responded with error
      console.error('❌ API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      // Request made but no response
      console.error('❌ API No Response:', {
        message: error.message,
        url: error.config?.url,
      });
    } else {
      // Error setting up request
      console.error('❌ API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (cartId, password) =>
    api.post('/auth/cart/login', { cartId, password }),

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'cart']);
  },
};

// Location API
export const locationAPI = {
  updateLocation: (latitude, longitude, accuracy) =>
    api.post('/location/update', {
      latitude,
      longitude,
      accuracy,
    }),
};

export default api;
