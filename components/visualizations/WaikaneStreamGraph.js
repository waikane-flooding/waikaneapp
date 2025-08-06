import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, Line, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const WaikaneStreamGraph = () => {
  const [streamData, setStreamData] = useState([]);

  useEffect(() => {
    fetch('http://149.165.169.164:5000/api/waikane_stream')
      .then(res => res.json())
      .then(data => {
        setStreamData(data);
      })
      .catch(error => {
        console.error('Error fetching stream data:', error);
      });
  }, []);

  // Chart dimensions - responsive but maintain aspect ratio
  const chartWidth = 650;
  const chartHeight = 300;
  const padding = 40;
  const graphWidth = chartWidth - 2 * padding;
  const graphHeight = chartHeight - 2 * padding;

  // Y-axis range - specific to Waikane Stream (same as WaikaneStreamHeight thresholds)
  const yMin = 0;
  const yMax = 16;
  const yRange = yMax - yMin;

  // Process data
  const sortedStreamData = [...streamData]
    .filter(d => d.ft != null && d.DateTime)
    .sort((a, b) => new Date(a.DateTime) - new Date(b.DateTime));
  
  if (sortedStreamData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Get time range (24 hours before last data point + future data)
  const lastDataTime = new Date(sortedStreamData[sortedStreamData.length - 1].DateTime);
  const startTime = new Date(lastDataTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before last data point
  const filteredData = sortedStreamData.filter(d => {
    const date = new Date(d.DateTime);
    return date >= startTime; // Include all data from 24 hours before last point onwards
  });

  if (filteredData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No recent data available</Text>
        </View>
      </View>
    );
  }

  const timeMin = new Date(filteredData[0].DateTime).getTime();
  const timeMax = new Date(filteredData[filteredData.length - 1].DateTime).getTime();
  const timeRange = timeMax - timeMin;

  // Convert data to SVG coordinates
  const points = filteredData.map(d => {
    const time = new Date(d.DateTime).getTime();
    const value = d.ft;
    
    const x = padding + ((time - timeMin) / timeRange) * graphWidth;
    const y = padding + ((yMax - value) / yRange) * graphHeight;
    
    return { x, y, time, value };
  });

  // Create path string for stream curve
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M${point.x},${point.y}`;
    }
    return `${path} L${point.x},${point.y}`;
  }, '');

  // Find current time marker on the curve
  const currentTimeHST = new Date().toLocaleString("en-US", {timeZone: "Pacific/Honolulu"});
  const currentTime = new Date(currentTimeHST).getTime();
  let currentTimePoint = null;
  
  if (currentTime >= timeMin && currentTime <= timeMax) {
    // Find the closest data point to current time or interpolate
    const currentTimeData = filteredData.find(d => {
      const dataTime = new Date(d.DateTime).getTime();
      return Math.abs(dataTime - currentTime) < 30 * 60 * 1000; // Within 30 minutes
    });
    
    if (currentTimeData) {
      const time = new Date(currentTimeData.DateTime).getTime();
      const value = currentTimeData.ft;
      const x = padding + ((time - timeMin) / timeRange) * graphWidth;
      const y = padding + ((yMax - value) / yRange) * graphHeight;
      currentTimePoint = { x, y, time, value };
    } else {
      // Interpolate between nearest points
      const beforePoint = filteredData.filter(d => new Date(d.DateTime).getTime() <= currentTime).pop();
      const afterPoint = filteredData.find(d => new Date(d.DateTime).getTime() > currentTime);
      
      if (beforePoint && afterPoint) {
        const beforeTime = new Date(beforePoint.DateTime).getTime();
        const afterTime = new Date(afterPoint.DateTime).getTime();
        const ratio = (currentTime - beforeTime) / (afterTime - beforeTime);
        const interpolatedValue = beforePoint.ft + 
          (afterPoint.ft - beforePoint.ft) * ratio;
        
        const x = padding + ((currentTime - timeMin) / timeRange) * graphWidth;
        const y = padding + ((yMax - interpolatedValue) / yRange) * graphHeight;
        currentTimePoint = { x, y, time: currentTime, value: interpolatedValue };
      }
    }
  }

  // Y-axis labels - specific to stream heights
  const yTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16];
  
  // X-axis labels (every 6 hours, aligned to 12 AM, 6 AM, 12 PM, 6 PM)
  const xTicks = [];
  
  // Find the first 6-hour boundary within our time range
  const startDate = new Date(timeMin);
  const firstTickHour = Math.ceil(startDate.getHours() / 6) * 6;
  const firstTick = new Date(startDate);
  firstTick.setHours(firstTickHour, 0, 0, 0);
  
  // If the first tick is before our start time, use the next 6-hour boundary
  if (firstTick.getTime() < timeMin) {
    firstTick.setHours(firstTick.getHours() + 6);
  }
  
  // Generate ticks every 6 hours from the first aligned tick
  let currentTick = new Date(firstTick);
  while (currentTick.getTime() <= timeMax) {
    const x = padding + ((currentTick.getTime() - timeMin) / timeRange) * graphWidth;
    
    // Format time labels
    const hour = currentTick.getHours();
    let timeLabel = '';
    if (hour === 0) {
      timeLabel = '12:00 AM HST';
    } else if (hour === 6) {
      timeLabel = '6:00 AM HST';
    } else if (hour === 12) {
      timeLabel = '12:00 PM HST';
    } else if (hour === 18) {
      timeLabel = '6:00 PM HST';
    } else {
      // Fallback for other hours (shouldn't happen with 6-hour intervals)
      timeLabel = currentTick.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }) + ' HST';
    }
    
    xTicks.push({
      x: x,
      time: new Date(currentTick),
      timeLabel: timeLabel,
      dateLabel: currentTick.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    });
    
    // Move to next 6-hour interval
    currentTick.setHours(currentTick.getHours() + 6);
  }
  
  // Threshold lines - specific to Waikane Stream (7ft and 10.8ft)
  const threshold1Y = padding + ((yMax - 7) / yRange) * graphHeight;
  const threshold2Y = padding + ((yMax - 10.8) / yRange) * graphHeight;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="streamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(0, 122, 255, 0.3)" />
              <Stop offset="100%" stopColor="rgba(0, 122, 255, 0.1)" />
            </LinearGradient>
          </Defs>
          
          {/* Grid lines */}
          {yTicks.map(tick => {
            const y = padding + ((yMax - tick) / yRange) * graphHeight;
            return (
              <Line
                key={tick}
                x1={padding}
                y1={y}
                x2={padding + graphWidth}
                y2={y}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth={1}
              />
            );
          })}
          
          {/* X-axis grid lines */}
          {xTicks.map((tick, index) => (
            <Line
              key={`x-grid-${index}`}
              x1={tick.x}
              y1={padding}
              x2={tick.x}
              y2={padding + graphHeight}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={1}
            />
          ))}
          
          {/* X-axis line */}
          <Line
            x1={padding}
            y1={padding + graphHeight}
            x2={padding + graphWidth}
            y2={padding + graphHeight}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={1}
          />
          
          {/* Y-axis line */}
          <Line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + graphHeight}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={1}
          />
          
          {/* Threshold lines */}
          <Line
            x1={padding}
            y1={threshold1Y}
            x2={padding + graphWidth}
            y2={threshold1Y}
            stroke="#FFC107"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          <Line
            x1={padding}
            y1={threshold2Y}
            x2={padding + graphWidth}
            y2={threshold2Y}
            stroke="#F44336"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          
          {/* Stream curve area fill */}
          <Path
            d={`${pathData} L${points[points.length - 1].x},${padding + graphHeight} L${points[0].x},${padding + graphHeight} Z`}
            fill="url(#streamGradient)"
          />
          
          {/* Stream curve line */}
          <Path
            d={pathData}
            stroke="rgba(0, 122, 255, 0.8)"
            strokeWidth={2}
            fill="none"
          />
          
          {/* Current time marker */}
          {currentTimePoint && (
            <Circle
              cx={currentTimePoint.x}
              cy={currentTimePoint.y}
              r={5}
              fill="#000000"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
          
          {/* Y-axis labels */}
          {yTicks.map(tick => {
            const y = padding + ((yMax - tick) / yRange) * graphHeight;
            return (
              <SvgText
                key={tick}
                x={padding - 10}
                y={y + 3}
                fontSize="12"
                fill="#666"
                textAnchor="end"
              >
                {tick + " ft"}
              </SvgText>
            );
          })}
          
          {/* X-axis labels */}
          {xTicks.map((tick, index) => (
            <SvgText
              key={`x-label-${index}`}
              x={tick.x}
              y={padding + graphHeight + 15}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {tick.timeLabel}
            </SvgText>
          ))}
          
          {/* X-axis date labels */}
          {xTicks.map((tick, index) => (
            <SvgText
              key={`x-date-${index}`}
              x={tick.x}
              y={padding + graphHeight + 28}
              fontSize="9"
              fill="#999"
              textAnchor="middle"
            >
              {tick.dateLabel}
            </SvgText>
          ))}
          
          {/* X-axis ticks */}
          {xTicks.map((tick, index) => (
            <Line
              key={`x-tick-${index}`}
              x1={tick.x}
              y1={padding + graphHeight}
              x2={tick.x}
              y2={padding + graphHeight + 5}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={1}
            />
          ))}
          
          {/* Threshold labels */}
          <SvgText
            x={padding + 5}
            y={threshold1Y - 5}
            fontSize="10"
            fill="#FFC107"
          >
            7 ft
          </SvgText>
          <SvgText
            x={padding + 5}
            y={threshold2Y - 5}
            fontSize="10"
            fill="#F44336"
          >
            10.8 ft
          </SvgText>
        </Svg>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine]} />
            <Text style={styles.legendText}>Stream Height</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#000000' }]} />
            <Text style={styles.legendText}>Current Time</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    margin: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartContainer: {
    position: 'relative',
  },
  loadingContainer: {
    width: 650,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 2,
  },
  legendLine: {
    width: 20,
    height: 2,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    marginRight: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});

export default WaikaneStreamGraph;
