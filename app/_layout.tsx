import { DarkTheme, ThemeProvider } from '@react-navigation/native'; // Remove DefaultTheme import
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


// Risk assessment functions for each data source
const assessWaikaneStreamRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 7;
  const yellowEnd = 10.8;
  if (level < greenEnd) return 'LOW';
  if (level < yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

const assessWaiaholeStreamRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 12;
  const yellowEnd = 16.4;
  if (level < greenEnd) return 'LOW';
  if (level < yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

const assessPunaluuStreamRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 10;
  const yellowEnd = 14.7;
  if (level < greenEnd) return 'LOW';
  if (level < yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

const assessTideRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 2.12;
  const yellowEnd = 2.92;
  if (level < greenEnd) return 'LOW';
  if (level < yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

const assessMakaiRainRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 2.8;
  const yellowEnd = 4.1;
  if (level <= greenEnd) return 'LOW';
  if (level <= yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

const assessMaukaRainRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 3.11;
  const yellowEnd = 4.54;
  if (level <= greenEnd) return 'LOW';
  if (level <= yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

// Overall risk assessment
const assessOverallRisk = (
  waikaneStream: number | null,
  waiaholeStream: number | null,
  punaluuStream: number | null,
  tide: number | null,
  makaiRain: number | null,
  maukaRain: number | null
): string => {
  const risks = [
    assessWaikaneStreamRisk(waikaneStream),
    assessWaiaholeStreamRisk(waiaholeStream),
    assessPunaluuStreamRisk(punaluuStream),
    assessTideRisk(tide),
    assessMakaiRainRisk(makaiRain),
    assessMaukaRainRisk(maukaRain)
  ].filter(risk => risk !== 'UNKNOWN');

  if (risks.length === 0) return 'UNKNOWN';
  if (risks.includes('HIGH')) return 'HIGH';
  if (risks.includes('MEDIUM')) return 'MEDIUM';
  return 'LOW';
};

// Flood risk levels with detailed information
const FLOOD_RISK_LEVELS = {
  LOW: { 
    color: '#34C759', 
    icon: 'checkmark-circle', 
    text: 'LOW',
    title: 'Low Flood Risk',
    description: 'All monitored conditions are within normal ranges. No immediate flood concerns.',
    details: [
      '• All stream levels below warning thresholds',
      '• Tide levels normal',
      '• Rainfall within safe limits',
      '• Safe for outdoor activities'
    ]
  },
  MEDIUM: { 
    color: '#FF9500', 
    icon: 'warning', 
    text: 'MED',
    title: 'Moderate Flood Risk',
    description: 'One or more conditions are elevated. Monitor conditions and exercise caution.',
    details: [
      '• Some levels approaching warning thresholds',
      '• Recent or forecasted heavy rainfall',
      '• Avoid stream crossings and low-lying areas',
      '• Stay alert for updates'
    ]
  },
  HIGH: { 
    color: '#FF3B30', 
    icon: 'alert-circle', 
    text: 'HIGH',
    title: 'High Flood Risk',
    description: 'DANGER: Flooding conditions present or imminent. Avoid all flood-prone areas.',
    details: [
      '• Critical levels detected in monitored systems',
      '• Active flood warnings may be in effect',
      '• Stay away from streams, valleys, and coastlines',
      '• Follow evacuation orders if issued'
    ]
  },
  UNKNOWN: {
    color: '#8E8E93',
    icon: 'help-circle',
    text: 'Loading',
    title: 'Loading Data',
    description: 'Unable to assess current risk levels due to loading data.',
    details: [
      '• Some monitoring systems may be offline',
      '• Check back later for updated information',
      '• Exercise general caution near water sources',
      '• Contact emergency services if needed'
    ]
  }
};


function FloodRiskIndicator() {
  const [modalVisible, setModalVisible] = useState(false);
  
  const openMap = async () => {
    await WebBrowser.openBrowserAsync('https://experience.arcgis.com/experience/60260cda4f744186bbd9c67163b747d3');
  };
  const [riskData, setRiskData] = useState<{
    waikaneStream: number | null;
    waiaholeStream: number | null;
    punaluuStream: number | null;
    tide: number | null;
    makaiRain: number | null;
    maukaRain: number | null;
    lastUpdated: Date | null;
  }>({
    waikaneStream: null,
    waiaholeStream: null,
    punaluuStream: null,
    tide: null,
    makaiRain: null,
    maukaRain: null,
    lastUpdated: null,
  });

  // Fetch data from all sources
  useEffect(() => {

    const fetchAllData = async () => {
      try {
        const [waikaneRes, waiaholeRes, punaluuRes, tideRes, rainRes] = await Promise.all([
          fetch('http://149.165.159.226:5000/api/waikane_stream'),
          fetch('http://149.165.159.226:5000/api/waiahole_stream'),
          fetch('http://149.165.159.226:5000/api/punaluu_stream'),
          fetch('http://149.165.159.226:5000/api/waikane_tide_curve'),
          fetch('http://149.165.159.226:5000/api/rain_data')
        ]);

        const [waikaneData, waiaholeData, punaluuData, tideData, rainData] = await Promise.all([
          waikaneRes.json(),
          waiaholeRes.json(),
          punaluuRes.json(),
          tideRes.json(),
          rainRes.json()
        ]);

        // Process Waikane Stream data
        const now = new Date();
        const waikaneLatest = waikaneData
          .filter((d: any) => d.ft != null && d.DateTime)
          .map((d: any) => ({
            time: new Date(d.DateTime),
            value: d.ft
          }))
          .filter((d: any) => d.time <= now)
          .sort((a: any, b: any) => b.time - a.time)[0];

        // Process Waiahole Stream data
        const waiaholeLatest = waiaholeData
          .filter((d: any) => d.ft != null && d.DateTime)
          .map((d: any) => ({
            time: new Date(d.DateTime),
            value: d.ft
          }))
          .filter((d: any) => d.time <= now)
          .sort((a: any, b: any) => b.time - a.time)[0];

        // Process Punaluu Stream data
        const punaluuLatest = punaluuData
          .filter((d: any) => d.ft != null && d.DateTime)
          .map((d: any) => ({
            time: new Date(d.DateTime),
            value: d.ft
          }))
          .filter((d: any) => d.time <= now)
          .sort((a: any, b: any) => b.time - a.time)[0];

        // Process Tide data using robust HST logic (match WaikaneTideLevel)
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
        const nowHSTDate = getNowHSTAsLocalDate();
        const tideLatest = tideData
          .map((item: any) => ({
            time: new Date(item["Datetime"]),
            height: item["Predicted_ft_MSL"]
          }))
          .filter((d: any) => d.time <= nowHSTDate && !isNaN(d.time.getTime()) && d.height != null)
          .sort((a: any, b: any) => b.time - a.time)[0];

        // Process Rain data
        const rainRows = Array.isArray(rainData) ? rainData : [];
        const makaiRain = rainRows.find((d: any) => d.Name && d['1HrRainfall'] != null && d.Name.toLowerCase().includes('makai'));
        const maukaRain = rainRows.find((d: any) => d.Name && d['1HrRainfall'] != null && d.Name.toLowerCase().includes('mauka'));

        setRiskData({
          waikaneStream: waikaneLatest?.value || null,
          waiaholeStream: waiaholeLatest?.value || null,
          punaluuStream: punaluuLatest?.value || null,
          tide: tideLatest?.height || null,
          makaiRain: makaiRain?.['1HrRainfall'] ?? null,
          maukaRain: maukaRain?.['1HrRainfall'] ?? null,
          lastUpdated: new Date(),
        });

      } catch (error) {
        console.error('Error fetching risk data:', error);
      }
    };

    fetchAllData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Use both Makai and Mauka rainfall for risk assessment
  const currentRiskLevel = assessOverallRisk(
    riskData.waikaneStream,
    riskData.waiaholeStream, 
    riskData.punaluuStream,
    riskData.tide,
    riskData.makaiRain,
    riskData.maukaRain
  ) as keyof typeof FLOOD_RISK_LEVELS;
  const risk = FLOOD_RISK_LEVELS[currentRiskLevel];

  return (
    <>
      <View style={styles.indicatorContainer}>
        <TouchableOpacity 
          style={styles.floodIndicator}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
    <Ionicons name={risk.icon as any} size={16} color={risk.color} />
          <ThemedText style={[styles.riskText, { color: risk.color }]}>
            {risk.text}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.mapButton}
          onPress={openMap}
          activeOpacity={0.8}
        >
    <Ionicons name="map" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.modalHeader}>
              <Ionicons name={risk.icon as any} size={32} color={risk.color} />
              <ThemedText style={[styles.modalTitle, { color: risk.color }]}>
                {risk.title}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.modalDescription}>
              {risk.description}
            </ThemedText>
            
            <View style={styles.detailsList}>
              {Array.isArray(risk.details) && risk.details.map((detail: any, index: number) => {
                if (typeof detail !== 'string') return null;
                return (
                  <ThemedText key={index} style={styles.detailItem}>
                    {detail}
                  </ThemedText>
                );
              })}
            </View>

            {/* Current Readings Section */}
            <View style={styles.readingsSection}>
              <ThemedText style={styles.readingsTitle}>Current Readings:</ThemedText>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Waikane Stream:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.waikaneStream && typeof riskData.waikaneStream === 'number' ?
                    (assessWaikaneStreamRisk(riskData.waikaneStream) === 'HIGH' ? '#FF3B30' :
                      assessWaikaneStreamRisk(riskData.waikaneStream) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.waikaneStream && typeof riskData.waikaneStream === 'number' ? `${riskData.waikaneStream.toFixed(2)} ft` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Waiahole Stream:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.waiaholeStream && typeof riskData.waiaholeStream === 'number' ?
                    (assessWaiaholeStreamRisk(riskData.waiaholeStream) === 'HIGH' ? '#FF3B30' :
                      assessWaiaholeStreamRisk(riskData.waiaholeStream) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.waiaholeStream && typeof riskData.waiaholeStream === 'number' ? `${riskData.waiaholeStream.toFixed(2)} ft` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Punaluu Stream:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.punaluuStream && typeof riskData.punaluuStream === 'number' ?
                    (assessPunaluuStreamRisk(riskData.punaluuStream) === 'HIGH' ? '#FF3B30' :
                      assessPunaluuStreamRisk(riskData.punaluuStream) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.punaluuStream && typeof riskData.punaluuStream === 'number' ? `${riskData.punaluuStream.toFixed(2)} ft` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Waikane Tide:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.tide && typeof riskData.tide === 'number' ?
                    (assessTideRisk(riskData.tide) === 'HIGH' ? '#FF3B30' :
                      assessTideRisk(riskData.tide) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.tide && typeof riskData.tide === 'number' ? `${riskData.tide.toFixed(2)} ft` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Makai Rainfall:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.makaiRain !== null && typeof riskData.makaiRain === 'number' ?
                    (assessMakaiRainRisk(riskData.makaiRain) === 'HIGH' ? '#FF3B30' :
                      assessMakaiRainRisk(riskData.makaiRain) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.makaiRain !== null && typeof riskData.makaiRain === 'number' ? `${riskData.makaiRain.toFixed(2)} in` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Mauka Rainfall:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.maukaRain !== null && typeof riskData.maukaRain === 'number' ?
                    (assessMaukaRainRisk(riskData.maukaRain) === 'HIGH' ? '#FF3B30' :
                      assessMaukaRainRisk(riskData.maukaRain) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.maukaRain !== null && typeof riskData.maukaRain === 'number' ? `${riskData.maukaRain.toFixed(2)} in` : 'No data'}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText style={styles.lastUpdated}>
              Last updated: {riskData.lastUpdated ? riskData.lastUpdated.toLocaleTimeString() : 'Never'}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  // Always use DarkTheme
  return (
    <ThemeProvider value={DarkTheme}>
      <View style={styles.container}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <FloodRiskIndicator />
        <StatusBar style="light" /> {/* Use light status bar for dark background */}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicatorContainer: {
    position: 'absolute',
    top: 60,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 1000,
  },
  floodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 4,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mapButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Removed contacts styles (legacy cleanup)
  // contactsModalHeader: {},
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  // contactsModalTitle: {},
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '400',
    color: '#333333',
  },
  detailsList: {
    marginBottom: 20,
    gap: 8,
  },
  detailItem: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#444444',
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  // Removed contacts list styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  readingsSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  readingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    flex: 1,
  },
  readingValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
});
