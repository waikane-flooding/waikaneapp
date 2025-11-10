import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WaikaneTideLevel = () => {
  const [tideLevel, setTideLevel] = useState(null);
  const [tideTime, setTideTime] = useState(null);
  const [tideDirection, setTideDirection] = useState(null);

  // min/max levels handled inline in UI; no standalone variables required here

  useEffect(() => {
    fetch('http://149.165.159.226:5000/api/waikane_tide_curve')
      .then(res => res.json())
      .then(data => {
  // Get current time in HST (UTC-10, no DST)
  const nowUTC = new Date();
    // HST adjustments are handled when parsing timestamps; no separate UTC var usage required here

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
      .catch(err => {
        setTideLevel(null);
        setTideTime(null);
      });
  }, []);

  const greenEnd = 2.92;
  const yellowEnd = 3.42;

  // Get color based on tide level
  const getColorForLevel = (level) => {
    if (level < greenEnd) return '#4CAF50';
    if (level < yellowEnd) return '#FFC107';
    return '#F44336';
  };

  const formattedDateTime = tideTime
    ? new Date(tideTime).toLocaleString('en-US', {
        timeZone: 'Pacific/Honolulu',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    : 'Loading...';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waikāne Tide Level</Text>
      
      <View style={styles.dataContainer}>
        <Text style={[styles.value, { color: tideLevel !== null ? getColorForLevel(tideLevel) : '#007AFF' }]}>
          {tideLevel !== null ? `${tideLevel.toFixed(2)} ft` : 'Loading...'}
        </Text>
        
        <Text style={styles.datetime}>{formattedDateTime}</Text>
        
        <Text style={styles.direction}>
          Tide is {tideDirection ? tideDirection : 'Loading...'}
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
    padding: 20,
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    color: '#007AFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  dataContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  value: {
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  datetime: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  direction: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 16,
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

export default WaikaneTideLevel;