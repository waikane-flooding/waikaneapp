// explore aka FAQ tab
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="questionmark.circle"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>FAQ</ThemedText>
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
          <Ionicons name="water" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> Home </ThemedText>
          shows the latest flood information, including water levels and rainfall, in easy-to-read graphs and numbers.
          {'\n\n'}
          <Ionicons name="help-circle-outline" size={16} color="#007AFF" />
          <ThemedText type="defaultSemiBold" style={styles.thinText}> FAQ </ThemedText>
          provides answers to common questions about the app, flood safety, and contact information for any extra support or feedback.
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
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  thinText: {
    fontWeight: '300',
  },
});
