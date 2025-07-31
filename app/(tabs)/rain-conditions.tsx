import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import RainGauge from '@/components/visualizations/RainGauge';

export default function RainConditionsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [rainData, setRainData] = useState<{
    currentRainfall: string | null;
    status: string;
    statusColor?: string;
  }>({ currentRainfall: null, status: 'Loading...' });

  const getStatusFromRainfall = (rainfall: number) => {
    if (rainfall >= 0 && rainfall <= 2.8) {
      return { status: 'Normal', color: '#4CAF50' };
    } else if (rainfall > 2.8 && rainfall <= 4.1) {
      return { status: 'Warning', color: '#FFC107' };
    } else if (rainfall > 4.1 && rainfall <= 8) {
      return { status: 'Danger', color: '#F44336' };
    } else {
      return { status: 'Unknown', color: '#999999' };
    }
  };

  const fetchRainData = useCallback(() => {
    fetch('http://149.165.153.234:5000/api/rain_data')
      .then(res => res.json())
      .then(data => {
        // Calculate the sum of the "in" column for total rainfall
        const totalRainfall = data.reduce((sum: number, item: any) => {
          return sum + (item["in"] || 0);
        }, 0);
        
        const statusInfo = getStatusFromRainfall(totalRainfall);
        
        setRainData({
          currentRainfall: `${totalRainfall.toFixed(1)} in`,
          status: statusInfo.status,
          statusColor: statusInfo.color
        });
      })
      .catch(err => {
        console.error("Failed to load rain data", err);
        setRainData({
          currentRainfall: 'Error loading data',
          status: 'Error',
          statusColor: '#999999'
        });
      });
  }, []);

  useEffect(() => {
    fetchRainData();
  }, [fetchRainData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRainData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [fetchRainData]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#87CEEB', dark: '#2F4F4F' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#4682B4"
          name="cloud.rain.fill"
          style={styles.headerImage}
        />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Rain Conditions</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="rainy-outline" size={16} color="#4682B4" /> Current Rain Status
        </ThemedText>
        
        <ThemedView style={styles.monitorInfo}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Current Rainfall:</ThemedText>
            <ThemedText style={styles.value}>{rainData.currentRainfall || 'Loading...'}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <ThemedView style={[styles.statusBar, { backgroundColor: rainData.statusColor || '#999999' }]}>
              <ThemedText style={styles.statusText}>{rainData.status}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.chartsContainer}>
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Amount of Rainfall in the Last Hour</ThemedText>
          <ThemedView style={styles.chartWrapper}>
            <RainGauge />
          </ThemedView>
        </ThemedView>
      </ThemedView>
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
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  chartSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  chartTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
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
    width: '100%',
  },
  placeholderText: {
    color: '#4682B4',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
