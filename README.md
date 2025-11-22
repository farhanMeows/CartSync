# CartSync - Real-Time Cart Tracking System

A comprehensive solution for tracking and monitoring moving physical carts (vendors) in real-time. The system consists of three main components: Backend Server, Admin Dashboard, and Mobile App for cart owners.

## 🎯 Project Overview

CartSync enables administrators to monitor multiple carts on a real-time map while cart owners share their location through a mobile app. Perfect for food carts, mobile vendors, delivery vehicles, or any moving asset that needs tracking.

## 📋 Components

### 1. Backend Server (`/backend`)

- **Technology**: Node.js, Express, Socket.IO, PostgreSQL
- **Purpose**: Handle authentication, receive location updates, maintain state, broadcast real-time updates
- **Features**:
  - JWT authentication for carts and admins
  - Real-time location updates via Socket.IO
  - Location history with PostgreSQL persistence
  - Automatic online/offline status detection
  - RESTful API for cart management

### 2. Admin Dashboard (`/dashboard`)

- **Technology**: React, Vite, Leaflet Maps, Socket.IO Client
- **Purpose**: Web interface for administrators to view and manage carts
- **Features**:
  - Interactive map showing all cart locations
  - Real-time online/offline status indicators
  - Create, edit, and delete carts
  - View location history
  - Responsive design for desktop and mobile

### 3. Mobile App (`/mobile/cartsync`)

- **Technology**: React Native CLI, Socket.IO Client
- **Purpose**: Mobile app for cart owners to share location
- **Features**:
  - Secure cart owner authentication
  - Background location tracking (every 30 seconds)
  - Foreground and background operation
  - Periodic notification reminders (every 30 minutes)
  - Manual location update option
  - Persistent login state

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+ (via Docker or local installation)
- **Docker** (recommended for PostgreSQL)
- **React Native** development environment (for mobile app)
- **Android Studio** or **Xcode** (for mobile app)

### 1. Setup Backend

```bash
cd backend

# Start PostgreSQL with Docker
docker-compose up -d

# Install dependencies and setup
npm install
cp .env.example .env
# Edit .env with your settings (default values work for Docker setup)

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5001`

### 2. Setup Admin Dashboard

```bash
cd dashboard
npm install
# Edit .env to point to your backend
npm run dev
```

Dashboard will open at `http://localhost:3000`

### 3. Setup Mobile App

```bash
cd cartSync
npm install

# For Android
npx react-native run-android

# For iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

## 📖 Detailed Setup

### Backend Setup

1. **Install PostgreSQL with Docker** (Recommended):

   ```bash
   # Start PostgreSQL container
   cd backend
   docker-compose up -d
   
   # Verify PostgreSQL is running
   docker ps
   ```

   **Or install PostgreSQL locally**:

   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Configure Environment**:
   Edit `backend/.env`:

   ```env
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=cartsync
   DB_PASSWORD=cartsync123
   DB_NAME=cartsync_db
   
   # JWT Configuration
   JWT_SECRET=your-secret-key-here-change-in-production
   
   # Admin Credentials
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   
   # Server Configuration
   PORT=5001
   NODE_ENV=development
   ```

3. **Initialize Database**:

   ```bash
   cd backend
   npm install
   
   # Run migrations to create tables
   npm run migrate
   ```

4. **Start Server**:

   ```bash
   npm run dev
   ```

5. **Verify**:
   - Open `http://localhost:5001`
   - You should see the API status message
   - Check terminal for "✅ Database connected successfully"

### Dashboard Setup

1. **Configure Backend URL**:
   Edit `dashboard/.env`:

   ```env
   VITE_API_URL=http://localhost:5001
   VITE_SOCKET_URL=http://localhost:5001
   ```

2. **Start Dashboard**:

   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

3. **Login**:
   - Open `http://localhost:3000`
   - Login with: `admin` / `admin123`

### Mobile App Setup

1. **Configure Backend URL**:
   Edit `cartSync/src/config/constants.js`:

   ```javascript
   // For Android Emulator
   export const API_URL = "http://10.0.2.2:5001";

   // For iOS Simulator
   // export const API_URL = 'http://localhost:5001';

   // For Real Device (Change to your computer's local IP)
   // export const API_URL = 'http://192.168.1.XXX:5001';
   ```

2. **Run App**:

   ```bash
   cd cartSync
   npm install

   # Android
   npx react-native run-android

   # iOS
   cd ios && pod install && cd ..
   npx react-native run-ios
   ```

## 🎮 Usage Flow

### For Administrators

1. **Login to Dashboard**

   - Open dashboard at `http://localhost:3000`
   - Login with admin credentials

2. **Create Cart**

   - Click "Create New Cart"
   - Enter Cart ID (e.g., `cart001`)
   - Set password for cart owner
   - Add optional name and description
   - Click "Create"

3. **View Carts**

   - All carts appear in the left sidebar
   - Green dot = online, Grey dot = offline
   - Click cart to center map on its location
   - View last seen time and coordinates

4. **Manage Carts**
   - Edit: Update cart details
   - Delete: Remove cart from system
   - Real-time updates appear automatically

### For Cart Owners

1. **Get Credentials**

   - Receive Cart ID and password from admin

2. **Login to Mobile App**

   - Open CartSync mobile app
   - Enter Cart ID and password
   - Tap "Login"

3. **Start Tracking**

   - Toggle "Location Tracking" to ON
   - Grant location permissions (Always)
   - App starts sending location every 30 seconds

4. **Background Operation**

   - Keep app running in background
   - Persistent notification shows status
   - Reminders every 30 minutes
   - Location updates continue automatically

5. **Manual Update**
   - Tap "Update Location Now" for immediate update

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CartSync System                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐      ┌──────────────────┐            │
│  │  Mobile App     │      │  Admin Dashboard │            │
│  │  (React Native) │      │     (React)      │            │
│  └────────┬────────┘      └────────┬─────────┘            │
│           │                         │                       │
│           │  Location Updates       │  View/Manage         │
│           │  Socket.IO              │  Socket.IO           │
│           │                         │                       │
│           └───────────┬─────────────┘                      │
│                       │                                     │
│                       ▼                                     │
              ┌─────────────────┐                           │
              │  Backend Server │                           │
              │  (Node.js/Express)│                         │
              │  + Socket.IO    │                           │
              └────────┬────────┘                           │
                       │                                     │
                       ▼                                     │
              ┌─────────────────┐                           │
              │   PostgreSQL    │                           │
              │   (Database)    │                           │
│              └─────────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📡 Communication Flow

1. **Cart Owner Login**:

   - Mobile app → Backend: POST `/api/auth/cart/login`
   - Backend returns JWT token
   - Mobile app stores token and connects to Socket.IO

2. **Location Update**:

   - Mobile app gets GPS coordinates
   - Mobile app → Backend: POST `/api/location/update`
   - Backend saves to database
   - Backend → All dashboards: Socket.IO `location-update` event

3. **Admin Dashboard**:
   - Dashboard connects via Socket.IO
   - Receives real-time `location-update` events
   - Updates map markers automatically
   - Shows online/offline status

## 🔒 Security

- **JWT Authentication**: Separate tokens for carts and admins
- **Password Hashing**: bcrypt with salt rounds
- **Protected Routes**: Middleware for authentication
- **CORS**: Configurable origins
- **Environment Variables**: Sensitive data in .env files

## 🛠️ Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Dashboard

- **React 18** - UI library
- **Vite** - Build tool
- **Leaflet** - Maps
- **Socket.IO Client** - Real-time updates
- **Axios** - HTTP client
- **React Router** - Navigation

### Mobile App

- **React Native** - Mobile framework
- **React Navigation** - App navigation
- **Socket.IO Client** - Real-time connection
- **Geolocation Service** - GPS tracking
- **Background Actions** - Background tasks
- **Push Notifications** - Notifications
- **AsyncStorage** - Local storage

## 📝 Configuration

### Backend `.env`

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cartsync
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000
```

### Dashboard `.env`

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Mobile `constants.js`

```javascript
export const API_URL = "http://10.0.2.2:5000";
export const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
export const NOTIFICATION_REMINDER_INTERVAL = 30 * 60 * 1000; // 30 minutes
```

## 🧪 Testing

### Test Backend

```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Create a cart
curl -X POST http://localhost:5000/api/carts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"cartId":"cart001","password":"test123","name":"Test Cart"}'
```

### Test Dashboard

1. Login with admin/admin123
2. Create a test cart
3. Open browser console to see Socket.IO events

### Test Mobile App

1. Create cart in dashboard
2. Login to mobile app with cart credentials
3. Start location tracking
4. Check dashboard shows cart location
5. Minimize app and verify background updates

## 🚀 Deployment

### Backend

- Deploy to: Heroku, AWS, DigitalOcean, Railway
- Use MongoDB Atlas for cloud database
- Set environment variables in hosting platform
- Enable CORS for your dashboard domain

### Dashboard

- Build: `npm run build`
- Deploy `dist/` folder to: Netlify, Vercel, AWS S3
- Update API URLs for production

### Mobile App

- **Android**: Build APK or App Bundle
- **iOS**: Archive and upload to App Store
- Update API URLs to production backend

## 📋 Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS on backend
- [ ] Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.) in production
- [ ] Configure proper CORS origins
- [ ] Set up backend monitoring
- [ ] Test on real devices (Android & iOS)
- [ ] Test background tracking for extended periods
- [ ] Configure push notification certificates (iOS)
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Create app store listings
- [ ] Prepare privacy policy
- [ ] Test with poor network conditions

## � Database Schema (PostgreSQL)

### Carts Table

```sql
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    cart_id VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Location History Table

```sql
CREATE TABLE location_history (
    id SERIAL PRIMARY KEY,
    cart_id VARCHAR(255) REFERENCES carts(cart_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cart_timestamp (cart_id, timestamp)
);
```

### Features

- ✅ **Carts**: Store cart credentials and metadata
- ✅ **Location History**: Track all location updates with timestamps
- ✅ **Indexes**: Optimized for fast queries by cart_id and timestamp
- ✅ **Foreign Keys**: Maintain referential integrity
- ✅ **Auto-increment IDs**: Serial primary keys
- ✅ **Timestamps**: Automatic created_at/updated_at tracking

## �🐛 Troubleshooting

### Backend Issues

- **PostgreSQL connection failed**: 
  - Check Docker container is running: `docker ps`
  - Verify credentials in `.env` match `docker-compose.yml`
  - Check port 5433 is not in use: `lsof -i :5433`
- **CORS errors**: Update CORS_ORIGIN in .env
- **Port already in use**: Change PORT in .env
- **Database migration errors**: Drop and recreate database:
  ```bash
  docker-compose down -v
  docker-compose up -d
  npm run migrate
  ```

### Dashboard Issues

- **Can't connect to backend**: Check VITE_API_URL
- **Map not showing**: Check browser console for Leaflet errors
- **No real-time updates**: Check Socket.IO connection status

### Mobile App Issues

- **Location not updating**: Check location permissions (Always)
- **Background tracking stops**: Disable battery optimization
- **Can't connect**: Use correct IP for real device
- **Build errors**: Clean build folders and rebuild

## 📞 Support

For issues:

1. Check the README in each component folder
2. Review troubleshooting sections
3. Check logs in backend/dashboard/mobile app
4. Ensure all prerequisites are installed

## 📄 License

MIT License - Feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🎉 Features to Add (Future)

- [ ] Historical route playback
- [ ] Geofencing alerts
- [ ] Multiple admin accounts with roles
- [ ] Cart groups/categories
- [ ] Speed and distance analytics
- [ ] Export location data (CSV/JSON)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA) for dashboard
- [ ] WhatsApp/SMS alerts

---

**Built with ❤️ for cart tracking and vendor management**
