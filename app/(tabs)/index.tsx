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
    description: "For immediate emergency response"
  },
  {
    name: "Windward Police Station",
    number: "(808) 723-8650",
    description: "Kāne'ohe Police Department"
  },
  {
    name: "Flood Control Hotline",
    number: "(808) 723-8488",
    description: "Report flooding issues"
  },
  {
    name: "Board of Water Supply",
    number: "(808) 748-5000",
    description: "Water emergency & main breaks"
  },
  {
    name: "Hawaiian Electric",
    number: "(808) 548-7961",
    description: "Power outages & emergencies"
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
          shows the latest flood information, including water levels and rainfall, in easy-to-read graphs and numbers.
          {'\n\n'}
          <Ionicons name="water" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Stream Monitor </ThemedText>
          provides real-time stream level monitoring and alerts.
          {'\n\n'}
          <Ionicons name="time" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Tide Conditions </ThemedText>
          displays current and predicted tide levels.
          {'\n\n'}
          <Ionicons name="cloudy" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Wave & Weather </ThemedText>
          shows weather conditions, wave heights, and forecasts.
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

 <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}></ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="call-outline" size={16} /> Emergency Contacts
        </ThemedText>
        
        {emergencyContacts.map((contact, index) => (
          <ThemedView key={index} style={styles.contactCard}>
            <ThemedView style={styles.contactHeader}>
              <ThemedText style={styles.contactName}>{contact.name}</ThemedText>
              <ThemedText 
                style={styles.contactNumber}
                onPress={() => Linking.openURL(`tel:${contact.number}`)}
              >
                {contact.number}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.contactDescription}>{contact.description}</ThemedText>
          </ThemedView>
        ))}
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
  contactCard: {
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
    textDecorationLine: 'underline',
  },
  contactDescription: {
    fontSize: 14,
    fontWeight: '300',
    opacity: 0.8,
  },
});
