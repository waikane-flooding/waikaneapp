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
          <Ionicons name="cloudy" size={16} color="#4169E1" /> Current Weather Conditions
        </ThemedText>
        
        <ThemedView style={styles.monitorInfo}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Temperature:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Humidity:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Wind Speed:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Rainfall:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="calendar" size={16} color="#4169E1" /> 5-Day Weather Forecast
        </ThemedText>
        <ThemedText style={styles.description}>
          Waikāne/Waiahole Area - National Weather Service
        </ThemedText>
        <ThemedView style={styles.forecastContainer}>
          <ThemedText style={styles.placeholderText}>5-Day Forecast Data</ThemedText>
          <ThemedText style={styles.subText}>Weather forecast from National Weather Service will be displayed here</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="water" size={16} color="#4169E1" /> Wave Conditions - Kāne&apos;ohe Bay
        </ThemedText>
        <ThemedText style={styles.description}>
          Data from Surfline
        </ThemedText>
        <ThemedView style={styles.waveContainer}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Wave Height:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Wave Period:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Wave Direction:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Surf Conditions:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* <ThemedView style={styles.section}>
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
      </ThemedView> */}

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
  monitorInfo: {
    backgroundColor: 'rgba(65, 105, 225, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    fontSize: 16,
  },
  value: {
    fontWeight: '300',
    fontSize: 16,
    color: '#4169E1',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.7,
    marginBottom: 8,
  },
  forecastContainer: {
    backgroundColor: 'rgba(65, 105, 225, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#4169E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  waveContainer: {
    backgroundColor: 'rgba(65, 105, 225, 0.08)',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  placeholderText: {
    color: '#4169E1',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  subText: {
    color: '#4169E1',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
