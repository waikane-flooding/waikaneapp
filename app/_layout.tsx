import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, TouchableOpacity, Modal, Linking, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Emergency contacts data
const emergencyContacts = [
  {
    name: "Honolulu Emergency Services",
    number: "911",
    description: "For immediate emergency response",
  },
  {
    name: "Windward Police Station",
    number: "(808) 723-8640",
    description: "Kāne'ohe Police Department",
  },
  {
    name: "Honolulu Police Department",
    number: "(808) 723-8488",
    description: "General number for non-emergencies",
  },
  {
    name: "Board of Water Supply",
    number: "(808) 748-5000",
    description: "Water emergency & main breaks",
  },
  {
    name: "State of Hawai'i, DLNR",
    number: "(808) 587-0230",
    description: "Engineering & flood control",
  },
  {
    name: "Hawaiian Electric",
    number: "855-304-1212",
    description: "Power outages & emergencies",
  }
];

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

const assessTideRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 2.12;
  const yellowEnd = 2.92;
  if (level < greenEnd) return 'LOW';
  if (level < yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

const assessRainRisk = (level: number | null): string => {
  if (!level) return 'UNKNOWN';
  const greenEnd = 2.8;
  const yellowEnd = 4.1;
  if (level <= greenEnd) return 'LOW';
  if (level <= yellowEnd) return 'MEDIUM';
  return 'HIGH';
};

// Overall risk assessment
const assessOverallRisk = (waikaneStream: number | null, waiaholeStream: number | null, tide: number | null, rain: number | null): string => {
  const risks = [
    assessWaikaneStreamRisk(waikaneStream),
    assessWaiaholeStreamRisk(waiaholeStream),
    assessTideRisk(tide),
    assessRainRisk(rain)
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

function ContactsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.contactsModalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              
              <View style={styles.contactsModalHeader}>
                <Ionicons name="call" size={28} color="#FF3B30" />
                <ThemedText style={styles.contactsModalTitle}>
                  Emergency Contacts
                </ThemedText>
              </View>
              
              <ScrollView 
                style={styles.contactsList}
                contentContainerStyle={styles.contactsListContent}
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {emergencyContacts.map((contact, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.contactItem}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.contactName}>
                      {contact.name}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${contact.number}`)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.contactNumber}>
                        {contact.number}
                      </ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.contactDescription}>
                      {contact.description}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function FloodRiskIndicator() {
  const [modalVisible, setModalVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [riskData, setRiskData] = useState<{
    waikaneStream: number | null;
    waiaholeStream: number | null;
    tide: number | null;
    makaiRain: number | null;
    maukaRain: number | null;
    lastUpdated: Date | null;
  }>({
    waikaneStream: null,
    waiaholeStream: null,
    tide: null,
    makaiRain: null,
    maukaRain: null,
    lastUpdated: null,
  });

  // Fetch data from all sources
  useEffect(() => {

    const fetchAllData = async () => {
      try {
        const [waikaneRes, waiaholeRes, tideRes, rainRes] = await Promise.all([
          fetch('http://149.165.159.169:5000/api/waikane_stream'),
          fetch('http://149.165.159.169:5000/api/waiahole_stream'),
          fetch('http://149.165.159.169:5000/api/waikane_tide_curve'),
          fetch('http://149.165.159.169:5000/api/rain_data')
        ]);

        const [waikaneData, waiaholeData, tideData, rainData] = await Promise.all([
          waikaneRes.json(),
          waiaholeRes.json(),
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
        const makaiRain = rainRows.find((d: any) => d.Name && d.Rainfall != null && d.Name.toLowerCase().includes('makai'));
        const maukaRain = rainRows.find((d: any) => d.Name && d.Rainfall != null && d.Name.toLowerCase().includes('mauka'));

        setRiskData({
          waikaneStream: waikaneLatest?.value || null,
          waiaholeStream: waiaholeLatest?.value || null,
          tide: tideLatest?.height || null,
          makaiRain: makaiRain?.Rainfall ?? null,
          maukaRain: maukaRain?.Rainfall ?? null,
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

  // Use Makai and Mauka rainfall for risk assessment (choose max for overall risk)
  const currentRiskLevel = assessOverallRisk(
    riskData.waikaneStream,
    riskData.waiaholeStream, 
    riskData.tide,
    Math.max(
      riskData.makaiRain ?? 0,
      riskData.maukaRain ?? 0
    )
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
          <Ionicons name={risk.icon as any} size={20} color={risk.color} />
          <ThemedText style={[styles.riskText, { color: risk.color }]}>
            {risk.text}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactsButton}
          onPress={() => setContactsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ContactsModal 
        visible={contactsModalVisible} 
        onClose={() => setContactsModalVisible(false)} 
      />

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
              {risk.details.map((detail: string, index: number) => (
                <ThemedText key={index} style={styles.detailItem}>
                  {detail}
                </ThemedText>
              ))}
            </View>

            {/* Current Readings Section */}
            <View style={styles.readingsSection}>
              <ThemedText style={styles.readingsTitle}>Current Readings:</ThemedText>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Waikane Stream:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.waikaneStream ?
                    (assessWaikaneStreamRisk(riskData.waikaneStream) === 'HIGH' ? '#FF3B30' :
                      assessWaikaneStreamRisk(riskData.waikaneStream) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.waikaneStream ? `${riskData.waikaneStream.toFixed(2)} ft` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Waiahole Stream:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.waiaholeStream ?
                    (assessWaiaholeStreamRisk(riskData.waiaholeStream) === 'HIGH' ? '#FF3B30' :
                      assessWaiaholeStreamRisk(riskData.waiaholeStream) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.waiaholeStream ? `${riskData.waiaholeStream.toFixed(2)} ft` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Waikane Tide:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.tide ?
                    (assessTideRisk(riskData.tide) === 'HIGH' ? '#FF3B30' :
                      assessTideRisk(riskData.tide) === 'MEDIUM' ? '#FF9500' : '#34C759') : '#8E8E93'
                }]}> 
                  {riskData.tide ? `${riskData.tide.toFixed(2)} ft` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Makai Rainfall:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.makaiRain !== null ?
                    (riskData.makaiRain <= 2.8 ? '#34C759' :
                      riskData.makaiRain <= 4.1 ? '#FF9500' : '#FF3B30') : '#8E8E93'
                }]}> 
                  {riskData.makaiRain !== null ? `${riskData.makaiRain.toFixed(2)} in` : 'No data'}
                </ThemedText>
              </View>

              <View style={styles.readingItem}>
                <ThemedText style={styles.readingLabel}>Mauka Rainfall:</ThemedText>
                <ThemedText style={[styles.readingValue, {
                  color: riskData.maukaRain !== null ?
                    (riskData.maukaRain <= 3.11 ? '#34C759' :
                      riskData.maukaRain <= 4.54 ? '#FF9500' : '#FF3B30') : '#8E8E93'
                }]}> 
                  {riskData.maukaRain !== null ? `${riskData.maukaRain.toFixed(2)} in` : 'No data'}
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
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    //can return a loading indicator or null while fonts are loading
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <FloodRiskIndicator />
        <StatusBar style="auto" />
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
    top: 60, // Adjust based on status bar height
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
  },
  floodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  contactsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
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
  contactsModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxWidth: 450,
    maxHeight: '80%',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    flexDirection: 'column',
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
  contactsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  contactsModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    color: '#FF3B30',
  },
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
  contactsList: {
    flex: 1,
    marginBottom: 10,
  },
  contactsListContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  contactItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333333',
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
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
