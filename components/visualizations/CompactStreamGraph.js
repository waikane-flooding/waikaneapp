import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop, G, Circle } from 'react-native-svg';

// CompactStreamGraph: a small, modern sparkline + area fill with last-value badge.
// Props: streamData: [{ DateTime, ft }]
export default function CompactStreamGraph({ streamData = [], width = 320, height = 140, color = '#36A2EB' }) {
  // Normalize and sort
  const points = (Array.isArray(streamData) ? streamData : [])
    .map(d => ({ time: new Date(d.DateTime).getTime(), value: Number(d.ft) }))
    .filter(p => !isNaN(p.time) && p.value != null)
    .sort((a, b) => a.time - b.time);

  if (points.length === 0) {
    return (
      <View style={[styles.container, { width }]}>
        <Text style={styles.noData}>No data</Text>
      </View>
    );
  }

  // increase vertical padding so the sparkline has more breathing room
  const paddingX = 8;
  const paddingY = 14;
  const graphW = Math.max(40, width - paddingX * 2);
  const graphH = Math.max(30, height - paddingY * 2);

  const values = points.map(p => p.value);
  const vMin = Math.min(...values);
  const vMax = Math.max(...values);
  const vRange = vMax === vMin ? 1 : vMax - vMin;

  const tMin = points[0].time;
  const tMax = points[points.length - 1].time;
  const tRange = tMax === tMin ? 1 : tMax - tMin;

  const mapped = points.map(p => {
    const x = paddingX + ((p.time - tMin) / tRange) * graphW;
    const y = paddingY + (1 - (p.value - vMin) / vRange) * graphH;
    return { x, y, v: p.value };
  });

  // build path
  const line = mapped.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' ');
  // area path goes down to baseline
  const area = `${line} L${mapped[mapped.length - 1].x.toFixed(2)},${paddingY + graphH} L${mapped[0].x.toFixed(2)},${paddingY + graphH} Z`;

  const last = mapped[mapped.length - 1];
  const first = mapped[0];
  // readable times
  const firstTime = points.length > 0 ? new Date(points[0].time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  const lastTimeLabel = points.length > 0 ? new Date(points[points.length - 1].time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  const lastDateLabel = points.length > 0 ? new Date(points[points.length - 1].time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const pointCount = points.length;
  const valuesOnly = points.map(p => p.value);
  const vMinLabel = valuesOnly.length ? Math.min(...valuesOnly).toFixed(2) : '';
  const vMaxLabel = valuesOnly.length ? Math.max(...valuesOnly).toFixed(2) : '';

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="g1" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </LinearGradient>
        </Defs>

        <G>
          <Path d={area} fill="url(#g1)" />
          <Path d={line} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>

        {/* Last point marker */}
        <Circle cx={last.x} cy={last.y} r={3.5} fill="#fff" stroke={color} strokeWidth={1.5} />
      </Svg>

      {/* last-value badge placed below the chart area to avoid overlapping header/legend */}
      <View style={[styles.badge, { top: height - 36 }]} pointerEvents="none">
        <Text style={styles.badgeText}>{(points[points.length - 1].value ?? '').toFixed ? points[points.length - 1].value.toFixed(2) + ' ft' : String(points[points.length - 1].value)}</Text>
      </View>

      {/* Metadata footer */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>{firstTime}</Text>
        <Text style={styles.metaCenter}>{`${pointCount} pts • min ${vMinLabel} / max ${vMaxLabel}`}</Text>
        <Text style={styles.metaRight}>{`${lastTimeLabel} • ${lastDateLabel}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  noData: {
    color: '#777',
    fontSize: 12,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: '#1D3D47',
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 6,
  },
  metaLeft: {
    fontSize: 11,
    color: '#666',
  },
  metaCenter: {
    fontSize: 11,
    color: '#666',
  },
  metaRight: {
    fontSize: 11,
    color: '#666',
  },
});
