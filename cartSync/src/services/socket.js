import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';

class SocketService {
  constructor() {
    this.socket = null;
    this.cartId = null;
    this.connectionPromise = null;
  }

  connect(cartId) {
    // Return existing connection if already connected
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return Promise.resolve(this.socket);
    }

    // Return existing connection attempt if in progress
    if (this.connectionPromise) {
      console.log('Socket connection in progress');
      return this.connectionPromise;
    }

    this.cartId = cartId;

    console.log('Connecting to Socket.IO:', SOCKET_URL);

    // Create a promise that resolves when connected or rejects on error
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(SOCKET_URL, {
          transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          timeout: 10000,
          forceNew: false, // Reuse existing connection if available
        });

        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          console.log('Socket connection timeout');
          this.connectionPromise = null;
          resolve(this.socket); // Resolve anyway, connection will retry in background
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          console.log('Socket connected successfully:', this.socket.id);

          // Emit cart-connect event
          try {
            this.socket.emit('cart-connect', { cartId: this.cartId });
          } catch (emitError) {
            console.error('Error emitting cart-connect:', emitError);
          }

          this.connectionPromise = null;
          resolve(this.socket);
        });

        this.socket.on('disconnect', reason => {
          console.log('Socket disconnected:', reason);
          this.connectionPromise = null;
        });

        this.socket.on('connect_error', error => {
          console.error('Socket connection error:', error?.message || error);
          clearTimeout(connectionTimeout);
          this.connectionPromise = null;
          // Don't reject - allow the app to continue without socket
          resolve(null);
        });

        this.socket.on('error', error => {
          console.error('Socket error:', error?.message || error);
          // Don't crash, just log the error
        });
      } catch (error) {
        console.error('Error creating socket:', error);
        this.connectionPromise = null;
        resolve(null); // Resolve with null instead of rejecting
      }
    });

    return this.connectionPromise;
  }

  disconnect() {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.cartId = null;
        this.connectionPromise = null;
      }
    } catch (error) {
      console.error('Error disconnecting socket:', error);
    }
  }

  isConnected() {
    try {
      return this.socket?.connected || false;
    } catch (error) {
      console.error('Error checking socket connection:', error);
      return false;
    }
  }

  emit(event, data) {
    try {
      if (this.socket?.connected) {
        this.socket.emit(event, data);
        return true;
      } else {
        console.log('Socket not connected, cannot emit:', event);
        return false;
      }
    } catch (error) {
      console.error('Error emitting socket event:', error);
      return false;
    }
  }
}

const socketService = new SocketService();
export default socketService;
