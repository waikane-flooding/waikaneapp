import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TideConditionsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#87CEEB', dark: '#2F4F4F' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#4682B4"
          name="moon.haze"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Tide Conditions</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="time" size={16} color="#4682B4" /> Current Tide
        </ThemedText>
        <ThemedText style={styles.thinText}>
          🌊 Current: Rising Tide
        </ThemedText>
        <ThemedText style={styles.thinText}>
          📏 Height: Live data coming soon
        </ThemedText>
        <ThemedText style={styles.thinText}>
          ⏰ Next High Tide: Loading...
        </ThemedText>
        <ThemedText style={styles.thinText}>
          ⏰ Next Low Tide: Loading...
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="calendar" size={16} color="#4682B4" /> Today&apos;s Tide Times
        </ThemedText>
        <ThemedText style={styles.thinText}>
          High tide and low tide schedule for today will be displayed here.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="trending-up" size={16} color="#4682B4" /> 7-Day Forecast
        </ThemedText>
        <ThemedText style={styles.thinText}>
          Tide predictions for the next week will be shown here.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="warning" size={16} color="#FF9500" /> King Tide Alerts
        </ThemedText>
        <ThemedText style={styles.thinText}>
          No king tide warnings currently active.
        </ThemedText>
        <ThemedText style={styles.thinText}>
          King tides can cause coastal flooding even in good weather conditions.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="information-circle" size={16} color="#4682B4" /> Tide Station
        </ThemedText>
        <ThemedText style={styles.thinText}>
          📍 Kāne&apos;ohe Bay, O&apos;ahu
        </ThemedText>
        <ThemedText style={styles.thinText}>
          Data source: NOAA Tide Predictions
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#4682B4',
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
