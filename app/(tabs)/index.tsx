//home screen
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

const quickActions = [
  {
    title: 'Stream Monitor',
    subtitle: 'Real-time water levels',
    icon: 'water',
    color: '#007AFF',
    bgColor: 'rgba(0, 122, 255, 0.1)',
    route: '/stream-monitor'
  },
  {
    title: 'Tide Conditions',
    subtitle: 'Kāneʻohe Bay tides',
    icon: 'time',
    color: '#4682B4',
    bgColor: 'rgba(70, 130, 180, 0.1)',
    route: '/tide-conditions'
  },
  {
    title: 'Weather & Alerts',
    subtitle: 'Forecasts & warnings',
    icon: 'cloudy',
    color: '#4169E1',
    bgColor: 'rgba(65, 105, 225, 0.1)',
    route: '/wave-weather'
  },
  {
    title: 'FAQ & Help',
    subtitle: 'App guide & support',
    icon: 'help-circle',
    color: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    route: '/faq'
  }
];

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/windward-header.jpg')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Waikāne Flood Tracker</ThemedText>
      </ThemedView>

      {/* <ThemedView style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeText}>
          Stay informed about flood conditions in Waikāne and Waiahole areas of windward Oʻahu.
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          Monitor real-time data and get alerts to make informed decisions during heavy rainfall.
        </ThemedText>
      </ThemedView> */}

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          <Ionicons name="flash" size={18} color="#FF6B35" /> Quick Actions
        </ThemedText>
        <ThemedView style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionCard, { backgroundColor: action.bgColor }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as any} size={32} color={action.color} />
              <ThemedText style={[styles.quickActionTitle, { color: action.color }]}>
                {action.title}
              </ThemedText>
              <ThemedText style={styles.quickActionSubtitle}>
                {action.subtitle}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          <Ionicons name="shield" size={18} color="#FF3B30" /> Emergency Contacts
        </ThemedText>
        
        {emergencyContacts.map((contact, index) => (
          <ThemedView key={index} style={styles.contactCard}>
            <ThemedView style={styles.contactHeaderColumn}>
              <ExternalLink href={contact.website as any}>
                <ThemedText style={styles.contactName} type="link">{contact.name}</ThemedText>
              </ExternalLink>
              <ThemedText 
                style={styles.contactNumberBelow}
                onPress={() => Linking.openURL(`tel:${contact.number}`)}
              >
                {contact.number}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.contactDescription}>{contact.description}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      <ThemedView style={styles.supportSection}>
        <ThemedText style={styles.supportText}>
          <Ionicons name="help-circle" size={16} color="#4CAF50" />{' '}
          Need help? Check the FAQ tab or contact us at{' '}
          <ExternalLink href="mailto:windwardfloodapp@gmail.com">
            <ThemedText type="link" style={styles.emailText}>windwardfloodapp@gmail.com</ThemedText>
          </ExternalLink>
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
    gap: 4,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  thinText: {
    fontWeight: '300',
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeSection: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  welcomeText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    opacity: 0.8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '400',
  },
  supportSection: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  supportText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4CAF50',
    lineHeight: 20,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    flexShrink: 1,
    flexGrow: 0,
    width: '100%',
    alignSelf: 'stretch',
  },
  contactHeaderColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
    flexGrow: 1,
    minWidth: 0,
    maxWidth: '65%',
    flexBasis: '65%',
    marginRight: 8,
    color: 'white',
  },
  contactNumberBelow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginTop: 2,
    textAlign: 'left',
  },
  contactDescription: {
    fontSize: 14,
    fontWeight: '300',
    opacity: 0.8,
  },
});
