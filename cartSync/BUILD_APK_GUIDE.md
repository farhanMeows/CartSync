# Building Android APK for CartSync Mobile App

## Prerequisites

Before building the APK, ensure you have:

1. ✅ **Node.js** installed (already have)
2. ✅ **React Native CLI** installed
3. ⚠️ **Java Development Kit (JDK) 17** or higher
4. ⚠️ **Android Studio** with Android SDK
5. ⚠️ **Android SDK Platform 34** (Android 14)

---

## Quick Setup Check

### 1. Check Java Version

```bash
java -version
```

**Required**: Java 17 or higher

If not installed:
```bash
# macOS (using Homebrew)
brew install openjdk@17

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 2. Check Android SDK

```bash
echo $ANDROID_HOME
```

Should show: `/Users/YOUR_USERNAME/Library/Android/sdk`

If not set:
```bash
# Add to ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload
source ~/.zshrc
```

---

## Step 1: Install Android Studio (if not already installed)

1. Download from: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio → More Actions → SDK Manager
4. Install:
   - ✅ Android SDK Platform 34
   - ✅ Android SDK Build-Tools 34.0.0
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator

---

## Step 2: Prepare the Mobile App

### Navigate to Mobile Directory

```bash
cd "/Users/master/Developer/khatakhat cart app/mobile/cartsync"
```

### Install Dependencies

```bash
npm install
```

### Update Backend Connection

The app is already configured to connect to your backend at:
- **API URL**: `http://192.168.141.150:5001`

**Important**: Make sure your phone/device is on the **same Wi-Fi network** as your Mac!

---

## Step 3: Build the APK

### Option A: Debug APK (Quick - Recommended for Testing)

This is the fastest way to build and test:

```bash
cd android
./gradlew assembleDebug
```

**APK Location**: 
```
mobile/cartsync/android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Release APK (Production)

For production release:

1. **Generate Keystore** (first time only):

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore cartsync-release-key.keystore -alias cartsync-key-alias -keyalg RSA -keysize 2048 -validity 10000

# You'll be asked:
# - Password: (enter a secure password, e.g., "cartsync2025")
# - Name: CartSync
# - Organizational unit: Development
# - Organization: CartSync
# - City/Locality: Your City
# - State/Province: Your State
# - Country Code: IN (for India)
```

2. **Configure Gradle for Signing**:

Create/edit `android/gradle.properties`:

```properties
CARTSYNC_UPLOAD_STORE_FILE=cartsync-release-key.keystore
CARTSYNC_UPLOAD_KEY_ALIAS=cartsync-key-alias
CARTSYNC_UPLOAD_STORE_PASSWORD=cartsync2025
CARTSYNC_UPLOAD_KEY_PASSWORD=cartsync2025
```

3. **Update `android/app/build.gradle`** (add signing config):

Find the `android { ... }` block and add:

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('CARTSYNC_UPLOAD_STORE_FILE')) {
                storeFile file(CARTSYNC_UPLOAD_STORE_FILE)
                storePassword CARTSYNC_UPLOAD_STORE_PASSWORD
                keyAlias CARTSYNC_UPLOAD_KEY_ALIAS
                keyPassword CARTSYNC_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
```

4. **Build Release APK**:

```bash
cd android
./gradlew assembleRelease
```

**APK Location**: 
```
mobile/cartsync/android/app/build/outputs/apk/release/app-release.apk
```

---

## Step 4: Install APK on Your Phone

### Method 1: Via USB Cable (Recommended)

1. **Enable Developer Options** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect phone via USB**

3. **Verify connection**:
```bash
adb devices
```

Should show your device.

4. **Install APK**:
```bash
# For Debug APK
adb install mobile/cartsync/android/app/build/outputs/apk/debug/app-debug.apk

# For Release APK
adb install mobile/cartsync/android/app/build/outputs/apk/release/app-release.apk
```

### Method 2: Transfer APK File

1. **Copy APK to your phone** via:
   - AirDrop (if supported)
   - Google Drive
   - WhatsApp (send to yourself)
   - USB file transfer

2. **On your phone**:
   - Open the APK file
   - Allow "Install from unknown sources" if prompted
   - Tap "Install"

---

## Step 5: Configure Backend for Network Access

Your backend needs to allow connections from your phone:

### Update Backend CORS

Edit `backend/.env`:

```env
CORS_ORIGIN=*
```

Or specifically allow your network:

```env
CORS_ORIGIN=http://192.168.141.150:3000,http://localhost:3000
```

### Restart Backend

```bash
# Stop current backend (Ctrl+C)
# Start again
cd backend
npm run dev
```

### Make Sure Backend is Accessible

Test from your Mac:

```bash
curl http://192.168.141.150:5001/api/carts
```

Should return cart data.

---

## Step 6: Test the Mobile App

### 1. Open CartSync App on Phone

### 2. Login with Cart Credentials

- **Cart ID**: `cart001`
- **Password**: `qwerty`

Or:

- **Cart ID**: `cart002`
- **Password**: `qwerty`

### 3. Grant Location Permissions

When prompted, allow:
- ✅ Location access (Always/While using the app)
- ✅ Background location access
- ✅ Notification permissions

### 4. Start Tracking

- Tap "Start Location Updates"
- Walk around with your phone
- Check the dashboard at `http://localhost:3000` to see your real-time location!

---

## Quick Build & Install Script

Save this as `mobile/cartsync/build-and-install.sh`:

```bash
#!/bin/bash

echo "🚀 CartSync - Building and Installing APK"
echo ""

# Navigate to android directory
cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build debug APK
echo "📦 Building debug APK..."
./gradlew assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    
    # Check if device is connected
    if adb devices | grep -q "device$"; then
        echo "📱 Device found, installing APK..."
        adb install -r app/build/outputs/apk/debug/app-debug.apk
        
        if [ $? -eq 0 ]; then
            echo "✅ APK installed successfully!"
            echo ""
            echo "🎉 You can now open CartSync on your phone"
        else
            echo "❌ Failed to install APK"
        fi
    else
        echo "⚠️  No device connected via USB"
        echo ""
        echo "📍 APK Location:"
        echo "   $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
        echo ""
        echo "Transfer this file to your phone and install manually"
    fi
else
    echo "❌ Build failed"
    exit 1
fi
```

Make it executable and run:

```bash
chmod +x mobile/cartsync/build-and-install.sh
cd "/Users/master/Developer/khatakhat cart app/mobile/cartsync"
./build-and-install.sh
```

---

## Troubleshooting

### Build Fails - JDK Version Issue

```bash
# Check Java version
java -version

# Should be 17 or higher
# If not, install:
brew install openjdk@17
```

### Build Fails - SDK Not Found

```bash
# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Verify
echo $ANDROID_HOME
```

### "Unable to connect to backend"

1. **Check backend is running**:
   ```bash
   curl http://192.168.141.150:5001/api/carts
   ```

2. **Check firewall**: Make sure macOS firewall allows Node.js connections

3. **Verify same Wi-Fi**: Phone and Mac must be on same network

4. **Try different IP**: If IP changed, update `src/config/constants.js`

### "Location permissions denied"

- Go to Phone Settings → Apps → CartSync
- Enable Location → "Allow all the time"
- Enable Physical Activity (for background tracking)

### App Crashes on Startup

```bash
# View logs
adb logcat | grep ReactNative
```

---

## Next Steps After Testing

1. ✅ Test cart login
2. ✅ Enable location tracking
3. ✅ Walk around and verify location updates on dashboard
4. ✅ Test notifications
5. ✅ Test background tracking
6. 🎯 Build release APK for production

---

## Need Help?

Common issues:

1. **JDK not installed**: `brew install openjdk@17`
2. **Android Studio not installed**: Download from android.com/studio
3. **Gradle build failed**: Run `./gradlew clean` then try again
4. **ADB not found**: Install Android Studio SDK platform-tools

---

**Current Configuration:**
- Backend: `http://192.168.141.150:5001`
- Dashboard: `http://localhost:3000`
- Cart Credentials: `cart001` / `qwerty` or `cart002` / `qwerty`
