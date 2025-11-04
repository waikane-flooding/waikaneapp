import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import StreamGauges from './PlotlyData/StreamGauges.json';
import Tides from './PlotlyData/Tides.json';

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
  const [coordinates, setCoordinates] = useState({ rain: [], stream: [], tides: [] });
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

    // Extract coordinates for rain gauges
    const rainCoords = rainGaugeData.map(gauge => ({
      lat: gauge.path[0].lat,
      lon: gauge.path[0].lon,
      name: gauge.name
    }));

    // Extract coordinates for stream gauges
    const streamCoords = StreamGauges.map(gauge => ({
      lat: gauge.path[0].lat,
      lon: gauge.path[0].lon,
      name: gauge.name
    }));

    // Store all coordinate data for later use
    const coordsData = { rain: rainCoords, stream: streamCoords, tides: Tides };
    setCoordinates(coordsData);

    // Create HTML content for the map with the coordinate data
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
            const coords = ${JSON.stringify(coordsData)};
            console.log('Coordinates loaded:', coords);
            
            // Create data array with multiple traces
            const data = [];
            
            // Rain Gauges trace
            if (coords.rain && coords.rain.length > 0) {
              console.log('Adding rain gauges:', coords.rain.length);
              data.push({
                type: 'scattermapbox',
                mode: 'markers',
                lon: coords.rain.map(x => x.lon),
                lat: coords.rain.map(x => x.lat),
                marker: {
                  size: 14,
                  symbol: 'circle',
                  color: 'red',
                  opacity: 0.8
                },
                name: 'Rain Gauges',
                text: coords.rain.map(x => x.name),
                hovertemplate: '<b>%{text}</b><extra></extra>',
                customdata: coords.rain.map(x => x.name)
              });
            }

            // Stream Gauges trace
            if (coords.stream && coords.stream.length > 0) {
              console.log('Adding stream gauges:', coords.stream.length);
              console.log('Stream gauge coordinates:', coords.stream);
              data.push({
                type: 'scattermapbox',
                mode: 'markers',
                lon: coords.stream.map(x => x.lon),
                lat: coords.stream.map(x => x.lat),
                marker: {
                  size: 14,
                  symbol: 'circle',
                  color: 'cyan',
                  opacity: 1.0,
                  line: {
                    color: 'black',
                    width: 3
                  }
                },
                name: 'Stream Gauges',
                text: coords.stream.map(x => x.name),
                hovertemplate: '<b>%{text}</b><br>Stream Gauge<extra></extra>',
                customdata: coords.stream.map(x => x.name)
              });
            }

            // Tides lines traces
            if (coords.tides && coords.tides.length > 0) {
              console.log('Adding tide lines:', coords.tides.length);
              coords.tides.forEach(tide => {
                data.push({
                  type: 'scattermapbox',
                  mode: 'lines',
                  lon: tide.path.map(point => point.lon),
                  lat: tide.path.map(point => point.lat),
                  line: {
                    width: 3,
                    color: 'green'
                  },
                  name: tide.name,
                  hovertemplate: '<b>' + tide.name + '</b><extra></extra>',
                  showlegend: true
                });
              });
            }
            
            console.log('Total data traces:', data.length);
            
            const layout = {
              mapbox: {
                style: "open-street-map",
                center: { 
                  lat: coords.rain && coords.rain.length > 0 ? coords.rain[0].lat : 21.5, 
                  lon: coords.rain && coords.rain.length > 0 ? coords.rain[0].lon : -157.8 
                },
                zoom: 10
              },
              margin: { r: 10, t: 10, l: 10, b: 10 },
              autosize: true,
              showlegend: true,
              legend: {
                x: 0,
                y: 1,
                bgcolor: 'rgba(255, 255, 255, 0.8)'
              }
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
      if (mapRef.current && coordinates.rain && coordinates.rain.length > 0) {
        // Load Plotly dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
        script.onload = () => {
          if (window.Plotly && mapRef.current) {
            // Create data array with multiple traces
            const data = [];
            
            // Rain Gauges trace
            if (coordinates.rain && coordinates.rain.length > 0) {
              data.push({
                type: 'scattermapbox',
                mode: 'markers',
                lon: coordinates.rain.map(x => x.lon),
                lat: coordinates.rain.map(x => x.lat),
                marker: {
                  size: 14,
                  symbol: 'circle',
                  color: 'red',
                  opacity: 0.8
                },
                name: 'Rain Gauges',
                text: coordinates.rain.map(x => x.name),
                hovertemplate: '<b>%{text}</b><extra></extra>',
                customdata: coordinates.rain.map(x => x.name)
              });
            }

            // Stream Gauges trace
            if (coordinates.stream && coordinates.stream.length > 0) {
              console.log('Web - Adding stream gauges:', coordinates.stream.length);
              console.log('Web - Stream gauge coordinates:', coordinates.stream);
              data.push({
                type: 'scattermapbox',
                mode: 'markers',
                lon: coordinates.stream.map(x => x.lon),
                lat: coordinates.stream.map(x => x.lat),
                marker: {
                  size: 14,
                  symbol: 'circle',
                  color: 'cyan',
                  opacity: 1.0,
                  line: {
                    color: 'black',
                    width: 3
                  }
                },
                name: 'Stream Gauges',
                text: coordinates.stream.map(x => x.name),
                hovertemplate: '<b>%{text}</b><br>Stream Gauge<extra></extra>',
                customdata: coordinates.stream.map(x => x.name)
              });
            }

            // Tides lines traces
            if (coordinates.tides && coordinates.tides.length > 0) {
              coordinates.tides.forEach(tide => {
                data.push({
                  type: 'scattermapbox',
                  mode: 'lines',
                  lon: tide.path.map(point => point.lon),
                  lat: tide.path.map(point => point.lat),
                  line: {
                    width: 3,
                    color: 'green'
                  },
                  name: tide.name,
                  hovertemplate: '<b>' + tide.name + '</b><extra></extra>',
                  showlegend: true
                });
              });
            }
            
            const layout = {
              mapbox: {
                style: "open-street-map",
                center: { 
                  lat: coordinates.rain[0].lat, 
                  lon: coordinates.rain[0].lon 
                },
                zoom: 10
              },
              margin: { r: 10, t: 10, l: 10, b: 10 },
              autosize: true,
              showlegend: true,
              legend: {
                x: 0,
                y: 1,
                bgcolor: 'rgba(255, 255, 255, 0.8)'
              }
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
