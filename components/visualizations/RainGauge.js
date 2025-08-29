import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const RainGauge = () => {
  const [rainLevel, setRainLevel] = useState(null);
  const [rainTime, setRainTime] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  const minLevel = 0;
  const maxLevel = 8;

  useEffect(() => {
    fetch('http://149.165.172.129:5000/api/rain_data')
      .then(res => res.json())
      .then(data => {
        // Calculate the sum of the "in" column
        const totalRainfall = data.reduce((sum, item) => {
          return sum + (item["in"] || 0);
        }, 0);
        
        // Get the most recent timestamp for display
        const timestamps = data
          .map(item => new Date(item["DateTime"] || item["datetime"] || new Date()))
          .filter(date => !isNaN(date.getTime()))
          .sort((a, b) => b - a);
        
        const latestTime = timestamps.length > 0 ? timestamps[0] : new Date();
        
        setRainLevel(totalRainfall);
        setRainTime(latestTime);
        
        // Animate to new rain level
        const targetPercent = Math.min((totalRainfall - minLevel) / (maxLevel - minLevel), 1);
        Animated.timing(animatedValue, {
          toValue: targetPercent,
          duration: 2000,
          useNativeDriver: false,
        }).start();
      })
      .catch(err => {
        console.error("Failed to load rain data", err);
      });
  }, [animatedValue, minLevel, maxLevel]);

  const greenEnd = 2.8;
  const yellowEnd = 4.1;

  // Get color based on rain level
  const getColorForLevel = (level) => {
    if (level <= greenEnd) return '#4CAF50';
    if (level <= yellowEnd) return '#FFC107';
    return '#F44336';
  };

  const formattedDateTime = rainTime
    ? 'Latest Reading: ' + new Date(rainTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' HST'
    : 'Loading...';

  const customTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        <Svg width={700} height={300}>
          {/* Background arc */}
          <Path
            d="M100,280 A250,250 0 0,1 600,280"
            stroke="#333"
            strokeWidth={20}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Animated colored arc based on rain level */}
          {rainLevel !== null && (() => {
            const percent = Math.min((rainLevel - minLevel) / (maxLevel - minLevel), 0.98); // Cap at 98%
            const angle = percent * Math.PI;
            const endX = 350 + 250 * Math.cos(Math.PI - angle);
            const endY = 280 - 250 * Math.sin(Math.PI - angle);
            
            // Always use small arc flag to prevent wrapping
            return (
              <Path
                d={`M100,280 A250,250 0 0,1 ${endX},${endY}`}
                stroke={getColorForLevel(rainLevel)}
                strokeWidth={20}
                fill="none"
                strokeLinecap="round"
              />
            );
          })()}
          
          {/* Tick labels */}
          {customTicks.map((tick) => {
            const tickPercent = (tick - minLevel) / (maxLevel - minLevel);
            const angle = Math.PI - tickPercent * Math.PI;
            const labelRadius = 270;
            const lx = 350 + labelRadius * Math.cos(angle);
            const ly = 280 - labelRadius * Math.sin(angle);
            return (
              <SvgText
                key={tick}
                x={lx}
                y={ly}
                fontSize="18"
                fill="#fff"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {`${tick} in`}
              </SvgText>
            );
          })}
        </Svg>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: rainLevel !== null ? getColorForLevel(rainLevel) : 'white' }]}> 
          {rainLevel !== null ? `${rainLevel.toFixed(2)} in` : 'Loading...'}
        </Text>
        <Text style={styles.datetime}>{
          rainTime && rainLevel !== null
            ? `Latest Reading: ${new Date(rainTime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })} HST`
            : 'Loading...'}
        </Text>
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>No Flooding</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Minor Flooding</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Major Flooding</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
  },
  gaugeContainer: {
    marginBottom: 0,
    position: 'relative',
  },
  valueContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  value: {
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  datetime: {
    color: 'white',
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    color: 'white',
    fontSize: 14,
  },
});

export default RainGauge;
