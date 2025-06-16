//home screen
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/windward-header.jpg')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Waikāne Flood Tracker</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>🌊 Current Tide Levels</ThemedText>
        <ThemedText style={styles.thinText}>Live data coming soon!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>📍 East O&apos;ahu Risk Zones</ThemedText>
        <ThemedText style={styles.thinText}>Flood prone map sections will go here.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>🕒 Historical Flood Events</ThemedText>
        <ThemedText style={styles.thinText}>Data of past flood occurrences.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>🚨 Flood Alerts</ThemedText>
        <ThemedText style={styles.thinText}>Emergency alert info here.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="call-outline" size={16} /> Emergency Contacts
        </ThemedText>
        <ThemedText style={styles.thinText}>Important contact numbers will be listed here.</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
    gap: 4,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  thinText: {
    fontWeight: '300',
  },
});
