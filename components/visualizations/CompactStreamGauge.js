import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';

// CompactStreamGauge: a small horizontal bar gauge showing the latest stream level
// Props: streamData: array, trendData: array, minLevel, maxLevel, color
export default function CompactStreamGauge({ streamData = [], trendData = [], minLevel = 0, maxLevel = 16, color = '#36A2EB', height = 56, width = 320 }) {
  // Find latest reading
  const now = new Date();
  const latest = (Array.isArray(streamData) ? streamData : [])
    .filter(d => d.ft != null && d.DateTime)
    .map(d => ({ time: new Date(d.DateTime), value: Number(d.ft) }))
    .filter(d => d.time <= now)
    .sort((a, b) => b.time - a.time)[0];

  const value = latest ? latest.value : null;
  // Trend text
  let trendText = 'Loading...';
  if (Array.isArray(trendData)) {
    const t = trendData[0];
    if (t && t.Trend) trendText = t.Trend;
  }

  const pct = value == null ? 0 : Math.max(0, Math.min(1, (value - minLevel) / (maxLevel - minLevel)));
  const pointCount = Array.isArray(streamData) ? streamData.length : 0;
  const minVal = Array.isArray(streamData) && streamData.length ? Math.min(...streamData.map(d => Number(d.ft))) : null;
  const maxVal = Array.isArray(streamData) && streamData.length ? Math.max(...streamData.map(d => Number(d.ft))) : null;
  const lastReadLabel = latest ? new Date(latest.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Data';

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.row}>
        <Text style={styles.valueText}>{value != null ? `${value.toFixed(2)} ft` : 'No Data'}</Text>
        <Text style={styles.trendText}>{trendText}</Text>
      </View>

      <Svg width={width} height={28}>
        <Rect x={8} y={6} rx={8} ry={8} width={width - 16} height={16} fill="#eee" />
        <Rect x={8} y={6} rx={8} ry={8} width={Math.max(6, (width - 16) * pct)} height={16} fill={color} />
        {/* threshold markers (example) */}
        {/* You can compute positions for thresholds here if desired */}
        <SvgText x={12} y={20} fontSize="10" fill="#fff"> </SvgText>
      </Svg>
      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>{`Last: ${lastReadLabel}`}</Text>
        <Text style={styles.metaCenter}>{pointCount} pts</Text>
        <Text style={styles.metaRight}>{minVal != null ? `${minVal.toFixed(2)} / ${maxVal.toFixed(2)}` : ''}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  valueText: {
    fontSize: 16,
    color: '#1D3D47',
    fontWeight: '600',
  },
  trendText: {
    fontSize: 12,
    color: '#007AFF',
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
