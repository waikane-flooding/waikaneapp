import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/visualizations/RedesignTheme';
import WaikaneStreamHeight from '@/components/visualizations/WaikaneStreamHeight';
import WaiaholeStreamHeight from '@/components/visualizations/WaiaholeStreamHeight';
import PunaluuStreamHeight from '@/components/visualizations/PunaluuStreamHeight';
import CompactStreamGauge from '@/components/visualizations/CompactStreamGauge';
import WaikaneStreamGraph from '@/components/visualizations/WaikaneStreamGraph';
import WaiaholeStreamGraph from '@/components/visualizations/WaiaholeStreamGraph';
import PunaluuStreamGraph from '@/components/visualizations/PunaluuStreamGraph';
import CompactStreamGraph from '@/components/visualizations/CompactStreamGraph';
import WaikaneTideGraph from '@/components/visualizations/WaikaneTideGraph';
import { useStreamDataCache } from '@/hooks/useStreamDataCache';
import RedesignSettings from '@/components/visualizations/RedesignSettings';

export default function RedesignScreen() {
  const { fetchStreamData } = useStreamDataCache();
  const [streamCache, setStreamCache] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [tideCurveData, setTideCurveData] = useState<any[]>([]);
  const [tideMarkersData, setTideMarkersData] = useState<any[]>([]);
  const [settings, setSettings] = useState({ waikane: true, waiahole: true, punaluu: true });

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh stream caches
      const [waikane, waiahole, punaluu] = await Promise.all([
        fetchStreamData('waikane'),
        fetchStreamData('waiahole'),
        fetchStreamData('punaluu'),
      ]);

      setStreamCache({ waikane, waiahole, punaluu });

      // Tide data (Waikane) — same endpoints used by existing components
      try {
        const [curveRes, markersRes] = await Promise.all([
          fetch('http://159.223.179.149:5000/api/waikane_tide_curve'),
          fetch('http://159.223.179.149:5000/api/waikane_tides'),
        ]);
        const [curve, markers] = await Promise.all([curveRes.json(), markersRes.json()]);
        setTideCurveData(curve);
        setTideMarkersData(markers);
      } catch (_err) {
        setTideCurveData([]);
        setTideMarkersData([]);
      }
    } finally {
      // Small delay so the pull-to-refresh feels deliberate
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [fetchStreamData]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ParallaxSafeScroll
      refreshing={refreshing}
      onRefresh={loadAll}
      headerTitle="Redesign Preview"
    >
      <ThemedView style={styles.container}>
        {/* Streams row - each stream displayed as a card with gauge + small graph */}
  <ThemedText type="subtitle" style={styles.sectionTitle}>Streams</ThemedText>
  <ThemedText type="default" style={styles.statusText}>Compact graphs active — tap a gauge to open the full chart</ThemedText>

  <RedesignSettings value={settings} onChange={setSettings} />

        <View style={styles.streamsRow}>
          {settings.waikane && (
            <Card style={[styles.card, styles.cardTaller]}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Waikāne</ThemedText>
              <CompactStreamGauge streamData={streamCache.waikane?.data || []} trendData={streamCache.waikane?.trends || []} minLevel={0} maxLevel={16} color="#36A2EB" />
              <CompactStreamGraph streamData={streamCache.waikane?.data || []} width={320} height={140} color="#36A2EB" />
            </Card>
          )}

          {settings.waiahole && (
            <Card style={[styles.card, styles.cardTaller]}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Waiāhole</ThemedText>
              <CompactStreamGauge streamData={streamCache.waiahole?.data || []} trendData={streamCache.waiahole?.trends || []} minLevel={6} maxLevel={18} color="#34C759" />
              <CompactStreamGraph streamData={streamCache.waiahole?.data || []} width={320} height={140} color="#34C759" />
            </Card>
          )}

          {settings.punaluu && (
            <Card style={[styles.card, styles.cardTaller]}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Punaluʻu</ThemedText>
              <CompactStreamGauge streamData={streamCache.punaluu?.data || []} trendData={streamCache.punaluu?.trends || []} minLevel={0} maxLevel={16} color="#FFC107" />
              <CompactStreamGraph streamData={streamCache.punaluu?.data || []} width={320} height={140} color="#FFC107" />
            </Card>
          )}
        </View>

        {/* Tide section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>Tide</ThemedText>
        <View style={[styles.card, styles.tideCard]}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Waikāne Tide</ThemedText>
          <WaikaneTideGraph width={800} height={340} curveData={tideCurveData} tideData={tideMarkersData} />
        </View>
      </ThemedView>
    </ParallaxSafeScroll>
  );
}

// Small wrapper to mimic the app's parallax/refresh behavior without importing ParallaxScrollView directly
function ParallaxSafeScroll({ children, refreshing, onRefresh, headerTitle }: any) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" colors={["#007AFF"]} />
      }
    >
      <ThemedView style={localStyles.header}>
        <ThemedText type="title" style={localStyles.headerText}>{headerTitle}</ThemedText>
      </ThemedView>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: '#007AFF',
  },
  statusText: {
    color: '#1D3D47',
    marginBottom: 8,
  },
  streamsRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flex: 1,
    // On web we want the three cards side-by-side
    minWidth: Platform.OS === 'web' ? 300 : undefined,
  },
  cardTaller: {
    // extra room for taller graphs + metadata
    paddingBottom: 18,
    minHeight: 260,
  },
  tideCard: {
    paddingBottom: 20,
  },
  cardTitle: {
    marginBottom: 6,
    color: '#1D3D47',
  },
});

const localStyles = StyleSheet.create({
  header: {
    padding: 18,
    backgroundColor: '#A1CEDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
  },
});
