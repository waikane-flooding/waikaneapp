import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ExternalLink } from '@/components/ExternalLink';

const emergencyContacts = [
  {
    name: "Honolulu Emergency Services",
    number: "911",
    description: "For immediate emergency response",
    website: "https://emergencyservices.honolulu.gov"
  },
  {
    name: "Windward Police Station",
    number: "(808) 723-8640",
    description: "Kāne'ohe Police Department",
    website: "https://www.honolulupd.org/d4/"
  },
  {
    name: "Honolulu Police Department",
    number: "(808) 723-8488",
    description: "General number for non-emergencies",
    website: "https://www.honolulupd.org/"
  },
  {
    name: "Board of Water Supply",
    number: "(808) 748-5000",
    description: "Water emergency & main breaks",
    website: "https://www.boardofwatersupply.com/"
  },
  {
    name: "State of Hawai'i, DLNR",
    number: "(808) 587-0230",
    description: "Engineering & flood control",
    website: "https://dlnreng.hawaii.gov"
  },
  {
    name: "Hawaiian Electric",
    number: "855-304-1212",
    description: "Power outages & emergencies",
    website: "https://www.hawaiianelectric.com/"
  }
];

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
      <ThemedView>
        <ThemedText style={styles.thinText}>
          Aloha! Monitor real time stream levels, rainfall data, tide conditions, and weather forecasts to stay informed about flood risks and environmental conditions on the windward side.
          
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.disclaimerSection}>
        <ThemedText style={styles.disclaimerTitle}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" /> Disclaimer
        </ThemedText>
        <ThemedText style={styles.disclaimerText}>
          For informational and educational use only. Combines flooding data to raise awareness in Waikāne and Waiāhole, but not intended for emergency response, evacuation planning, or real-time decision-making. Information is experimental and may not reflect current conditions. Does not send push notifications, alerts, or automated warnings. Do not rely on this app for safety decisions. For official guidance, consult Hawai&apos;i Emergency Management Agency and National Weather Service.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionContent}>
          <ThemedView style={styles.row}>
            <Ionicons name="water" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Stream: Monitor stream water levels. Watch for dangerous thresholds that could cause road and bridge closures.
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="time" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Tide: Track the bay's tide heights to understand how ocean conditions may impact flooding risks.
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="rainy" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Rainfall: Monitor recent rainfall amounts. Heavy rainfall in short periods can increase stream levels and flood risk at rapid rates.
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.row}>
            <Ionicons name="cloudy" size={18} color="#007AFF" style={styles.icon} />
            <ThemedText>
              Weather: Stay informed with 3 day weather forecasts and updates from the National Weather Service.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedView style={styles.sectionContent}>
          <ThemedText style={styles.thinText}>
            For detailed information on data sources and methodology used in this app, please see the linked documentation.
          </ThemedText>
          <ThemedView style={styles.contactContainer}>
            <Ionicons name="document-attach-outline" size={16} color="#007AFF" />
            <ExternalLink href="https://windwardfloodcheck-readme.readthedocs.io/en/latest/">
              <ThemedText type="link" style={styles.thinText}>
                 Data & Methods
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
          For questions, support, or feedback about the app, please reach out via email.
        </ThemedText>
        
        <ThemedView style={styles.contactContainer}>
          <Ionicons name="send-outline" size={16} color="#007AFF" />
          <ExternalLink href="mailto:infowrrc@hawaii.edu">
            <ThemedText type="link" style={styles.thinText}>infowrrc@hawaii.edu</ThemedText>
          </ExternalLink>
        </ThemedView>
        
        {/* Feedback form removed - contact by email only */}
      </ThemedView>

      {/* Emergency Contacts section moved here */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          <Ionicons name="shield" size={18} color="#FF3B30" /> Emergency Contacts
        </ThemedText>
        <ThemedText style={[styles.thinText, { marginBottom: 8 }]}>
          Click on a contact name to visit their website or tap a phone number to call.
        </ThemedText>
        {emergencyContacts.map((contact, index) => (
          <ThemedView key={index} style={{ marginTop: 12, marginBottom: 16 }}>
            <ExternalLink href={contact.website as any}>
              <ThemedText style={styles.contactName} type="link">
                {contact.name}
              </ThemedText>
            </ExternalLink>
            <ThemedText style={[styles.contactDescription, { color: '#666', marginTop: 4, marginBottom: 6 }]}>{contact.description}</ThemedText>
            <ThemedText 
              style={[styles.contactNumberBelow, { fontSize: 16, fontWeight: '500' }]}
              onPress={() => Linking.openURL(`tel:${contact.number}`)}
            >
              {contact.number}
            </ThemedText>
          </ThemedView>
        ))}
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
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: '#666666',
  },
  contactHeaderColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactNumberBelow: {
    fontSize: 14,
    fontWeight: '400',
    color: '#007AFF',
  },
  contactDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#B0BEC5',
    marginTop: 4,
  },
  contactContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
