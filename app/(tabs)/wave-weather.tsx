/*
  -weather forecast will update automatically
  -fetches live forecast data from the National Weather Service API every time the user opens or refreshes the screen.
  -NWS for the Kāneʻohe/Waiahole area.
  - wanted to use NOAA Weather Prediction Center (WPC) does not offer a public, CORS-enabled API
*/

/*
  -surf forecast link to surf news network
  -clickable button to open in browser
  -NWS didn't have detailed info on surf forecast
  -Surfline API requires an API key and is not public. Need to apply for access, and it’s not open for free use.
  -Surf News Network (SNN) data is blocked by CORS so app can’t fetch it directly.
*/

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const KANEOHE_COORDS = { lat: 21.4181, lon: -157.8036 };

export default function WaveWeatherScreen() {
  const [forecast, setForecast] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      setForecastLoading(true);
      setForecastError(null);
      try {
        // 1. Get gridpoint info for coordinates
        const pointsResp = await fetch(`https://api.weather.gov/points/${KANEOHE_COORDS.lat},${KANEOHE_COORDS.lon}`);
        const pointsData = await pointsResp.json();
        const forecastUrl = pointsData.properties.forecast;
        // 2. Get forecast
        const forecastResp = await fetch(forecastUrl);
        const forecastData = await forecastResp.json();
        setForecast(forecastData.properties.periods.slice(0, 6));
      } catch {
        setForecastError('Unable to load forecast.');
      } finally {
        setForecastLoading(false);
      }
    }
    fetchForecast();
  }, []);

  useEffect(() => {
    async function fetchAlerts() {
      setAlertsLoading(true);
      setAlertsError(null);
      try {
        const resp = await fetch('https://api.weather.gov/alerts/active?area=HI');
        const data = await resp.json();
        // Filter out Coastal/Marine and Winter hazards, and only include alerts specifically for East Oʻahu areas
        // Only show alerts that are primarily for East Oahu locations, not multi-island alerts
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
          
          // Exclude if event or headline contains any exclude keywords
          if (excludeKeywords.some(word => event.includes(word) || headline.includes(word))) return false;
          
          // Exclude alerts that mention other islands (these are usually multi-island alerts)
          if (excludeOtherIslands.some(island => desc.includes(island))) return false;
          
          // Only include if areaDesc contains East Honolulu, Honolulu Metro, or specific east Oahu areas
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
    }
    fetchAlerts();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#B0E0E6', dark: '#2F4F4F' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#4169E1"
          name="cloud"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.thinText}>Weather Conditions</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.thinText, { marginBottom: 18 }]}>
          <Ionicons name="warning" size={18} color="#d9534f" /> National Weather Service Alerts & Warnings
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
                    {alert.properties.effective ? `From: ${new Date(alert.properties.effective).toLocaleString()}` : ''}
                    {alert.properties.ends ? `  To: ${new Date(alert.properties.ends).toLocaleString()}` : ''}
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
          <ThemedText style={styles.noAlertsText}>No active alerts for East Oʻahu/Windward side.</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.thinText}>
          <Ionicons name="calendar" size={16} color="#4169E1" /> 3-Day Weather Forecast
        </ThemedText>
        <ThemedText style={styles.description}>
          Waikāne/Waiahole Area - National Weather Service
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

      {/* <ThemedView style={styles.section}>
        <ThemedText style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 36 }}>
          Surf Forecast - Oʻahu East
        </ThemedText>
        <SurfForecastLink />
      </ThemedView> */}
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
  
  // High severity (red) - immediate danger
  if (severity === 'extreme' || severity === 'severe' || 
      event.includes('warning') || event.includes('watch') || 
      event.includes('tornado') || event.includes('hurricane') || 
      event.includes('flash flood') || event.includes('severe thunderstorm')) {
    return { color: '#FF3B30', bgColor: 'rgba(255, 59, 48, 0.1)', level: 'high' };
  }
  
  // Medium severity (yellow/orange) - caution needed
  if (severity === 'moderate' || 
      event.includes('advisory') || event.includes('statement') || 
      event.includes('flood') || event.includes('wind') || 
      event.includes('rain')) {
    return { color: '#FF9500', bgColor: 'rgba(255, 149, 0, 0.1)', level: 'medium' };
  }
  
  // Low severity (green) - informational
  return { color: '#34C759', bgColor: 'rgba(52, 199, 89, 0.1)', level: 'low' };
}

// Update the SurfForecastLink button to remove the icon and ensure the text is centered
/* function SurfForecastLink() {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#1976d2',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
      onPress={() => Linking.openURL('https://www.surfnewsnetwork.com')}
      accessibilityRole="link"
      activeOpacity={0.85}
    >
      <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.2, textAlign: 'center' }}>
        Click here to access Surf News Network
      </ThemedText>
    </TouchableOpacity>
  );
} */

const styles = StyleSheet.create({
  headerImage: {
    color: '#4169E1',
    bottom: -30,
    left: -35,
    position: 'absolute',
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
    backgroundColor: 'rgba(65, 105, 225, 0.1)',
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
    color: '#4169E1',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.7,
    marginBottom: 8,
  },
  forecastCardHorizontal: {
    marginTop: 8,
    marginBottom: 12,
  },
  forecastScroll: {
    flexDirection: 'row',
    gap: 12,
    overflow: 'scroll',
  },
  forecastCardItem: {
    backgroundColor: 'rgba(65, 105, 225, 0.13)',
    borderRadius: 12,
    padding: 14,
    minWidth: 130,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#4169E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  placeholderText: {
    color: '#4169E1',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  subText: {
    color: '#4169E1',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(65, 105, 225, 0.04)',
    borderRadius: 8,
    padding: 10,
  },
  forecastTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#4169E1',
    marginBottom: 2,
  },
  forecastTemp: {
    fontWeight: '700',
    color: '#007AFF',
    fontSize: 16,
  },
  forecastText: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  alertsCard: {
    backgroundColor: 'rgba(217, 83, 79, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 79, 0.18)',
    shadowColor: '#d9534f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  alertItem: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 83, 79, 0.13)',
    borderRadius: 8,
    padding: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  alertArea: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  alertHeadline: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  noAlertsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34C759',
    textAlign: 'center',
    padding: 16,
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
});
