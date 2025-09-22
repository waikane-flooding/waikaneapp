import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const WaikaneTideLevel = () => {
  const [tideLevel, setTideLevel] = useState(null);
  const [tideTime, setTideTime] = useState(null);
  const [tideDirection, setTideDirection] = useState(null);
  const [animatedValue] = useState(new Animated.Value(0));

  const minLevel = -2;
  const maxLevel = 4;

  useEffect(() => {
    fetch('http://149.165.159.226:5000/api/waikane_tide_curve')
      .then(res => res.json())
      .then(data => {
        // Get current time in HST (UTC-10, no DST)
        const nowUTC = new Date();
        const utcYear = nowUTC.getUTCFullYear();
        const utcMonth = nowUTC.getUTCMonth();
        const utcDate = nowUTC.getUTCDate();
        const utcHour = nowUTC.getUTCHours();
        const utcMinute = nowUTC.getUTCMinutes();
        const utcSecond = nowUTC.getUTCSeconds();
        // HST is UTC-10
        const nowHST = new Date(Date.UTC(utcYear, utcMonth, utcDate, utcHour - 10, utcMinute, utcSecond));

        // Helper to parse API timestamp as HST (treat as HST, not local/UTC)
        function parseHSTTimestamp(str) {
          // str: 'YYYY-MM-DDTHH:mm:ss.sss'
          const [datePart, timePart] = str.split('T');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute, second] = timePart.split(':');
          // Construct a UTC date that represents the same wall time as HST
          return new Date(Date.UTC(year, month - 1, day, Number(hour) + 10, Number(minute), Number(second)));
        }

        // Sort all data points by time ascending
        const allTides = data
          .map(item => ({
            time: parseHSTTimestamp(item["Datetime"]),
            height: item["Predicted_ft_MSL"]
          }))
          .filter(d => !isNaN(d.time.getTime()) && d.height != null)
          .sort((a, b) => a.time - b.time);

        // Find the latest reading at or before now
        const pastTides = allTides.filter(d => d.time <= nowUTC);
        if (pastTides.length > 0) {
          const latest = pastTides[pastTides.length - 1]; // Most recent PAST reading
          setTideLevel(latest.height);
          setTideTime(latest.time);
          // Animate to new tide level
          const targetPercent = (latest.height - minLevel) / (maxLevel - minLevel);
          Animated.timing(animatedValue, {
            toValue: targetPercent,
            duration: 2000,
            useNativeDriver: false,
          }).start();

          // Find the next data point after the latest reading
          const nextIdx = allTides.findIndex(d => d.time.getTime() === latest.time.getTime()) + 1;
          if (nextIdx > 0 && nextIdx < allTides.length) {
            const next = allTides[nextIdx];
            if (next.height > latest.height) {
              setTideDirection('Rising');
            } else if (next.height < latest.height) {
              setTideDirection('Falling');
            } else {
              setTideDirection('Stable');
            }
          } else {
            setTideDirection('N/A');
          }
        }
      })
      .catch(err => console.error("Failed to load tide data", err));
  }, [animatedValue, minLevel, maxLevel]);

  const greenEnd = 2.92;
  const yellowEnd = 3.42;

  // Get color based on tide level
  const getColorForLevel = (level) => {
    if (level < greenEnd) return '#4CAF50';
    if (level < yellowEnd) return '#FFC107';
    return '#F44336';
  };

  const formattedDateTime = tideTime
    ? 'Last Reading: ' + new Date(tideTime).toLocaleString('en-US', {
        timeZone: 'Pacific/Honolulu',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' HST'
    : 'Loading...';

  const customTicks = [-2, -1, 0, 1, 2, 3, 4];

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
          {/* Animated colored arc based on tide level */}
          {tideLevel !== null && (() => {
            const percent = Math.min((tideLevel - minLevel) / (maxLevel - minLevel), 0.98); // Cap at 98%
            const angle = percent * Math.PI;
            const endX = 350 + 250 * Math.cos(Math.PI - angle);
            const endY = 280 - 250 * Math.sin(Math.PI - angle);
            // Always use small arc flag to prevent wrapping
            return (
              <Path
                d={`M100,280 A250,250 0 0,1 ${endX},${endY}`}
                stroke={getColorForLevel(tideLevel)}
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
          {/* Threshold tick marks and labels */}
          {[{ value: minLevel, color: '#4CAF50', label: '-2.00 ft' },{ value: greenEnd, color: '#FFC107', label: '2.92 ft' }, { value: yellowEnd, color: '#F44336', label: '3.42 ft' }].map((threshold, idx) => {
            const percent = (threshold.value - minLevel) / (maxLevel - minLevel);
            const angle = Math.PI - percent * Math.PI;
            const tickRadius = 250;
            const tickLength = 20;
            const x1 = 350 + tickRadius * Math.cos(angle);
            const y1 = 280 - tickRadius * Math.sin(angle);
            const x2 = 350 + (tickRadius - tickLength) * Math.cos(angle);
            const y2 = 280 - (tickRadius - tickLength) * Math.sin(angle);
            // Increase labelRadius for more space between tick and label
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
                  fontSize="14"
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
        <Text style={[styles.value, { color: tideLevel !== null ? getColorForLevel(tideLevel) : 'white' }]}>
          {tideLevel !== null ? `${tideLevel.toFixed(2)} ft` : 'Loading...'}
        </Text>
        <Text style={styles.datetime}>{formattedDateTime}</Text>
        {/* Tide Direction */}
        <Text style={{ color: 'white', fontSize: 16, marginTop: 8, textAlign: 'center' }}>
          Tide Direction: {tideDirection ? tideDirection : 'Loading...'}
        </Text>
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Normal Tide</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Elevated Tide</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Extreme Tide</Text>
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
    color: 'white',
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
    color: 'white',
    fontSize: 14,
  },
});

export default WaikaneTideLevel;