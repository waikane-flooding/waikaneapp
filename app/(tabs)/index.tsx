//home screen
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Linking } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
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

      <ThemedView style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeText}>
          Welcome to the Waikāne Flood Tracker app! This tool helps you stay informed about flood conditions in the Waikāne and Waiahole areas of windward O&apos;ahu.
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          Monitor real-time stream levels, tide conditions, and weather data to make informed decisions during heavy rainfall and potential flooding situations.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="call-outline" size={16} /> Emergency Contacts
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

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="information-circle" size={16} color="#007AFF" /> Frequently Asked Questions
        </ThemedText>
      </ThemedView>

      <Collapsible title="What is this app about?">
        <ThemedText style={styles.thinText}>
          <Ionicons name="warning-outline" size={16} color="#FF9500" />{' '}
          This app warns you about floods, potential risks, and helps you make smart decisions to protect yourself and your community.
          {'\n\n'}
          <Ionicons name="rainy-outline" size={16} color="#007AFF" />{' '}
          Check the app regularly during heavy rain or stormy weather to see the latest updates!
        </ThemedText>
      </Collapsible>

      <Collapsible title="How do I use the app?">
        <ThemedText style={styles.thinText}>
          You can navigate through different tabs to access features and data:
          {'\n\n'}
          <Ionicons name="home" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Home </ThemedText>
          provides app information, frequently asked questions, and emergency contact numbers for immediate assistance.
          {'\n\n'}
          <Ionicons name="water" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Stream Monitor </ThemedText>
          shows real-time monitoring for Waikāne and Waiahole streams with current height, status, gauge charts, and stream location maps.
          {'\n\n'}
          <Ionicons name="time" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Tide Conditions </ThemedText>
          displays Kāne&apos;ohe Bay tide monitoring with current height, tide direction, high/low tide times, and tide level charts.
          {'\n\n'}
          <Ionicons name="cloudy" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Wave & Weather </ThemedText>
          provides current weather conditions (temperature, humidity, wind, rainfall), 5-day forecasts, and Kāne&apos;ohe Bay wave conditions from Surfline.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Where can I find more help?">
        <ThemedText style={styles.thinText}>
          Have more questions or need help with the app? You can reach out to the developer for support.
          {'\n\n'}
          <Ionicons name="send-outline" size={16} color="#007AFF" />{' '}
          <ExternalLink href="mailto:chiaraduyn@gmail.com">
            <ThemedText type="link" style={styles.thinText}>chiaraduyn@gmail.com</ThemedText>
          </ExternalLink>
        </ThemedText>
      </Collapsible>
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
    marginBottom: 16,
    gap: 4,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  thinText: {
    fontWeight: '300',
  },
  welcomeSection: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#007AFF',
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '300',
    lineHeight: 20,
    opacity: 0.8,
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
