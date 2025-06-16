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
          //tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="water" color={color} size={size} />
        ),
      }}
      />
      <Tabs.Screen
  name="faq"
  options={{
    title: 'FAQ',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="help-circle-outline" color={color} size={size ?? 28} />
    ),
  }}
/>
    </Tabs>
  );
}
