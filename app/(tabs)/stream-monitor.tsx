import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function StreamMonitorScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#007AFF"
          name="water.waves"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Stream Monitor</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="water" size={16} color="#007AFF" /> Waikāne Stream Monitor
        </ThemedText>
        
        <ThemedView style={styles.monitorInfo}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Current Height:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Last Reading:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <ThemedView style={styles.statusBar}>
              <ThemedText style={styles.statusText}>Normal</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.chartsContainer}>
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Waikāne Stream Height Gauge</ThemedText>
          <ThemedView style={styles.chartPlaceholder}>
            <ThemedText style={styles.placeholderText}>Gauge Chart Space</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
          <ThemedView style={styles.chartPlaceholder}>
            <ThemedText style={styles.placeholderText}>Line Graph Space</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="water" size={16} color="#007AFF" /> Waiahole Stream Monitor
        </ThemedText>
        
        <ThemedView style={styles.monitorInfo}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Current Height:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Last Reading:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <ThemedView style={styles.statusBar}>
              <ThemedText style={styles.statusText}>Normal</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.chartsContainer}>
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Waiahole Stream Height Gauge</ThemedText>
          <ThemedView style={styles.chartPlaceholder}>
            <ThemedText style={styles.placeholderText}>Gauge Chart Space</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
          <ThemedView style={styles.chartPlaceholder}>
            <ThemedText style={styles.placeholderText}>Line Graph Space</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="information-circle" size={16} color="#007AFF" /> Stream Information
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.streamInfoContainer}>
        <ThemedView style={styles.streamCard}>
          <ThemedText style={styles.streamTitle}>Waikāne Stream</ThemedText>
          <ThemedText style={styles.streamDescription}>
            This stream flows from the Ko&apos;olau Mountains down to the ocean in windward O&apos;ahu. It can rise quickly when it rains heavily in the mountains.
          </ThemedText>
          <ThemedView style={styles.streamDetails}>
            <ThemedText style={styles.detailItem}>📍 Area: 4.2 square miles</ThemedText>
            <ThemedText style={styles.detailItem}>🏔️ Height: Sea level to 2,800 feet</ThemedText>
            <ThemedText style={styles.detailItem}>🌊 Flow: Mountain to ocean</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.streamCard}>
          <ThemedText style={styles.streamTitle}>Waiahole Stream</ThemedText>
          <ThemedText style={styles.streamDescription}>
            Located next to Waikāne Stream, this waterway also starts in the mountains and flows to the sea. Both streams respond quickly to rainfall.
          </ThemedText>
          <ThemedView style={styles.streamDetails}>
            <ThemedText style={styles.detailItem}>📍 Area: 3.8 square miles</ThemedText>
            <ThemedText style={styles.detailItem}>🏔️ Height: Sea level to 2,600 feet</ThemedText>
            <ThemedText style={styles.detailItem}>🌊 Flow: Mountain to ocean</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="map" size={16} color="#007AFF" /> Stream Locations
        </ThemedText>
        <ThemedView style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#007AFF" />
          <ThemedText style={styles.mapPlaceholderText}>Interactive Map</ThemedText>
          <ThemedText style={styles.mapSubtext}>Waikāne & Waiahole Stream Locations</ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#007AFF',
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
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
    color: '#007AFF',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBar: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  chartsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  chartSection: {
    flex: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 14,
  },
  streamInfoContainer: {
    gap: 16,
    marginBottom: 16,
  },
  streamCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  streamDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '300',
  },
  streamDetails: {
    gap: 4,
  },
  detailItem: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  mapPlaceholderText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 8,
  },
  mapSubtext: {
    color: '#007AFF',
    fontWeight: '400',
    fontSize: 12,
    marginTop: 4,
  },
});
