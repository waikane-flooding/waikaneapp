import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad)
  };
}

const WaikaneTideLevel = () => {
  const [tideLevel, setTideLevel] = useState(null);
  const [tideTime, setTideTime] = useState(null);

  const minLevel = -1;
  const maxLevel = 4;

  useEffect(() => {
    fetch('http://localhost:5000/api/waikane_tide_curve')
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const pastTides = data
          .map(item => ({
            time: new Date(item["Datetime"]),
            height: item["Predicted_ft_MSL"]
          }))
          .filter(d => d.time <= now)
          .sort((a, b) => b.time - a.time);

        if (pastTides.length > 0) {
          const latest = pastTides[0];
          setTideLevel(latest.height);
          setTideTime(latest.time);
        }
      })
      .catch(err => console.error("Failed to load tide data", err));
  }, []);

  const percent = tideLevel !== null ? (tideLevel - minLevel) / (maxLevel - minLevel) : 0;

  const greenEnd = 2.12;
  const yellowEnd = 2.92;

  // Proportional segments
  const greenPercent = (greenEnd - minLevel) / (maxLevel - minLevel);
  const yellowPercent = (yellowEnd - minLevel) / (maxLevel - minLevel);

  const formattedDateTime = tideTime
    ? 'Latest Reading: ' + new Date(tideTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        tiwhymeZone: 'Pacific/Honolulu'
      }) + ' HST'
    : 'Loading...';

  const customTicks = [-1, 0, 1, 2, 3, 4];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waikāne Tide Level</Text>
      <View style={styles.gaugeContainer}>
        <Svg width={260} height={140}>
          {/* Gauge arc segments: visually proportional, full half-circle, and merged for continuous look */}
          {(() => {
            const cx = 130, cy = 130, r = 100, strokeWidth = 12;
            function describeArc(startAngle, endAngle, color) {
              // Always draw from higher angle to lower angle (left to right)
              let sa = startAngle;
              let ea = endAngle;
              if (sa < ea) {
                [sa, ea] = [ea, sa];
              }
              const start = polarToCartesian(cx, cy, r, sa);
              const end = polarToCartesian(cx, cy, r, ea);
              let angleDiff = sa - ea;
              if (angleDiff < 0) angleDiff += 360;
              // Large arc flag: 1 if segment > 90°, else 0
              const largeArcFlag = angleDiff > 90 ? "1" : "0";
              // Sweep flag: 1 for clockwise (left to right)
              const sweepFlag = "1";
              return (
                <Path
                  key={color+sa}
                  d={`M${start.x},${start.y} A${r},${r} 0 ${largeArcFlag},${sweepFlag} ${end.x},${end.y}`}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            }
            // Calculate proportional degree values for each segment
            function getAngleForLevel(level) {
              return 180 - ((level - minLevel) / (maxLevel - minLevel)) * 180;
            }
            // Segments: [start, end, color]
            const segments = [
              { start: minLevel, end: greenEnd, color: '#4CAF50' },
              { start: greenEnd, end: yellowEnd, color: '#FFC107' },
              { start: yellowEnd, end: maxLevel, color: '#F44336' },
            ];
            return segments.map((seg, i) => {
              let startAngle = getAngleForLevel(seg.start);
              let endAngle = getAngleForLevel(seg.end);
              // Always draw from higher angle to lower angle (left to right)
              if (startAngle < endAngle) {
                [startAngle, endAngle] = [endAngle, startAngle];
              }
              return describeArc(startAngle, endAngle, seg.color);
            });
          })()}
          {/* Needle */}
          {tideLevel !== null && (() => {
            const angle = Math.PI - percent * Math.PI;
            const needleLength = 90;
            const cx = 130, cy = 130;
            const nx = cx + needleLength * Math.cos(angle);
            const ny = cy - needleLength * Math.sin(angle);
            return (
              <Line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#000" strokeWidth={4} />
            );
          })()}
          {/* Tick labels */}
          {customTicks.map((tick) => {
            const tickPercent = (tick - minLevel) / (maxLevel - minLevel);
            const angle = Math.PI - tickPercent * Math.PI;
            const labelRadius = 110;
            const lx = 130 + labelRadius * Math.cos(angle);
            const ly = 130 - labelRadius * Math.sin(angle);
            return (
              <SvgText
                key={tick}
                x={lx}
                y={ly}
                fontSize="14"
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
      <Text style={styles.value}>{tideLevel !== null ? `${tideLevel.toFixed(2)} ft` : 'Loading...'}</Text>
      <Text style={styles.datetime}>{formattedDateTime}</Text>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>-1-2.12 ft: No Flooding</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>2.12-2.92 ft: Minor Flooding</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>2.92-3.92 ft: Major Flooding</Text>
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
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  gaugeContainer: {
    marginBottom: 10,
  },
  value: {
    color: 'white',
    fontSize: 32,
    marginTop: 8,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
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