import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

// Conditionally import WebView only for mobile platforms
let WebView;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('WebView not available');
  }
}

const Map = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [coordinates, setCoordinates] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    // Define rain gauge data directly to avoid import issues
    const rainGaugeData = [
      {
        "name": "Poamoho Rain Gauge",
        "path": [{"lat": 21.533861100000024, "lon": -157.92138889999998}]
      },
      {
        "name": "Waiahole Rain Gauge", 
        "path": [{"lat": 21.48197220000003, "lon": -157.84583329999998}]
      }
    ];

    // Extract coordinates
    const coords = rainGaugeData.map(gauge => ({
      lat: gauge.path[0].lat,
      lon: gauge.path[0].lon,
      name: gauge.name
    }));
    
    setCoordinates(coords);

    // Create HTML content for the map
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
            overflow: hidden;
          }
          #map { 
            width: 100%; 
            height: 100vh; 
          }
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 16px;
            color: #666;
          }
        </style>
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
      </head>
      <body>
        <div class="loading" id="loading">Loading map...</div>
        <div id="map" style="display: none;"></div>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const data = [{
              type: 'scattermapbox',
              mode: 'markers',
              lon: ${JSON.stringify(coords.map(x => x.lon))},
              lat: ${JSON.stringify(coords.map(x => x.lat))},
              marker: {
                size: 14,
                symbol: 'circle',
                color: 'red',
                opacity: 0.8
              },
              name: 'Rain Gauges',
              text: ${JSON.stringify(coords.map(x => x.name))},
              hovertemplate: '<b>%{text}</b><extra></extra>',
              customdata: ${JSON.stringify(coords.map(x => x.name))}
            }];
            
            const layout = {
              title: {
                text: 'Rain Gauge Locations',
                font: { size: 18, family: "Arial", color: "black" }
              },
              mapbox: {
                style: "open-street-map",
                center: { 
                  lat: ${coords[0].lat}, 
                  lon: ${coords[0].lon} 
                },
                zoom: 10
              },
              margin: { r: 10, t: 50, l: 10, b: 10 },
              autosize: true
            };
            
            const config = {
              responsive: true,
              displayModeBar: false,
              scrollZoom: true,
              doubleClick: 'reset'
            };
            
            // Hide loading and show map
            document.getElementById('loading').style.display = 'none';
            document.getElementById('map').style.display = 'block';
            
            Plotly.newPlot('map', data, layout, config).then(function() {
              console.log('Map loaded successfully');
            }).catch(function(error) {
              console.error('Error loading map:', error);
              document.getElementById('loading').innerHTML = 'Error loading map';
              document.getElementById('loading').style.display = 'flex';
            });
          });
        </script>
      </body>
      </html>
    `;

    setHtmlContent(html);
  }, []);

  if (Platform.OS === 'web') {
    // For web platform, create Plotly map directly
    useEffect(() => {
      if (mapRef.current && coordinates.length > 0) {
        // Load Plotly dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
        script.onload = () => {
          if (window.Plotly && mapRef.current) {
            const data = [{
              type: 'scattermapbox',
              mode: 'markers',
              lon: coordinates.map(x => x.lon),
              lat: coordinates.map(x => x.lat),
              marker: {
                size: 14,
                symbol: 'circle',
                color: 'red',
                opacity: 0.8
              },
              name: 'Rain Gauges',
              text: coordinates.map(x => x.name),
              hovertemplate: '<b>%{text}</b><extra></extra>',
              customdata: coordinates.map(x => x.name)
            }];
            
            const layout = {
              title: {
                text: 'Rain Gauge Locations',
                font: { size: 18, family: "Arial", color: "black" }
              },
              mapbox: {
                style: "open-street-map",
                center: { 
                  lat: coordinates[0].lat, 
                  lon: coordinates[0].lon 
                },
                zoom: 10
              },
              margin: { r: 10, t: 50, l: 10, b: 10 },
              autosize: true
            };
            
            const config = {
              responsive: true,
              displayModeBar: false,
              scrollZoom: true,
              doubleClick: 'reset'
            };

            window.Plotly.newPlot(mapRef.current, data, layout, config);
          }
        };
        
        // Only add script if it's not already loaded
        if (!window.Plotly) {
          document.head.appendChild(script);
        } else {
          script.onload();
        }
      }
    }, [htmlContent]);

    return (
      <View style={styles.container}>
        <div 
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#fff'
          }}
        />
      </View>
    );
  }

  // For mobile platforms, use WebView
  if (!WebView) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>WebView not available</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {htmlContent ? (
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onLoadEnd={() => console.log('Mobile map loaded')}
          onError={(error) => console.error('WebView error:', error)}
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: 300,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default Map;
