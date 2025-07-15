import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Flood risk levels with detailed information
const FLOOD_RISK_LEVELS = {
  LOW: { 
    color: '#34C759', 
    icon: 'checkmark-circle', 
    text: 'LOW',
    title: 'Low Flood Risk',
    description: 'Stream levels are normal. No immediate flood concerns. Continue with regular activities.',
    details: [
      '• Stream levels below warning thresholds',
      '• Weather conditions stable',
      '• No flood alerts active',
      '• Safe for outdoor activities'
    ]
  },
  MEDIUM: { 
    color: '#FF9500', 
    icon: 'warning', 
    text: 'MED',
    title: 'Moderate Flood Risk',
    description: 'Stream levels are elevated. Monitor conditions and avoid low-lying areas.',
    details: [
      '• Stream levels approaching warning levels',
      '• Recent or forecasted heavy rainfall',
      '• Avoid stream crossings',
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
      '• Stream levels at or above flood stage',
      '• Active flood warnings in effect',
      '• Stay away from streams and valleys',
      '• Follow evacuation orders if issued'
    ]
  }
};

function FloodRiskIndicator() {
  const [modalVisible, setModalVisible] = useState(false);
  // This would typically come from your app state/API
  const currentRiskLevel = 'LOW'; // Change this to 'MEDIUM' or 'HIGH' as needed
  const risk = FLOOD_RISK_LEVELS[currentRiskLevel];

  return (
    <>
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
              {risk.details.map((detail, index) => (
                <ThemedText key={index} style={styles.detailItem}>
                  {detail}
                </ThemedText>
              ))}
            </View>
            
            <ThemedText style={styles.lastUpdated}>
              Last updated: Just now
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
  floodIndicator: {
    position: 'absolute',
    top: 60, // Adjust based on status bar height
    right: 16,
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
    zIndex: 1000,
    gap: 4,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
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
});
