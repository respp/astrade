import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { WalletProvider } from '../contexts/WalletContext';

function RootLayoutNav() {
  const { authenticated, loading, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);
  const lastAuthState = useRef({ authenticated, userId });

  // Handle deep links for authentication callbacks
  useEffect(() => {
    const handleDeepLink = (url: string) => {
  
      
      // Check if this is an authentication callback
      if (url.includes('astrade://callback')) {
        console.log('✅ Authentication callback detected via deep link');
        
        // Extract the path and query parameters
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;
        
        // Navigate to callback screen with parameters
        const params = Object.fromEntries(searchParams.entries());
        console.log('📍 Navigating to callback with params:', params);
        
        router.push({
          pathname: '/callback' as any,
          params: params
        });
      }
    };

    // Listen for initial URL (when app is opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL:', url);
        handleDeepLink(url);
      }
    });

    // Listen for URL changes (when app is already open)
    const subscription = Linking.addEventListener('url', (event) => {
  
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, [router]);

  useEffect(() => {
    if (loading) {
      console.log('🔄 Root: Still loading, waiting...')
      return; // Wait for auth to load
    }

    const inAuthGroup = segments[0] === '(tabs)';
    const inLogin = segments[0] === 'login';
    const inTestAuth = (segments[0] as any) === 'test-auth';
    const inCallback = (segments[0] as any) === 'callback';
    const hasNoRoute = (segments as any).length === 0 || (segments[0] as any) === '';

    console.log('🔄 Root: Checking navigation', {
      authenticated,
      userId,
      inAuthGroup,
      inLogin,
      inTestAuth,
      inCallback,
      hasNoRoute,
      segments: segments.join('/'),
      hasNavigated: hasNavigated.current,
      currentUrl: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : 'mobile-app'
    });

    // Don't redirect if we're processing a callback
    if (inCallback) {
      console.log('🔄 Root: In callback screen, allowing processing...');
      return;
    }

    // Handle unauthenticated users - redirect to login
    if (!authenticated && !userId && (inAuthGroup || hasNoRoute)) {
      console.log('🔄 Root: Redirecting unauthenticated user to login');
      try {
        router.replace('/login');
        console.log('✅ Root: Navigation to login successful');
      } catch (error) {
        console.error('❌ Root: Navigation to login failed:', error);
      }
      return;
    }

    // Handle authenticated users on login page - redirect to main app
    if ((authenticated || userId) && (inLogin || hasNoRoute)) {
      console.log('🔄 Root: Redirecting authenticated user to main app');
      try {
        router.replace('/(tabs)');
        console.log('✅ Root: Navigation to main app successful');
      } catch (error) {
        console.error('❌ Root: Navigation to main app failed:', error);
        // Fallback: try window.location (web only)
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
      return;
    }

    // Update last auth state
    lastAuthState.current = { authenticated, userId };
  }, [authenticated, loading, segments, userId, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="callback" options={{ headerShown: false }} />
      <Stack.Screen name="test-deep-link" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <WalletProvider>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AuthProvider>
    </WalletProvider>
  );
}
