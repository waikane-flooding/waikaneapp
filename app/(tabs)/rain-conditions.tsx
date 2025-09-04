import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MakaiRainGauge from '@/components/visualizations/MakaiRainGauge';
import MaukaRainGauge from '@/components/visualizations/MaukaRainGauge';

export default function RainConditionsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [rainData, setRainData] = useState<{
    currentRainfall: string | null;
    status: string;
    statusColor?: string;
    lastReading?: string | null;
  }>({ currentRainfall: null, status: 'Loading...', lastReading: null });

  // Add Mauka rain gauge state
  const [maukaRainData, setMaukaRainData] = useState<{
    currentRainfall: string | null;
    status: string;
    statusColor?: string;
    lastReading?: string | null;
  }>({ currentRainfall: null, status: 'Loading...', lastReading: null });

  // Makai: 0-2.80 (green), 2.80-4.10 (yellow), 4.10-6 (red)
  const getMakaiStatus = (rainfall: number) => {
    if (rainfall >= 0 && rainfall <= 2.8) {
      return { status: 'Normal', color: '#4CAF50' };
    } else if (rainfall > 2.8 && rainfall <= 4.1) {
      return { status: 'Warning', color: '#FFC107' };
    } else if (rainfall > 4.1 && rainfall <= 6) {
      return { status: 'Danger', color: '#F44336' };
    } else {
      return { status: 'Unknown', color: '#999999' };
    }
  };

  // Mauka: 0-3.11 (green), 3.11-4.54 (yellow), 4.54-7 (red)
  const getMaukaStatus = (rainfall: number) => {
    if (rainfall >= 0 && rainfall <= 3.11) {
      return { status: 'Normal', color: '#4CAF50' };
    } else if (rainfall > 3.11 && rainfall <= 4.54) {
      return { status: 'Warning', color: '#FFC107' };
    } else if (rainfall > 4.54 && rainfall <= 7) {
      return { status: 'Danger', color: '#F44336' };
    } else {
      return { status: 'Unknown', color: '#999999' };
    }
  };

  const fetchRainData = useCallback(() => {
    fetch('http://149.165.159.169:5000/api/rain_data')
      .then(res => res.json())
      .then(data => {
        // Makai
        const makaiEntry = data.find((item: any) => item.Name === "Makai");
        if (makaiEntry) {
          const rainfall = Number(makaiEntry.Rainfall) || 0;
          const statusInfo = getMakaiStatus(rainfall);
          let lastReading = null;
          if (makaiEntry.DateTime) {
            const date = new Date(makaiEntry.DateTime);
            lastReading = date.toLocaleString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }) + ' HST';
          }
          setRainData({
            currentRainfall: `${rainfall.toFixed(2)} in`,
            status: statusInfo.status,
            statusColor: statusInfo.color,
            lastReading
          });
        } else {
          setRainData({
            currentRainfall: 'No data',
            status: 'Unavailable',
            statusColor: '#999999',
            lastReading: null
          });
        }

        // Mauka
        const maukaEntry = data.find((item: any) => item.Name === "Mauka");
        if (maukaEntry) {
          const rainfall = Number(maukaEntry.Rainfall) || 0;
          const statusInfo = getMaukaStatus(rainfall);
          let lastReading = null;
          if (maukaEntry.DateTime) {
            const date = new Date(maukaEntry.DateTime);
            lastReading = date.toLocaleString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }) + ' HST';
          }
          setMaukaRainData({
            currentRainfall: `${rainfall.toFixed(2)} in`,
            status: statusInfo.status,
            statusColor: statusInfo.color,
            lastReading
          });
        } else {
          setMaukaRainData({
            currentRainfall: 'No data',
            status: 'Unavailable',
            statusColor: '#999999',
            lastReading: null
          });
        }
      })
      .catch(err => {
        console.error("Failed to load rain data", err);
        setRainData({
          currentRainfall: 'Error loading data',
          status: 'Error',
          statusColor: '#999999'
        });
        setMaukaRainData({
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

      {/* Makai Rain Gauge Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="rainy-outline" size={16} color="#4682B4" /> Makai Rain Gauge
        </ThemedText>
        <ThemedView style={styles.monitorInfo}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Current Rainfall:</ThemedText>
            <ThemedText style={styles.value}>{rainData.currentRainfall || 'Loading...'}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Last Reading:</ThemedText>
            <ThemedText style={styles.value}>{rainData.lastReading || 'Loading...'}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <ThemedView style={[styles.statusBar, { backgroundColor: rainData.statusColor || '#999999' }]}>
              <ThemedText style={styles.statusText}>{rainData.status}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Makai Rain Gauge Chart */}
      <ThemedView style={styles.chartsContainer}>
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>
            Amount of Rainfall in the Last Hour {'\n'}
            <ThemedText style={styles.gaugeLabel}>Towards the ocean</ThemedText>
          </ThemedText>
          <ThemedView style={styles.chartWrapper}>
            <MakaiRainGauge />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Mauka Rain Gauge Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="rainy-outline" size={16} color="#4682B4" /> Mauka Rain Gauge
        </ThemedText>
        <ThemedView style={styles.monitorInfo}>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Current Rainfall:</ThemedText>
            <ThemedText style={styles.value}>{maukaRainData.currentRainfall || 'Loading...'}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Last Reading:</ThemedText>
            <ThemedText style={styles.value}>{maukaRainData.lastReading || 'Loading...'}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <ThemedView style={[styles.statusBar, { backgroundColor: maukaRainData.statusColor || '#999999' }]}>
              <ThemedText style={styles.statusText}>{maukaRainData.status}</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Mauka Rain Gauge Chart */}
      <ThemedView style={styles.chartsContainer}>
        <ThemedView style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>
            Amount of Rainfall in the Last Hour {'\n'}
            <ThemedText style={styles.gaugeLabel}>Towards the mountain</ThemedText>
          </ThemedText>
          <ThemedView style={styles.chartWrapper}>
            <MaukaRainGauge />
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
    gap: Platform.OS === 'web' ? 16 : 4,
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
    transform: Platform.OS === 'web' ? [] : [{ scale: 0.58 }],
    transformOrigin: 'center',
  },
  chartTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: Platform.OS === 'web' ? 4 : 0,
    textAlign: 'center',
  },
  gaugeLabel: {
    fontWeight: '400',
    fontSize: 13,
    color: '#4682B4',
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