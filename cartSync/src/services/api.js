import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../config/constants';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (cartId, password) =>
    api.post('/auth/cart/login', {cartId, password}),
  
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
