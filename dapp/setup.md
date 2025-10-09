# AsTrade - Space Trading App

Welcome to AsTrade! This is a React Native app built with Expo that includes Supabase authentication.

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API in your Supabase dashboard
3. Copy your Project URL and anon public key

### 2. Environment Configuration

Create a `.env` file in the root directory with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Or update `lib/supabase.ts` directly with your credentials.

### 3. npm Configuration

The project has a `.npmrc` file configured with `legacy-peer-deps=true` to handle React 19 compatibility conflicts with some dependencies (lucide-react-native).

This file is already created, but if you delete it or work in another environment, you'll need to recreate it:

```bash
echo "legacy-peer-deps=true" > .npmrc
```

### 4. Authentication Setup

The app includes:
- **Login/Signup Screen**: Complete authentication flow
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Context**: Global authentication state management
- **Logout Functionality**: Available in the profile tab

### 5. Running the App

```bash
npm install
npm run dev
```

## Features

- 🚀 Modern UI with space theme
- 🔐 Complete Supabase authentication
- 📱 Tab-based navigation
- 🛡️ Protected routes
- 👤 User profile management
- 🎨 Beautiful gradients and animations

## Authentication Flow

1. **Unauthenticated users** are redirected to the login screen
2. **Login/Signup** with email and password
3. **Automatic session management** with AsyncStorage
4. **Protected app access** after successful authentication
5. **Logout** functionality in profile settings
