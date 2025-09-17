//home screen
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/windward-header.jpg')}
                    style={styles.headerImage}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" style={styles.thinText}>
                    Waikāne Flood Tracker
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
});