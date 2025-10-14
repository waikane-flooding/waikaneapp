import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const WaiaholeStreamHeight = ({ streamData, trendData }) => {
  const [streamLevel, setStreamLevel] = useState(null);
  const [streamTime, setStreamTime] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));
  const [streamDirection, setStreamDirection] = useState(null);

  const minLevel = 6;
  const maxLevel = 18;
  const greenEnd = 12;
  const yellowEnd = 16.4;

  // Get color based on stream level
  const getColorForLevel = (level) => {
    if (level < greenEnd) return '#4CAF50';
    if (level < yellowEnd) return '#FFC107';
    return '#F44336';
  };

  const customTicks = [6, 8, 10, 12, 14, 16, 18];

  useEffect(() => {
    // Process cached data instead of fetching
    if (streamData && streamData.length > 0) {
      const now = new Date();
      const latest = streamData
        .filter(d => d.ft != null && d.DateTime)
        .map(d => ({
          time: new Date(d.DateTime),
          value: d.ft
        }))
        .filter(d => d.time <= now)
        .sort((a, b) => b.time - a.time)[0];

      // Find Waiahole trend
      let direction = null;
      if (trendData && Array.isArray(trendData)) {
        const waiaholeTrend = trendData.find(t => t.Name && t.Name.toLowerCase().includes('waiahole'));
        direction = waiaholeTrend && waiaholeTrend.Trend ? waiaholeTrend.Trend : null;
      }
      setStreamDirection(direction);

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
    }
  }, [streamData, trendData, animatedValue, maxLevel, minLevel]);

  const formattedDateTime = streamTime
    ? new Date(streamTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
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
                fill="#007AFF"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {`${tick} ft`}
              </SvgText>
            );
          })}
          {/* Threshold tick marks and labels */}
          {[{ value: greenEnd, color: '#FFC107', label: '12.00 ft' }, { value: yellowEnd, color: '#F44336', label: '16.40 ft' }].map((threshold, idx) => {
            const percent = (threshold.value - minLevel) / (maxLevel - minLevel);
            const angle = Math.PI - percent * Math.PI;
            const tickRadius = 250;
            const tickLength = 20;
            const tickCenter = tickRadius;
            const halfLength = tickLength / 2;
            const x1 = 350 + (tickCenter - halfLength) * Math.cos(angle);
            const y1 = 280 - (tickCenter - halfLength) * Math.sin(angle);
            const x2 = 350 + (tickCenter + halfLength) * Math.cos(angle);
            const y2 = 280 - (tickCenter + halfLength) * Math.sin(angle);
            
            const labelRadius = 200;
            const lx = 350 + labelRadius * Math.cos(angle);
            const ly = 280 - labelRadius * Math.sin(angle);
            return (
              <React.Fragment key={threshold.value}>
                {/* Tick mark */}
                <Path
                  d={`M${x1},${y1} L${x2},${y2}`}
                  stroke={threshold.color}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                {/* Label */}
                <SvgText
                  x={lx}
                  y={ly}
                  fontSize="20"
                  fill={threshold.color}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontWeight="bold"
                >
                  {threshold.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: streamLevel !== null ? getColorForLevel(streamLevel) : '#007AFF' }]}>
          {streamLevel !== null ? `${streamLevel.toFixed(2)} ft` : 'Loading...'}
        </Text>
        <Text style={styles.datetime}>{formattedDateTime}</Text>
        {/* Stream Direction */}
        <Text style={{ color: '#007AFF', fontSize: 16, marginTop: 8, textAlign: 'center' }}>
          Stream is {streamDirection ? streamDirection : 'Loading...'}
        </Text>
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Normal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Elevated</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Extreme</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 2,
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
    color: '#007AFF',
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 40,
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
    color: '#007AFF',
    fontSize: 14,
  },
});

export default WaiaholeStreamHeight;
