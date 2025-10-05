# 🔐 Google OAuth Setup for AsTrade Mobile

## 📋 Overview

This guide will help you configure Google OAuth for both web and mobile platforms in AsTrade.

## 🚀 Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one you use for Cavos)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**

### 1.2 Web Application Credentials

1. Select **Web application**
2. Configure:
   - **Name**: `AsTrade Web`
   - **Authorized JavaScript origins**: 
     - `http://localhost:8081`
     - `https://your-production-domain.com`
   - **Authorized redirect URIs**:
     - `http://localhost:8081/callback`
     - `https://your-production-domain.com/callback`

### 1.3 Android Application Credentials

1. Select **Android**
2. Configure:
   - **Package name**: `com.astrade.app`
   - **SHA-1 fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8F:AB:C6:A4`

### 1.4 iOS Application Credentials

1. Select **iOS**
2. Configure:
   - **Bundle ID**: `com.astrade.app`

## 🔧 Step 2: Environment Variables

Add these variables to your `.env` file:

```bash
# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id_here
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here
```

## 📱 Step 3: Mobile Configuration

### 3.1 Update app.json

Your `app.json` should include:

```json
{
  "expo": {
    "scheme": "astrade",
    "ios": {
      "bundleIdentifier": "com.astrade.app",
      "config": {
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      }
    },
    "android": {
      "package": "com.astrade.app",
      "config": {
        "googleSignIn": {
          "apiKey": "YOUR_ANDROID_API_KEY",
          "certificateHash": "5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8F:AB:C6:A4"
        }
      }
    },
    "plugins": [
      [
        "expo-auth-session",
        {
          "scheme": "astrade"
        }
      ]
    ]
  }
}
```

### 3.2 Install Dependencies

```bash
bun add expo-auth-session expo-crypto
```

## 🧪 Step 4: Testing

### 4.1 Web Testing

1. Start the development server: `bun run dev`
2. Open `http://localhost:8081/login`
3. Click "Continue with Google"
4. Complete the OAuth flow

### 4.2 Mobile Testing

1. Build for development: `bun run dev`
2. Scan QR code with Expo Go
3. Test Google Sign-In on device

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check that your Client IDs are correct
2. **"Redirect URI mismatch"**: Verify redirect URIs in Google Cloud Console
3. **"Package name mismatch"**: Ensure package name matches in app.json and Google Cloud Console

### Debug Steps

1. Check console logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test with the debug panel at `/debug-auth`

## 📚 Additional Resources

- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Google Sign-In](https://docs.expo.dev/versions/latest/sdk/google-sign-in/)

## 🎯 Next Steps

After setting up Google OAuth:

1. Integrate with Cavos SDK for wallet creation
2. Test user creation in backend
3. Implement session persistence
4. Add Apple Sign-In for iOS 