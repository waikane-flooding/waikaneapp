import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const MaukaRainGauge = () => {
  const [rainLevel, setRainLevel] = useState(null);
  const [rainTime, setRainTime] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  const minLevel = 0;
  const maxLevel = 7;

  useEffect(() => {
    fetch('http://149.165.159.226:5000/api/rain_data')
      .then(res => res.json())
      .then(data => {
        // Find the first entry where Name === "Mauka"
        const maukaEntry = data.find(item => item.Name === "Mauka");
        if (maukaEntry) {
          const rainfall = Number(maukaEntry.Rainfall) || 0;
          const datetime = maukaEntry.DateTime;
          setRainLevel(rainfall);
          setRainTime(datetime);
          // Animate to new rain level
          const targetPercent = Math.min((rainfall - minLevel) / (maxLevel - minLevel), 1);
          Animated.timing(animatedValue, {
            toValue: targetPercent,
            duration: 2000,
            useNativeDriver: false,
          }).start();
        } else {
          setRainLevel(null);
          setRainTime(null);
        }
      })
      .catch(err => {
        console.error("Failed to load rain data", err);
        setRainLevel(null);
        setRainTime(null);
      });
  }, [animatedValue, minLevel, maxLevel]);

  const greenEnd = 3.11;
  const yellowEnd = 4.54;

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
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' HST'
    : 'Loading...';

  const customTicks = [0, 1, 2, 3, 4, 5, 6, 7];

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
                fill="#007AFF"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {`${tick} in`}
              </SvgText>
            );
          })}
          {/* Threshold tick marks and labels */}
          {[{ value: greenEnd, color: '#FFC107', label: '3.11 in' }, { value: yellowEnd, color: '#F44336', label: '4.54 in' }].map((threshold, idx) => {
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
        <Text style={[styles.value, { color: rainLevel !== null ? getColorForLevel(rainLevel) : '#007AFF' }]}> 
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
          <Text style={styles.legendText}>Minor Rain</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Moderate Rain</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Extreme Rain</Text>
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

export default MaukaRainGauge;
