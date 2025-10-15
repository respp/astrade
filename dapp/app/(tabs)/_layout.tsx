import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, Image, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import GameNavbar from '@/components/GameNavbar';

// Import custom tab icons
const tradingIcon = require('@/assets/images/tab/trading.png');
const profileIcon = require('@/assets/images/tab/profile.png');
const planetsIcon = require('@/assets/images/tab/planets.png');
const missionsIcon = require('@/assets/images/tab/missions.png');
const galaxyIcon = require('@/assets/images/tab/galaxy.png');
const exploreIcon = require('@/assets/images/tab/explore.png');

export default function TabLayout() {
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace('/login');
    }
  }, [authenticated, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#8B5CF6',
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 10,
          paddingTop: 20,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home Planet',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={planetsIcon}
                style={{ 
                  width: size * (focused ? 1.5 : 1), 
                  height: size * (focused ? 1.5 : 1),
                  opacity: focused ? 1 : 0.6,
                  marginBottom: 4
                }}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Home Planet
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={exploreIcon}
                style={{ 
                  width: size * (focused ? 1.5 : 1), 
                  height: size * (focused ? 1.5 : 1),
                  opacity: focused ? 1 : 0.6,
                  marginBottom: 4
                }}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Explore
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trading"
        options={{
          title: 'Trading',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={tradingIcon}
                style={{ 
                  width: size * (focused ? 1.5 : 1), 
                  height: size * (focused ? 1.5 : 1),
                  opacity: focused ? 1 : 0.6,
                  marginBottom: 4
                }}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Trading
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={missionsIcon}
                style={{ 
                  width: size * (focused ? 1.5 : 1), 
                  height: size * (focused ? 1.5 : 1),
                  opacity: focused ? 1 : 0.6,
                  marginBottom: 4
                }}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Missions
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="galaxy"
        options={{
          title: 'Galaxy',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={galaxyIcon}
                style={{ 
                  width: size * (focused ? 1.5 : 1), 
                  height: size * (focused ? 1.5 : 1),
                  opacity: focused ? 1 : 0.6,
                  marginBottom: 4
                }}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Galaxy
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={profileIcon}
                style={{ 
                  width: size * (focused ? 1.5 : 1), 
                  height: size * (focused ? 1.5 : 1),
                  opacity: focused ? 1 : 0.6,
                  marginBottom: 4
                }}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Profile
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planets"
        options={{
          title: 'Planets',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                source={planetsIcon}
                style={{ 
                  width: size * (focused ? 1.5 : 1), 
                  height: size * (focused ? 1.5 : 1),
                  opacity: focused ? 1 : 0.6,
                  marginBottom: 4
                }}
              />
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Planets
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          href: null, // Hide from tab bar but keep route accessible
        }}
      />
      <Tabs.Screen
        name="dojo-test"
        options={{
          title: 'Dojo Test',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{
                fontSize: size * (focused ? 1.5 : 1),
                marginBottom: 4,
                opacity: focused ? 1 : 0.6,
              }}>
                🎮
              </Text>
              <Text style={{
                fontSize: 10,
                fontWeight: '600',
                color: focused ? '#10B981' : '#6B7280',
                textAlign: 'center'
              }}>
                Dojo
              </Text>
            </View>
          ),
        }}
      />
      </Tabs>
  );
}