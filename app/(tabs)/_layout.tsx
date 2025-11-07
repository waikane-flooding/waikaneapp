//shadow error coming from here, harmless
//how tabs show up in app
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            //transparent background to show blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, size }) => (
<<<<<<< HEAD
            <Ionicons name="water" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tide-conditions"
        options={{
          title: 'Tide Conditions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="rain-conditions"
        options={{
          title: 'Rain Conditions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="rainy" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="wave-weather"
        options={{
          title: 'Weather Conditions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloudy" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="faq"
        options={{
          title: 'FAQ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle" color={color} size={size} />
=======
            <Ionicons name="information-circle" color={color} size={size} />
>>>>>>> test-anne-new
          ),
        }}
      />
    </Tabs>
  );
}
