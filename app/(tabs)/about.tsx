import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AboutScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F5E8', dark: '#2D4A2D' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#4CAF50"
          name="info.circle"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={styles.titleText}>App Information</ThemedText>
      </ThemedView>

      <ThemedView>
        <ThemedText style={styles.thinText}>
          <Ionicons name="warning-outline" size={16} color="#FF9500" />{' '}
          This app helps residents and visitors in Waikāne and Waiāhole stay informed about flood risks, stream and tide conditions, and weather alerts
          
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Features</ThemedText>
        <ThemedView style={styles.sectionContent}>
          <ThemedView style={styles.row}>
            <Ionicons name="home" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Home: App overview & emergency contacts
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="water" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Stream Monitor: Real-time Waikāne/Waiahole stream levels, status, graphs, and ArcGIS map
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="time" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Tide Conditions: Kāneʻohe Bay tide height, direction, times, and graphs
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="cloudy" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Wave & Weather: National weather alerts & 3-day forecasts
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
        <ThemedView style={styles.sectionContent}>
          <ThemedView style={styles.row}>
            <Ionicons name="refresh" size={18} color="#4CAF50" style={styles.icon} />
            <ThemedText>Data updates automatically when you open the app or refresh it</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="cloud-outline" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>Weather forecasts and alerts: Live from National Weather Service</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="water-outline" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>Stream monitoring: Real-time data from USGS</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="time-outline" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>Tide information: Current NOAA predictions</ThemedText>
          </ThemedView>
          <ThemedText style={styles.thinText}>
            For detailed information on data sources and methodology used in this app, please see the linked documentation below
          </ThemedText>
          <ThemedView style={styles.row}>
            <Ionicons name="document-attach-outline" size={18} color="#007AFF" style={styles.icon} />
            <ExternalLink href="https://drive.google.com/file/d/1XxqdHgw4vJnn4HDAJypEXkAB__A6UEih/view?usp=sharing">
              <ThemedText style={{ textDecorationLine: 'underline', color: '#007AFF' }}>
                View full Data & Methods documentation (Google Drive)
              </ThemedText>
            </ExternalLink>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* 
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Safety Tips</ThemedText>
        <ThemedView style={styles.sectionContent}>
          <ThemedView style={styles.row}>
            <Ionicons name="shield-checkmark" size={18} color="#FF3B30" style={styles.icon} />
            <ThemedText>Monitor stream levels and weather alerts in the app</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="car-outline" size={18} color="#FF9500" style={styles.icon} />
            <ThemedText>Never drive through flooded roads - Turn Around, Don&apos;t Drown</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="walk-outline" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>Stay away from fast-moving water</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="alert-outline" size={18} color="#FF3B30" style={styles.icon} />
            <ThemedText>Have an evacuation plan ready</ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="call-outline" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>Call 911 for emergencies</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      */}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Contact & Feedback</ThemedText>
        <ThemedText style={styles.thinText}>
          For questions, support, or feedback about app accuracy and features, please reach out via email or the feedback form below
          {'\n\n'}
          <Ionicons name="send-outline" size={16} color="#007AFF" />{' '}
          <ExternalLink href="mailto:windwardfloodapp@gmail.com">
            <ThemedText type="link" style={styles.thinText}>windwardfloodapp@gmail.com</ThemedText>
          </ExternalLink>
          {'\n\n'}
          <Ionicons name="document-text-outline" size={16} color="#4CAF50" />{' '}
          <ExternalLink href="https://docs.google.com/forms/d/1DNHiR7vRSWIE4Wwi1eb7QwxUcjzsfUhyukAmjoJdjTw/edit">
            <ThemedText type="link" style={styles.thinText}>Submit Feedback Form</ThemedText>
          </ExternalLink>
          {'\n'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.disclaimerSection}>
        <ThemedText style={styles.disclaimerTitle}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />{' '}
          Important Disclaimer
        </ThemedText>
        <ThemedText style={styles.disclaimerText}>
          This app is for informational and educational use only. It combines flooding data to raise awareness in Waikāne and Waiāhole, but is not intended for emergency response, evacuation planning, or real-time decision-making. Information is experimental and may not reflect current conditions. Do not rely on this app for safety decisions. For official guidance, consult agencies like the Hawai&apos;i Emergency Management Agency and the National Weather Service
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#4CAF50',
    bottom: -50,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  titleText: {
    fontWeight: '400', // Changed from 700 to 400 (normal)
    fontSize: 24,
    textAlign: 'center',
  },
  thinText: {
    fontWeight: '300',
  },
  section: {
    marginBottom: 18,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontWeight: '400', // Changed from 600 to 400 (normal)
    fontSize: 17,
    marginBottom: 8,
  },
  sectionContent: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
    gap: 8,
  },
  icon: {
    marginTop: 2,
  },
  disclaimerSection: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#666666',
  },
});
