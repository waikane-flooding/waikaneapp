import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import WaikaneTideLevel from '@/components/visualizations/WaikaneTideLevel';
import WaikaneTideGraph from '@/components/visualizations/WaikaneTideGraph';

export default function TideConditionsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Add a small delay to show the refresh indicator
    setTimeout(() => {
      setRefreshing(false);
      // The individual components will refetch their data when they re-render
    }, 1000);
  }, []);

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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4682B4"
          colors={['#4682B4']}
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
            <ThemedText style={styles.label}>Next Predicted Tide:</ThemedText>
            <ThemedText style={styles.value}>Loading...</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.chartsContainer}>
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Waikāne Tide Level Gauge</ThemedText>
          <ThemedView style={styles.chartWrapper}>
            <WaikaneTideLevel />
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Tide Level Trend</ThemedText>
          <ThemedView style={styles.chartWrapper}>
            <WaikaneTideGraph />
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
    flexDirection: 'column',
    gap: Platform.OS === 'web' ? 16 : 4,
    marginBottom: 16,
  },
  chartSection: {
    backgroundColor: 'rgba(70, 130, 180, 0.05)',
    borderRadius: 8,
    padding: Platform.OS === 'web' ? 16 : 1,
    marginHorizontal: 0,
    width: Platform.OS === 'web' ? '100%' : '98%',
    minWidth: Platform.OS === 'web' ? 'auto' : 380,
    overflow: 'hidden',
    minHeight: Platform.OS === 'web' ? 320 : 180,
    alignSelf: 'center',
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
    transform: Platform.OS === 'web' ? [] : [{ scale: 0.58 }],
    transformOrigin: 'center',
  },
  chartTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Platform.OS === 'web' ? 4 : 0,
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
