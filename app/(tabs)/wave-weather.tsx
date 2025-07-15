import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function WaveWeatherScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#B0E0E6', dark: '#2F4F4F' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#4169E1"
          name="cloud.rain"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Wave &amp; Weather Conditions</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="cloudy" size={16} color="#4169E1" /> Current Weather
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌡️ Temperature: Loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          💨 Wind: Loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌧️ Rainfall: Loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          ☁️ Conditions: Live data coming soon
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="water" size={16} color="#4169E1" /> Wave Conditions
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌊 Wave Height: Loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          ⏱️ Wave Period: Loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🧭 Wave Direction: Loading...
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="warning" size={16} color="#FF9500" /> Weather Alerts
        </ThemedText>
        <ThemedText style={styles.thinText}>
          No active weather warnings at this time.
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌀 Storm Watch: None
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌧️ Flood Watch: None
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="calendar" size={16} color="#4169E1" /> 5-Day Forecast
        </ThemedText>
        <ThemedText style={styles.thinText}>
          Detailed weather forecast for the next 5 days will be displayed here.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="rainy" size={16} color="#4169E1" /> Rainfall History
        </ThemedText>
        <ThemedText style={styles.thinText}>
          📊 Last 24 hours: Data loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          📊 Last 7 days: Data loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          📊 This month: Data loading...
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="information-circle" size={16} color="#4169E1" /> Data Sources
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌊 Wave Data: NOAA Buoy Stations
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌤️ Weather Data: National Weather Service
        </ThemedText>
        <ThemedText style={styles.thinText}>
          📍 Location: Windward O&apos;ahu
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#4169E1',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 16,
    gap: 4,
  },
  thinText: {
    fontWeight: '300',
  },
});
