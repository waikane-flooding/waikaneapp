//home screen
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable, Platform, RefreshControl, ScrollView, View, Dimensions } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { useState, useCallback, useEffect, useMemo } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import WaikaneStreamHeight from '@/components/visualizations/WaikaneStreamHeight';
import WaiaholeStreamHeight from '@/components/visualizations/WaiaholeStreamHeight';
import WaikaneStreamGraph from '@/components/visualizations/WaikaneStreamGraph';
import WaiaholeStreamGraph from '@/components/visualizations/WaiaholeStreamGraph';
import WaikaneTideLevel from '@/components/visualizations/WaikaneTideLevel';
import WaikaneTideGraph from '@/components/visualizations/WaikaneTideGraph';
import PunaluuStreamHeight from '@/components/visualizations/PunaluuStreamHeight';
import PunaluuStreamGraph from '@/components/visualizations/PunaluuStreamGraph';

// Types for rain data
type RainData = {
    '1HrRainfall': number;
    '6HrRainfall': number;
    'DateTime': string;
    'Name': string;
};

export default function HomeScreen() {
    // Rain data state
    const [makaiRain, setMakaiRain] = useState<{
        lastHour: string;
        lastSixHours: string;
        lastReading: string;
    }>({ lastHour: 'Loading...', lastSixHours: 'Loading...', lastReading: 'Loading...' });
    const [maukaRain, setMaukaRain] = useState<{
        lastHour: string;
        lastSixHours: string;
        lastReading: string;
    }>({ lastHour: 'Loading...', lastSixHours: 'Loading...', lastReading: 'Loading...' });
    // Fetch Makai and Mauka rain data
    const fetchRainData = useCallback(async () => {
        try {
            const res = await fetch('http://149.165.159.226:5000/api/rain_data');
            const data: RainData[] = await res.json();
            // Find latest Makai and Mauka
            const makai = data.filter(d => d.Name && d.Name.toLowerCase().includes('makai'))
                .sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime())[0];
            const mauka = data.filter(d => d.Name && d.Name.toLowerCase().includes('mauka'))
                .sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime())[0];

            if (makai) {
                setMakaiRain({
                    lastHour: makai['1HrRainfall']?.toFixed(2) + ' in',
                    lastSixHours: makai['6HrRainfall']?.toFixed(2) + ' in',
                    lastReading: new Date(makai.DateTime).toLocaleString('en-US', {
                        hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric'
                    }) + ' HST',
                });
            }
            if (mauka) {
                setMaukaRain({
                    lastHour: mauka['1HrRainfall']?.toFixed(2) + ' in',
                    lastSixHours: mauka['6HrRainfall']?.toFixed(2) + ' in',
                    lastReading: new Date(mauka.DateTime).toLocaleString('en-US', {
                        hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric'
                    }) + ' HST',
                });
            }
        } catch (e) {
            setMakaiRain({ lastHour: 'Error', lastSixHours: 'Error', lastReading: 'Error' });
            setMaukaRain({ lastHour: 'Error', lastSixHours: 'Error', lastReading: 'Error' });
        }
    }, []);
    const [refreshing, setRefreshing] = useState(false);
    const [waikaneData, setWaikaneData] = useState<{ 
        height: string | null; 
        lastReading: string | null; 
        direction: string | null;
        status: string; 
        statusColor?: string; 
    }>({ height: null, lastReading: null, direction: null, status: 'Loading...' });
    const [waiaholeData, setWaiaholeData] = useState<{ 
        height: string | null; 
        lastReading: string | null; 
        direction: string | null;
        status: string; 
        statusColor?: string; 
    }>({ height: null, lastReading: null, direction: null, status: 'Loading...' });

    // Threshold values for different stream levels
    const waikaneThresholds = useMemo(() => ({
        greenEnd: 7,
        yellowEnd: 10.8
    }), []);

    const waiaholeThresholds = useMemo(() => ({
        greenEnd: 12,
        yellowEnd: 16.4
    }), []);

    // Get status based on stream level
    const getStreamStatus = useCallback((level: number, thresholds: { greenEnd: number; yellowEnd: number }) => {
        if (level < thresholds.greenEnd) return { status: 'Normal', color: '#34C759' };
        if (level < thresholds.yellowEnd) return { status: 'Warning', color: '#FFC107' };
        return { status: 'Danger', color: '#F44336' };
    }, []);

    // Fetch Waikane and Waiahole stream data, including trend
    const fetchWaikaneData = useCallback(async () => {
        try {
            const [streamRes, trendRes] = await Promise.all([
                fetch('http://149.165.159.169:5000/api/waikane_stream'),
                fetch('http://149.165.159.169:5000/api/stream_trend')
            ]);
            const data = await streamRes.json();
            const trendData = await trendRes.json();

            const now = new Date();
            const latest = data
                .filter((d: any) => d.ft != null && d.DateTime)
                .map((d: any) => ({
                    time: new Date(d.DateTime),
                    value: d.ft
                }))
                .filter((d: any) => d.time <= now)
                .sort((a: any, b: any) => b.time - a.time)[0]; // Most recent past point

            // Find Waikane trend
            let direction: string | null = null;
            if (trendData && Array.isArray(trendData)) {
                const waikaneTrend = trendData.find((t: any) => t.Name && t.Name.toLowerCase().includes('waikane'));
                direction = waikaneTrend && waikaneTrend.Trend ? waikaneTrend.Trend : null;
            }

            if (latest) {
                const statusInfo = getStreamStatus(latest.value, waikaneThresholds);
                const formattedTime = latest.time.toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }) + ' HST';

                setWaikaneData({
                    height: `${latest.value.toFixed(2)} ft`,
                    lastReading: formattedTime,
                    direction,
                    status: statusInfo.status,
                    statusColor: statusInfo.color
                });
            }
        } catch (error) {
            console.error('Failed to load Waikane stream data', error);
            setWaikaneData({ height: 'Error', lastReading: 'Error', direction: 'Error', status: 'Error' });
        }
    }, [getStreamStatus, waikaneThresholds]);

    const fetchWaiaholeData = useCallback(async () => {
        try {
            const [streamRes, trendRes] = await Promise.all([
                fetch('http://149.165.159.169:5000/api/waiahole_stream'),
                fetch('http://149.165.159.169:5000/api/stream_trend')
            ]);
            const data = await streamRes.json();
            const trendData = await trendRes.json();

            const now = new Date();
            const latest = data
                .filter((d: any) => d.ft != null && d.DateTime)
                .map((d: any) => ({
                    time: new Date(d.DateTime),
                    value: d.ft
                }))
                .filter((d: any) => d.time <= now)
                .sort((a: any, b: any) => b.time - a.time)[0]; // Most recent past point

            // Find Waiahole trend
            let direction: string | null = null;
            if (trendData && Array.isArray(trendData)) {
                const waiaholeTrend = trendData.find((t: any) => t.Name && t.Name.toLowerCase().includes('waiahole'));
                direction = waiaholeTrend && waiaholeTrend.Trend ? waiaholeTrend.Trend : null;
            }

            if (latest) {
                const statusInfo = getStreamStatus(latest.value, waiaholeThresholds);
                const formattedTime = latest.time.toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }) + ' HST';

                setWaiaholeData({
                    height: `${latest.value.toFixed(2)} ft`,
                    lastReading: formattedTime,
                    direction,
                    status: statusInfo.status,
                    statusColor: statusInfo.color
                });
            }
        } catch (error) {
            console.error('Failed to load Waiahole stream data', error);
            setWaiaholeData({ height: 'Error', lastReading: 'Error', direction: 'Error', status: 'Error' });
        }
    }, [getStreamStatus, waiaholeThresholds]);

    // Load data on component mount
    useEffect(() => {
        fetchWaikaneData();
        fetchWaiaholeData();
        fetchRainData();
    }, [fetchWaikaneData, fetchWaiaholeData, fetchRainData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchWaikaneData(), fetchWaiaholeData(), fetchRainData()]);
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    }, [fetchWaikaneData, fetchWaiaholeData, fetchRainData]);

    const openMap = async () => {
        await WebBrowser.openBrowserAsync('https://experience.arcgis.com/experience/60260cda4f744186bbd9c67163b747d3');
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/windward-header.jpg')}
                    style={styles.headerImage}
                />
            }
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#007AFF"
                    colors={['#007AFF']}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                 <ThemedText type="title" style={[styles.thinText, { textAlign: 'center', width: '100%' }]}>Flood App</ThemedText>
            </ThemedView>

            {/* Streams Section Header */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={[styles.thinText, { textAlign: 'center', width: '100%' }]}>Streams</ThemedText>
            </ThemedView>
            {/* Stream Gauges and Graphs: horizontal scroll for mobile, side by side for web */}
            {Platform.OS === 'web' ? (
                <ThemedView style={styles.streamsRow}>
                    {/* Waikāne Stream Section */}
                    <ThemedView style={styles.streamSection}>
                        <ThemedText type="subtitle" style={styles.thinText}>
                            <Ionicons name="water" size={16} color="#007AFF" /> Waikāne
                        </ThemedText>
                        <ThemedText style={styles.chartTitle}>Waikāne Stream Height Gauge</ThemedText>
                        <ThemedView style={styles.gaugeWrapper}>
                            <WaikaneStreamHeight />
                        </ThemedView>
                        <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
                        <ThemedView style={styles.chartWrapper}>
                            <WaikaneStreamGraph />
                        </ThemedView>
                    </ThemedView>
                    {/* Waiahole Stream Section */}
                    <ThemedView style={styles.streamSection}>
                        <ThemedText type="subtitle" style={styles.thinText}>
                            <Ionicons name="water" size={16} color="#007AFF" /> Waiāhole
                        </ThemedText>
                        <ThemedText style={styles.chartTitle}>Stream Height Gauge</ThemedText>
                        <ThemedView style={styles.gaugeWrapper}>
                            <WaiaholeStreamHeight />
                        </ThemedView>
                        <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
                        <ThemedView style={styles.chartWrapper}>
                            <WaiaholeStreamGraph />
                        </ThemedView>
                    </ThemedView>
                    {/* Punaluʻu Stream Section */}
                    <ThemedView style={styles.streamSection}>
                        <ThemedText type="subtitle" style={styles.thinText}>
                            <Ionicons name="water" size={16} color="#007AFF" /> Punaluʻu
                        </ThemedText>
                        <ThemedText style={styles.chartTitle}>Stream Height Gauge</ThemedText>
                        <ThemedView style={styles.gaugeWrapper}>
                            <PunaluuStreamHeight />
                        </ThemedView>
                        <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
                        <ThemedView style={styles.chartWrapper}>
                            <PunaluuStreamGraph />
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            ) : (
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScroll}
                    contentContainerStyle={styles.horizontalScrollContent}
                >
                    {/* Waikāne Stream Section */}
                    <ThemedView style={styles.streamSection}>
                        <ThemedText type="subtitle" style={styles.thinText}>
                            <Ionicons name="water" size={16} color="#007AFF" /> Waikāne
                        </ThemedText>
                        <ThemedText style={styles.chartTitle}>Stream Height Gauge</ThemedText>
                        <WaikaneStreamHeight />
                        <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
                        <ThemedView style={styles.chartWrapper}>
                            <WaikaneStreamGraph />
                        </ThemedView>
                    </ThemedView>
                    {/* Waiahole Stream Section */}
                    <ThemedView style={styles.streamSection}>
                        <ThemedText type="subtitle" style={styles.thinText}>
                            <Ionicons name="water" size={16} color="#007AFF" /> Waiāhole
                        </ThemedText>
                        <ThemedText style={styles.chartTitle}>Stream Height Gauge</ThemedText>
                        <WaiaholeStreamHeight />
                        <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
                        <ThemedView style={styles.chartWrapper}>
                            <WaiaholeStreamGraph />
                        </ThemedView>
                    </ThemedView>
                    {/* Punaluʻu Stream Section */}
                    <ThemedView style={styles.streamSection}>
                        <ThemedText type="subtitle" style={styles.thinText}>
                            <Ionicons name="water" size={16} color="#007AFF" /> Punaluʻu
                        </ThemedText>
                        <ThemedText style={styles.chartTitle}>Stream Height Gauge</ThemedText>
                        <ThemedView style={styles.gaugeWrapper}>
                            <PunaluuStreamHeight />
                        </ThemedView>
                        <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
                        <ThemedView style={styles.chartWrapper}>
                            <PunaluuStreamGraph />
                        </ThemedView>
                    </ThemedView>
                </ScrollView>
            )}

            {/* Tide Section Header */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={[styles.thinText, { textAlign: 'center', width: '100%' }]}>Tide</ThemedText>
            </ThemedView>

            {/* Kanehoe Tide Label */}
            <ThemedText type="subtitle" style={styles.thinText}>
                <Ionicons name="water" size={16} color="#007AFF" /> Waikāne
            </ThemedText>

            {/* Tide Gauge and Trend */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.chartTitle}>Tide Height Gauge</ThemedText>
                <WaikaneTideLevel />
                <ThemedText style={styles.chartTitle}>Tide Trend Graph</ThemedText>
                <ThemedView style={styles.chartWrapper}>
                    <WaikaneTideGraph />
                </ThemedView>
            </ThemedView>

            {/* Rain Section Header */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={[styles.thinText, { textAlign: 'center', width: '100%' }]}>Rain</ThemedText>
            </ThemedView>

            {/* Makai Rain Label */}
            <ThemedText type="subtitle" style={styles.thinText}>
                <Ionicons name="rainy" size={16} color="#007AFF" /> Makai (towards the ocean)
            </ThemedText>
            <ThemedText style={[styles.thinText, { fontSize: 13, color: '#666', marginBottom: 8, marginLeft: 2 }]}>
                837.7 Waiahole RG at Kamehameha Hwy., Oahu, HI - USGS-212855157504501
            </ThemedText>

            {/* Makai Rain Info Box */}
            <ThemedView style={styles.monitorInfo}>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Hour:</ThemedText>
                    <ThemedText style={styles.value}>{makaiRain.lastHour}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Six Hours:</ThemedText>
                    <ThemedText style={styles.value}>{makaiRain.lastSixHours}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Reading:</ThemedText>
                    <ThemedText style={styles.value}>{makaiRain.lastReading}</ThemedText>
                </ThemedView>
            </ThemedView>

            {/* Mauka Rain Label */}
            <ThemedText type="subtitle" style={styles.thinText}>
                <Ionicons name="rainy" size={16} color="#007AFF" /> Mauka (towards the mountain)
            </ThemedText>
            <ThemedText style={[styles.thinText, { fontSize: 13, color: '#666', marginBottom: 8, marginLeft: 2 }]}>
                883.12 Poamoho Rain Gage No 1, nr Wahiawa, Oahu,HI - USGS-213215157552800
            </ThemedText>

            {/* Mauka Rain Info Box */}
            <ThemedView style={styles.monitorInfo}>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Hour:</ThemedText>
                    <ThemedText style={styles.value}>{maukaRain.lastHour}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Six Hours:</ThemedText>
                    <ThemedText style={styles.value}>{maukaRain.lastSixHours}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Reading:</ThemedText>
                    <ThemedText style={styles.value}>{maukaRain.lastReading}</ThemedText>
                </ThemedView>
            </ThemedView>

            {/*
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.thinText}>
                    <Ionicons name="map" size={16} color="#007AFF" /> Interactive Flood Risk Map
                </ThemedText>
                <ThemedText style={[styles.thinText, { marginBottom: 12 }]}>Powered by ArcGIS mapping technology</ThemedText>
                <ThemedView style={styles.mapContainer}>
                    <Pressable style={styles.mapPreviewPressable} onPress={openMap}>
                        <Image
                            source={require('@/assets/images/map-preview-placeholder.png')}
                            style={styles.mapPreview}
                            contentFit="cover"
                            accessibilityLabel="Map preview"
                        />
                        <ThemedView style={styles.mapPreviewOverlay} pointerEvents="none">
                            <ThemedView style={styles.mapPreviewTextBg}>
                                <Ionicons name="map" size={28} color="#fff" style={{ marginBottom: 10, textShadowColor: '#222', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 }} />
                                <ThemedText style={styles.mapButtonText}>Open Interactive Flood Risk Map</ThemedText>
                                <ThemedText style={styles.mapButtonSubtext}>View flood-prone areas and monitoring stations</ThemedText>
                                <Ionicons name="open-outline" size={18} color="#fff" style={{ marginTop: 10, textShadowColor: '#222', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 }} />
                            </ThemedView>
                        </ThemedView>
                    </Pressable>
                </ThemedView>
            </ThemedView>
            */}
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    gaugeWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        transform: [{ scale: 0.48 }],
    },
    horizontalScroll: {
        width: '100%',
        marginBottom: 16,
    },
    horizontalScrollContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ...existing code...
    headerImage: {
        width: '100%',
        height: '100%',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    section: {
        marginBottom: 16,
        gap: 4,
    },
    thinText: {
        fontWeight: '300',
    },
    monitorInfo: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontWeight: '500',
        fontSize: 16,
    },
    value: {
        fontWeight: '300',
        fontSize: 16,
        color: '#007AFF',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    statusBar: {
        backgroundColor: '#34C759',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    streamsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 16,
        width: '100%',
    },
    streamSection: {
        flex: 1,
        minWidth: 0,
        maxWidth: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    // ...existing code...
        chartWrapper: {
            width: '100%',
            alignItems: 'center',
            transform: Platform.OS === 'web' ? [] : [{ scale: 0.58 }],
            transformOrigin: 'center',
            marginBottom: 12,
        },
    chartTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: Platform.OS === 'web' ? 4 : 0,
        textAlign: 'center',
    },
    chartPlaceholder: {
        height: 200,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#007AFF',
        fontWeight: '500',
        fontSize: 14,
    },
    streamInfoContainer: {
        gap: 16,
        marginBottom: 16,
    },
    streamCard: {
        backgroundColor: 'rgba(0, 122, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.2)',
    },
    streamTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#007AFF',
    },
    streamDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
        fontWeight: '300',
    },
    streamDetails: {
        gap: 4,
    },
    detailItem: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
        marginTop: 8,
    },
    mapPlaceholderText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 16,
        marginTop: 8,
    },
    mapSubtext: {
        color: '#007AFF',
        fontWeight: '400',
        fontSize: 12,
        marginTop: 4,
    },
    mapContainer: {
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.2)',
        overflow: 'hidden',
    },
    webView: {
        height: 400,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    mapButton: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
        minHeight: 120,
    },
    mapButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 6,
        textShadowColor: '#222',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        letterSpacing: 0.2,
    },
    mapButtonSubtext: {
        fontSize: 15,
        fontWeight: '400',
        color: '#fff',
        textAlign: 'center',
        opacity: 0.92,
        marginBottom: 2,
        textShadowColor: '#222',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        letterSpacing: 0.1,
    },
    loadingContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
        borderRadius: 8,
    },
    loadingText: {
        color: '#007AFF',
        fontWeight: '500',
        fontSize: 16,
        marginTop: 8,
    },
    mapPreview: {
        width: '100%',
        height: 220, // expanded height for better mobile appearance
        borderRadius: 12,
        marginBottom: 0,
        backgroundColor: '#e0e0e0',
        borderWidth: 0, // no border
    },
    mapPreviewPressable: {
        position: 'relative',
        width: '100%',
        height: 220,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    mapPreviewOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,122,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    mapPreviewTextBg: {
        backgroundColor: 'rgba(20, 30, 60, 0.55)',
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        // Removed borderWidth and borderColor for cleaner look
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
        width: '100%', // expand overlay to match image width
        minHeight: 120,
    },
    gaugeContainer: {
        backgroundColor: '#181f2a', // dark blue/gray for contrast
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 8,
        marginBottom: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 8,
        elevation: 4,
    },
    gaugeInnerBg: {
        backgroundColor: '#181f2a', // match gaugeContainer
        borderRadius: 12,
        padding: 12,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});