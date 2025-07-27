import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import WaikaneTideLevel from '@/components/visualizations/WaikaneTideLevel';

export default function TideConditionsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#87CEEB', dark: '#2F4F4F' }}
      headerImage={
        <IconSymbol
          size={200}
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
          <Ionicons name="time" size={16} color="#4682B4" /> Kāne&apos;ohe Bay Tide Monitor
        </ThemedText>
        
        <ThemedView style={styles.monitorInfo}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Current Height:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Tide Direction:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Next High Tide:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Next Low Tide:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.chartsContainer}>
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Waikāne Tide Level Gauge</ThemedText>
          <WaikaneTideLevel />
        </ThemedView>
        
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Tide Level Trend</ThemedText>
          <ThemedView style={styles.chartPlaceholder}>
            <ThemedText style={styles.placeholderText}>Line Graph Space</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="calendar" size={16} color="#4682B4" /> Today&apos;s Tide Times
        </ThemedText>
        <ThemedText style={styles.thinText}>
          High tide and low tide schedule for today will be displayed here.
        </ThemedText>
      </ThemedView> */}

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#4682B4',
    bottom: -50,
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
    backgroundColor: 'rgba(70, 130, 180, 0.1)',
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
    color: '#4682B4',
  },
  chartsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  chartSection: {
    flex: 1,
    backgroundColor: 'rgba(70, 130, 180, 0.05)',
    borderRadius: 8,
    padding: 16,
  },
  chartTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(70, 130, 180, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4682B4',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#4682B4',
    fontWeight: '500',
    fontSize: 14,
  },
});
