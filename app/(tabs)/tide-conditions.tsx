import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import WaikaneTideLevel from '@/components/visualizations/WaikaneTideLevel';
import WaikaneTideGraph from '@/components/visualizations/WaikaneTideGraph';

export default function TideConditionsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [tideData, setTideData] = useState<{
    currentHeight: string | null;
    latestReadingTime?: string | null;
    direction: string | null;
    nextTide: string | null;
    status: string;
    statusColor?: string;
  }>({ currentHeight: null, latestReadingTime: null, direction: null, nextTide: null, status: 'Loading...' });

  // Threshold values from WaikaneTideLevel component
  const tideThresholds = {
    greenEnd: 2.12,
    yellowEnd: 2.92
  };

  // Get status based on tide level
  const getTideStatus = useCallback((level: number) => {
    if (level < tideThresholds.greenEnd) return { status: 'Normal', color: '#34C759' };
    if (level < tideThresholds.yellowEnd) return { status: 'Warning', color: '#FFC107' };
    return { status: 'Danger', color: '#F44336' };
  }, [tideThresholds.greenEnd, tideThresholds.yellowEnd]);

  // Fetch tide data
  const fetchTideData = useCallback(async () => {
    try {
      // Fetch tide curve and tide predictions only
      const [curveResponse, tidesResponse] = await Promise.all([
        fetch('http://149.165.159.169:5000/api/waikane_tide_curve'),
        fetch('http://149.165.159.169:5000/api/waikane_tides')
      ]);

      const curveData = await curveResponse.json();
      const tidesData = await tidesResponse.json();

      // Robust HST 'now' logic: get UTC, subtract 10h, format as HST string, parse as local time
      function getNowHSTAsLocalDate() {
        const nowUTC = new Date();
        nowUTC.setUTCHours(nowUTC.getUTCHours() - 10);
        // Format as 'YYYY-MM-DDTHH:mm:ss' (API format)
        const yyyy = nowUTC.getUTCFullYear();
        const mm = String(nowUTC.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(nowUTC.getUTCDate()).padStart(2, '0');
        const hh = String(nowUTC.getUTCHours()).padStart(2, '0');
        const min = String(nowUTC.getUTCMinutes()).padStart(2, '0');
        const ss = String(nowUTC.getUTCSeconds()).padStart(2, '0');
        const hstString = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
        return new Date(hstString);
      }
      const now = getNowHSTAsLocalDate();

      // Get current tide level (most recent past data point)
      const pastTides = curveData
        .map((item: any) => ({
          time: new Date(item["Datetime"]),
          height: item["Predicted_ft_MSL"]
        }))
        .filter((d: any) => d.time <= now && !isNaN(d.time.getTime()) && d.height != null)
        .sort((a: any, b: any) => b.time - a.time);

      // Find the next tide event after the latest reading
      let nextTideText = 'N/A';
      if (pastTides.length > 0 && Array.isArray(tidesData)) {
        const latestReadingTime = pastTides[0].time;
        // Find the next tide event after the latest reading
        const nextTideEvent = tidesData
          .map((item: any) => ({
            time: new Date(item["Date Time"]),
            type: item["Type"],
            height: item["Prediction_ft_MSL"]
          }))
          .filter((d: any) => d.time > latestReadingTime && !isNaN(d.time.getTime()) && d.height != null)
          .sort((a: any, b: any) => a.time - b.time)[0];
        if (nextTideEvent) {
          const timeStr = nextTideEvent.time.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) + ' HST';
          const tideType = nextTideEvent.type === 'H' ? 'High' : 'Low';
          nextTideText = `${tideType}, ${timeStr}`;
        }
      }

      if (pastTides.length > 0) {
        const currentTide = pastTides[0]; // Most recent past reading
        const statusInfo = getTideStatus(currentTide.height);

        // Get tide direction by comparing current with next future data point
        const nextFutureTide = curveData
          .map((item: any) => ({
            time: new Date(item["Datetime"]),
            height: item["Predicted_ft_MSL"]
          }))
          .filter((d: any) => d.time > now && !isNaN(d.time.getTime()) && d.height != null)
          .sort((a: any, b: any) => a.time - b.time)[0]; // Earliest future point

        let direction = 'Unknown';
        if (nextFutureTide) {
          if (nextFutureTide.height > currentTide.height) {
            direction = 'Rising';
          } else if (nextFutureTide.height < currentTide.height) {
            direction = 'Falling';
          } else {
            direction = 'Stable';
          }
        }

        // Format the latest reading time for display
        let latestReadingTime: string | null = null;
        if (currentTide.time instanceof Date && !isNaN(currentTide.time.getTime())) {
          latestReadingTime = currentTide.time.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) + ' HST';
        }

        setTideData({
          currentHeight: `${currentTide.height.toFixed(2)} ft`,
          latestReadingTime,
          direction: direction,
          nextTide: nextTideText,
          status: statusInfo.status,
          statusColor: statusInfo.color
        });
      }
    } catch (error) {
      console.error('Failed to load tide data', error);
      setTideData({ 
        currentHeight: 'Error', 
        direction: 'Error', 
        nextTide: 'Error', 
        status: 'Error' 
      });
    }
  }, [getTideStatus]);

  // Load data on component mount
  useEffect(() => {
    fetchTideData();
  }, [fetchTideData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTideData();
    // Add a small delay to show the refresh indicator
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, [fetchTideData]);

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
            <ThemedText style={styles.value}>{tideData.currentHeight || 'Loading...'}</ThemedText>
          </ThemedView>
          {/* Latest Reading Section */}
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Last Reading:</ThemedText>
            <ThemedText style={styles.value}>{tideData.latestReadingTime || 'Loading...'}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Tide Direction:</ThemedText>
            <ThemedText style={styles.value}>{tideData.direction || 'Loading...'}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText style={styles.label}>Next Tide:</ThemedText>
            <ThemedText style={styles.value}>{tideData.nextTide || 'Loading...'}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statusContainer}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <ThemedView style={[styles.statusBar, { backgroundColor: tideData.statusColor || (tideData.status === 'Loading...' ? '#999999' : '#34C759') }]}>
              <ThemedText style={styles.statusText}>{tideData.status}</ThemedText>
            </ThemedView>
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
