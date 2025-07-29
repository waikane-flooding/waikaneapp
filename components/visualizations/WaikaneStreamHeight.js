import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

const WaikaneStreamHeight = () => {
  const [streamLevel, setStreamLevel] = useState(null);
  const [streamTime, setStreamTime] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  const minLevel = 0;
  const maxLevel = 16;
  const greenEnd = 7;
  const yellowEnd = 10.8;

  // Get color based on stream level
  const getColorForLevel = (level) => {
    if (level < greenEnd) return '#4CAF50';
    if (level < yellowEnd) return '#FFC107';
    return '#F44336';
  };

  const customTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16];

  useEffect(() => {
    fetch('http://149.165.153.234:5000/api/waikane_stream')
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const latest = data
          .filter(d => d.ft != null && d.DateTime)
          .map(d => ({
            time: new Date(d.DateTime),
            value: d.ft
          }))
          .filter(d => d.time <= now)
          .sort((a, b) => b.time - a.time)[0]; // Most recent past point

        if (latest) {
          setStreamLevel(latest.value);
          setStreamTime(latest.time);
          
          // Animate to new stream level
          const targetPercent = (latest.value - minLevel) / (maxLevel - minLevel);
          Animated.timing(animatedValue, {
            toValue: targetPercent,
            duration: 2000,
            useNativeDriver: false,
          }).start();
        }
      })
      .catch(err => console.error("Failed to load stream data", err));
  }, []);

  const formattedDateTime = streamTime
    ? 'Latest Reading: ' + new Date(streamTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Pacific/Honolulu'
      }) + ' HST'
    : 'Loading...';

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
          
          {/* Animated colored arc based on stream level */}
          {streamLevel !== null && (() => {
            const percent = Math.min((streamLevel - minLevel) / (maxLevel - minLevel), 0.98); // Cap at 98%
            const angle = percent * Math.PI;
            const endX = 350 + 250 * Math.cos(Math.PI - angle);
            const endY = 280 - 250 * Math.sin(Math.PI - angle);
            
            // Always use small arc flag to prevent wrapping
            return (
              <Path
                d={`M100,280 A250,250 0 0,1 ${endX},${endY}`}
                stroke={getColorForLevel(streamLevel)}
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
                {`${tick} ft`}
              </SvgText>
            );
          })}
        </Svg>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{streamLevel !== null ? `${streamLevel.toFixed(2)} ft` : 'Loading...'}</Text>
        <Text style={styles.datetime}>{formattedDateTime}</Text>
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
    color: 'white',
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

export default WaikaneStreamHeight;
