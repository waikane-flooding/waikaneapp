//home screen
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable, Platform, RefreshControl, ScrollView, View, Dimensions, ActivityIndicator } from 'react-native';
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

// Weather constants
const KANEOHE_COORDS = { lat: 21.4181, lon: -157.8036 };

export default function HomeScreen() {
    // Helper to get color for rainfall value
    function getMakaiRainColor(val: string) {
        const num = parseFloat(val);
        if (isNaN(num)) return '#007AFF';
        if (num < 2.8) return '#34C759'; // green
        if (num < 4.1) return '#FFC107'; // yellow
        if (num <= 6) return '#F44336'; // red
        return '#007AFF';
    }
    function getMaukaRainColor(val: string) {
        const num = parseFloat(val);
        if (isNaN(num)) return '#007AFF';
        if (num < 3.11) return '#34C759'; // green
        if (num < 4.54) return '#FFC107'; // yellow
        if (num <= 7) return '#F44336'; // red
        return '#007AFF';
    }
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
                    }),
                });
            }
            if (mauka) {
                setMaukaRain({
                    lastHour: mauka['1HrRainfall']?.toFixed(2) + ' in',
                    lastSixHours: mauka['6HrRainfall']?.toFixed(2) + ' in',
                    lastReading: new Date(mauka.DateTime).toLocaleString('en-US', {
                        hour: '2-digit', minute: '2-digit', hour12: true, month: 'short', day: 'numeric'
                    }),
                });
            }
        } catch (e) {
            setMakaiRain({ lastHour: 'Error', lastSixHours: 'Error', lastReading: 'Error' });
            setMaukaRain({ lastHour: 'Error', lastSixHours: 'Error', lastReading: 'Error' });
        }
    }, []);
    
    // Weather data state
    const [forecast, setForecast] = useState<any[]>([]);
    const [forecastLoading, setForecastLoading] = useState(true);
    const [forecastError, setForecastError] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [alertsError, setAlertsError] = useState<string | null>(null);
    
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
                });

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
                });

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

    // Fetch weather forecast
    const fetchForecast = useCallback(async () => {
        setForecastLoading(true);
        setForecastError(null);
        try {
            const pointsResp = await fetch(`https://api.weather.gov/points/${KANEOHE_COORDS.lat},${KANEOHE_COORDS.lon}`);
            const pointsData = await pointsResp.json();
            const forecastUrl = pointsData.properties.forecast;
            const forecastResp = await fetch(forecastUrl);
            const forecastData = await forecastResp.json();
            setForecast(forecastData.properties.periods.slice(0, 6));
        } catch {
            setForecastError('Unable to load forecast.');
        } finally {
            setForecastLoading(false);
        }
    }, []);

    // Fetch weather alerts
    const fetchAlerts = useCallback(async () => {
        setAlertsLoading(true);
        setAlertsError(null);
        try {
            const resp = await fetch('https://api.weather.gov/alerts/active?area=HI');
            const data = await resp.json();
            const eastOahuSpecificAreas = [
                'Kāneʻohe', 'Kaneohe', 'Waikāne', 'Waikane', 'Waiahole', 'Kualoa', 'Waimanalo', 
                'Heʻeia', 'Heeia', 'Windward Oahu', 'Koʻolaupoko', 'Koolaupoko', 'Oahu Windward'
            ];
            const excludeKeywords = ['Coastal', 'Marine', 'Winter'];
            const excludeOtherIslands = [
                'Maui', 'Big Island', 'Kauai', 'Molokai', 'Lanai', 'Kahoolawe', 'Kona', 'Hilo', 'Kohala'
            ];
            
            const filtered = (data.features || []).filter((alert: any) => {
                const event = alert.properties.event || '';
                const headline = alert.properties.headline || '';
                const desc = alert.properties.areaDesc || '';
                
                if (excludeKeywords.some(word => event.includes(word) || headline.includes(word))) return false;
                if (excludeOtherIslands.some(island => desc.includes(island))) return false;
                
                const includeGeneralOahu = desc.includes('East Honolulu') || desc.includes('Honolulu Metro');
                const includeSpecificEastOahu = eastOahuSpecificAreas.some(area => desc.includes(area));
                
                return includeGeneralOahu || includeSpecificEastOahu;
            });
            setAlerts(filtered);
        } catch {
            setAlertsError('Unable to load alerts.');
        } finally {
            setAlertsLoading(false);
        }
    }, []);

    // Load data on component mount
    useEffect(() => {
        fetchWaikaneData();
        fetchWaiaholeData();
        fetchRainData();
        fetchForecast();
        fetchAlerts();
    }, [fetchWaikaneData, fetchWaiaholeData, fetchRainData, fetchForecast, fetchAlerts]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchWaikaneData(), fetchWaiaholeData(), fetchRainData(), fetchForecast(), fetchAlerts()]);
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    }, [fetchWaikaneData, fetchWaiaholeData, fetchRainData, fetchForecast, fetchAlerts]);

    const openMap = async () => {
        await WebBrowser.openBrowserAsync('https://experience.arcgis.com/experience/60260cda4f744186bbd9c67163b747d3');
    };

    // Stream chart navigation logic
    const streamCharts = [
        {
            name: 'Waikāne',
            gauge: <WaikaneStreamHeight />,
            graph: <WaikaneStreamGraph />,
        },
        {
            name: 'Waiāhole',
            gauge: <WaiaholeStreamHeight />,
            graph: <WaiaholeStreamGraph />,
        },
        {
            name: 'Punaluʻu',
            gauge: <PunaluuStreamHeight />,
            graph: <PunaluuStreamGraph />,
        },
    ];
    const [streamIdx, setStreamIdx] = useState(0);
    const currentStream = streamCharts[streamIdx];

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
                <ThemedView style={styles.funTitleContainer}>
                    <ThemedText type="title" style={[styles.thinText, styles.appTitle]}>Flood App</ThemedText>
                </ThemedView>
            </ThemedView>

            {/* Streams Section Header */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={[styles.thinText, styles.sectionHeaderText]}>Streams</ThemedText>
            </ThemedView>
            {/* Single stream chart container with navigation arrows */}
            <ThemedView style={[styles.streamSection, { alignItems: 'center', justifyContent: 'center', width: '100%' }]}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Pressable
                        onPress={() => setStreamIdx(i => Math.max(0, i - 1))}
                        disabled={streamIdx === 0}
                        style={({ pressed }) => ({ opacity: streamIdx === 0 ? 0.3 : pressed ? 0.6 : 1, marginRight: 12 })}
                        accessibilityLabel="Previous stream"
                    >
                        <Ionicons name="arrow-back-circle" size={36} color="#007AFF" />
                    </Pressable>
                    <ThemedText type="subtitle" style={styles.thinText}>
                        <Ionicons name="water" size={16} color="#007AFF" /> {currentStream.name}
                    </ThemedText>
                    <Pressable
                        onPress={() => setStreamIdx(i => Math.min(streamCharts.length - 1, i + 1))}
                        disabled={streamIdx === streamCharts.length - 1}
                        style={({ pressed }) => ({ opacity: streamIdx === streamCharts.length - 1 ? 0.3 : pressed ? 0.6 : 1, marginLeft: 12 })}
                        accessibilityLabel="Next stream"
                    >
                        <Ionicons name="arrow-forward-circle" size={36} color="#007AFF" />
                    </Pressable>
                </ThemedView>
                <ThemedText style={styles.chartTitle}>Stream Height Gauge</ThemedText>
                <ThemedView style={styles.gaugeWrapper}>{currentStream.gauge}</ThemedView>
                <ThemedText style={styles.chartTitle}>Stream Height Trend</ThemedText>
                <ThemedView style={styles.chartWrapper}>{currentStream.graph}</ThemedView>
            </ThemedView>

            {/* ...existing code... */}

            {/* Tide Section Header */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={[styles.thinText, styles.sectionHeaderText]}>Tide</ThemedText>
            </ThemedView>

            {/* Kanehoe Tide Label */}
            <ThemedText type="subtitle" style={styles.thinText}>
                <Ionicons name="water" size={16} color="#007AFF" /> Waikāne
            </ThemedText>
            <ThemedText style={[styles.thinText, { fontSize: 13, color: '#666', marginBottom: 8, marginLeft: 2 }]}>
                TPT2777 Waikane, Kaneohe Bay (MLLW)
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
                <ThemedText type="subtitle" style={[styles.thinText, styles.sectionHeaderText]}>Rain</ThemedText>
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
                    <ThemedText style={[styles.value, { color: getMakaiRainColor(makaiRain.lastHour) }]}>{makaiRain.lastHour}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Six Hours:</ThemedText>
                    <ThemedText style={[styles.value, { color: getMakaiRainColor(makaiRain.lastSixHours) }]}>{makaiRain.lastSixHours}</ThemedText>
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
                    <ThemedText style={[styles.value, { color: getMaukaRainColor(maukaRain.lastHour) }]}>{maukaRain.lastHour}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoItem}>
                    <ThemedText style={styles.label}>Last Six Hours:</ThemedText>
                    <ThemedText style={[styles.value, { color: getMaukaRainColor(maukaRain.lastSixHours) }]}>{maukaRain.lastSixHours}</ThemedText>
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

            {/* Weather Section Header */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={[styles.thinText, styles.sectionHeaderText]}>Weather</ThemedText>
            </ThemedView>

            {/* Weather Forecast */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.thinText}>
                    <Ionicons name="calendar" size={16} color="#4169E1" /> Waiāhole 3-Day Forecast
                </ThemedText>
                
                <ThemedView style={styles.forecastCardHorizontal}>
                    <ScrollView style={styles.forecastScroll} horizontal showsHorizontalScrollIndicator={false}>
                        {forecastLoading ? (
                            <ThemedText style={styles.placeholderText}>Loading forecast...</ThemedText>
                        ) : forecastError ? (
                            <ThemedText style={[styles.placeholderText, { color: 'red' }]}>{forecastError}</ThemedText>
                        ) : forecast.length > 0 ? (
                            forecast.map((period: any) => (
                                <ThemedView key={period.number} style={styles.forecastCardItem}>
                                    <Ionicons name={getForecastIcon(period.shortForecast)} size={32} color="#4169E1" style={{ marginBottom: 6 }} />
                                    <ThemedText style={styles.forecastTitle}>{period.name}</ThemedText>
                                    <ThemedText style={styles.forecastTemp}>{period.temperature}°{period.temperatureUnit}</ThemedText>
                                    <ThemedText style={styles.forecastText}>{period.shortForecast}</ThemedText>
                                </ThemedView>
                            ))
                        ) : (
                            <ThemedText style={styles.placeholderText}>No forecast data available.</ThemedText>
                        )}
                    </ScrollView>
                </ThemedView>
            </ThemedView>

            {/* Weather Alerts */}
            <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={[styles.thinText, { marginBottom: 18 }]}>
                    National Weather Service Updates
                </ThemedText>

                {alertsLoading ? (
                    <ThemedView style={styles.alertsCard}>
                        <ActivityIndicator size="small" color="#d9534f" />
                    </ThemedView>
                ) : alertsError ? (
                    <ThemedView style={styles.alertsCard}>
                        <ThemedText style={[styles.placeholderText, { color: '#d9534f' }]}>{alertsError}</ThemedText>
                    </ThemedView>
                ) : alerts.length > 0 ? (
                    <ThemedView style={styles.alertsCard}>
                        {alerts.map((alert: any) => {
                            const alertSeverity = getAlertSeverity(alert);
                            return (
                                <ThemedView 
                                    key={alert.id} 
                                    style={[
                                        styles.alertItem,
                                        { 
                                            backgroundColor: alertSeverity.bgColor,
                                            borderLeftWidth: 4,
                                            borderLeftColor: alertSeverity.color
                                        }
                                    ]}
                                >
                                    <ThemedView style={styles.alertHeader}>
                                        <ThemedText style={[styles.alertTitle, { color: alertSeverity.color }]}>
                                            {alert.properties.event}
                                        </ThemedText>
                                        <ThemedView style={[styles.severityBadge, { backgroundColor: alertSeverity.color }]}>
                                            <ThemedText style={styles.severityText}>
                                                {alertSeverity.level.toUpperCase()}
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                    <ThemedText style={styles.alertTime}>
                                        {alert.properties.effective ? `From: ${new Date(alert.properties.effective).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}` : ''}
                                        {alert.properties.ends ? `  To: ${new Date(alert.properties.ends).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}` : ''}
                                    </ThemedText>
                                    <ThemedText style={styles.alertArea}>{alert.properties.areaDesc}</ThemedText>
                                    {alert.properties.headline && (
                                        <ThemedText style={[styles.alertHeadline, { color: alertSeverity.color }]}>
                                            {alert.properties.headline}
                                        </ThemedText>
                                    )}
                                </ThemedView>
                            );
                        })}
                    </ThemedView>
                ) : (
                    <ThemedText style={styles.noAlertsText}>No active updates for East Oʻahu/Windward side.</ThemedText>
                )}
            </ThemedView>

        </ParallaxScrollView>
    );
}

// Helper function for forecast icons
function getForecastIcon(shortForecast: string) {
    const text = shortForecast.toLowerCase();
    if (text.includes('rain')) return 'rainy';
    if (text.includes('showers')) return 'rainy-outline';
    if (text.includes('cloud')) return 'cloudy';
    if (text.includes('sun') || text.includes('clear')) return 'sunny';
    if (text.includes('haze')) return 'partly-sunny';
    if (text.includes('wind')) return 'flag';
    return 'cloud-outline';
}

// Helper function to determine alert severity and color
function getAlertSeverity(alert: any) {
    const event = alert.properties.event?.toLowerCase() || '';
    const severity = alert.properties.severity?.toLowerCase() || '';
    
    if (severity === 'extreme' || severity === 'severe' || 
        event.includes('warning') || event.includes('watch') || 
        event.includes('tornado') || event.includes('hurricane') || 
        event.includes('flash flood') || event.includes('severe thunderstorm')) {
        return { color: '#FF3B30', bgColor: 'rgba(255, 59, 48, 0.1)', level: 'high' };
    }
    
    if (severity === 'moderate' || 
        event.includes('advisory') || event.includes('statement') || 
        event.includes('flood') || event.includes('wind') || 
        event.includes('rain')) {
        return { color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.1)', level: 'medium' };
    }
    
    return { color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.1)', level: 'low' };
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
    funTitleContainer: {
        backgroundColor: 'rgba(0, 122, 255, 0.08)',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 24,
        marginHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 2,
        borderColor: 'rgba(0, 122, 255, 0.2)',
        width: '100%',
        alignSelf: 'center',
    },
    titleEmoji: {
        fontSize: 28,
        marginHorizontal: 12,
    },
    appTitle: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: '600',
        color: '#007AFF',
        letterSpacing: 1,
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
    // Weather styles
    alertsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    alertItem: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    severityText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    alertTime: {
        fontSize: 12,
        fontWeight: '400',
        color: '#666',
        marginBottom: 4,
    },
    alertArea: {
        fontSize: 12,
        fontWeight: '400',
        color: '#888',
        marginBottom: 6,
    },
    alertHeadline: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 18,
    },
    noAlertsText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#34C759',
        textAlign: 'center',
        padding: 16,
    },
    description: {
        fontSize: 14,
        fontWeight: '300',
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    forecastCardHorizontal: {
        backgroundColor: 'rgba(65, 105, 225, 0.05)',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    forecastScroll: {
        flexDirection: 'row',
    },
    forecastCardItem: {
        backgroundColor: 'rgba(65, 105, 225, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginRight: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    forecastTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    forecastTemp: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4169E1',
        marginBottom: 4,
    },
    forecastText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    sectionHeaderContainer: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeaderText: {
        textAlign: 'center',
        width: '100%',
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF',
    },
});