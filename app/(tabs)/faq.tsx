import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function FAQScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F5E8', dark: '#2D4A2D' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#4CAF50"
          name="questionmark.circle"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Frequently Asked Questions</ThemedText>
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
          provides app information, quick actions, and emergency contact numbers for immediate assistance.
          {'\n\n'}
          <Ionicons name="water" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Stream Monitor </ThemedText>
          shows real-time monitoring for Waikāne and Waiahole streams with current height, status, gauge charts, and stream location maps.
          {'\n\n'}
          <Ionicons name="time" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Tide Conditions </ThemedText>
          displays Kāneʻohe Bay tide monitoring with current height, tide direction, high/low tide times, and tide level charts.
          {'\n\n'}
          <Ionicons name="cloudy" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Wave & Weather </ThemedText>
          provides weather alerts, 3-day forecasts, and surf conditions for the Kāneʻohe/Waikāne area.
        </ThemedText>
      </Collapsible>

      <Collapsible title="How often is the data updated?">
        <ThemedText style={styles.thinText}>
          <Ionicons name="refresh" size={16} color="#4CAF50" />{' '}
          Data updates automatically when you open each section:
          {'\n\n'}
          • Weather forecasts and alerts: Live from National Weather Service
          {'\n'}
          • Stream monitoring: Real-time data when available
          {'\n'}
          • Tide information: Current NOAA predictions
        </ThemedText>
      </Collapsible>

      <Collapsible title="What should I do during a flood warning?">
        <ThemedText style={styles.thinText}>
          <Ionicons name="shield-checkmark" size={16} color="#FF3B30" />{' '}
          Safety first! Follow these important steps:
          {'\n\n'}
          • Monitor stream levels and weather alerts in the app
          {'\n'}
          • Never drive through flooded roads - Turn Around, Don&apos;t Drown
          {'\n'}
          • Stay away from fast-moving water
          {'\n'}
          • Have an evacuation plan ready
          {'\n'}
          • Call 911 for emergencies
        </ThemedText>
      </Collapsible>

      <Collapsible title="Are there any limitations?">
        <ThemedText style={styles.thinText}>
          <Ionicons name="information-circle" size={16} color="#FF9500" />{' '}
          Please be aware:
          {'\n\n'}
          • Live stream data depends on monitoring equipment availability
          {'\n'}
          • Surf conditions link to external sources (no live API available)
          {'\n'}
          • Weather alerts are filtered for East Oʻahu relevance
          {'\n'}
          • This app supplements but doesn&apos;t replace official emergency services
        </ThemedText>
      </Collapsible>

      <Collapsible title="Where can I find more help?">
        <ThemedText style={styles.thinText}>
          Have more questions or need help with the app? You can reach out to us for support or provide feedback about app accuracy.
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
          <ThemedText style={[styles.thinText, {fontSize: 12, color: '#666', fontStyle: 'italic'}]}>
            Share comments about app accuracy and general feedback
          </ThemedText>
        </ThemedText>
      </Collapsible>

      <ThemedView style={styles.disclaimerSection}>
        <ThemedText style={styles.disclaimerTitle}>
          <Ionicons name="alert-circle-outline" size={18} color="#FF3B30" />{' '}
          Important Disclaimer
        </ThemedText>
        <ThemedText style={styles.disclaimerText}>
          This app is for informational and educational use only. It combines flooding data to raise awareness in Waikāne and Waiāhole, but is not intended for emergency response, evacuation planning, or real-time decision-making. Information is experimental and may not reflect current conditions. Do not rely on this app for safety decisions. For official guidance, consult agencies like the Hawai&apos;i Emergency Management Agency and the National Weather Service.
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
  thinText: {
    fontWeight: '300',
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
