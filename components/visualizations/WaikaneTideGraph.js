import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, Line, Circle, Polygon, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const WaikaneTideGraph = () => {
  const [curveData, setCurveData] = useState([]);
  const [tideData, setTideData] = useState([]);

  useEffect(() => {
    fetch('http://149.165.169.164:5000/api/waikane_tide_curve')
      .then(res => res.json())
      .then(curve => {
        setCurveData(curve);
      })
      .catch(error => {
        console.error('Error fetching curve data:', error);
      });
  }, []);

  useEffect(() => {
    fetch('http://149.165.169.164:5000/api/waikane_tides')
      .then(res => res.json())
      .then(data => {
        setTideData(data);
      })
      .catch(error => {
        console.error('Error fetching tide data:', error);
      });
  }, []);

  // Chart dimensions - fill the container
  const chartWidth = 650; // Add small padding to prevent extending to edge
  const chartHeight = 300;
  const padding = 50; // Increased padding to give more space for Y-axis labels
  const graphWidth = chartWidth - 2 * padding;
  const graphHeight = chartHeight - 2 * padding;

  // Y-axis range
  const yMin = -1;
  const yMax = 4;
  const yRange = yMax - yMin;

  // Process data
  const sortedCurveData = [...curveData].sort((a, b) => new Date(a["Datetime"]) - new Date(b["Datetime"]));
  
  if (sortedCurveData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Get time range (24 hours before last data point + future data)
  const lastDataTime = new Date(sortedCurveData[sortedCurveData.length - 1]["Datetime"]);
  const startTime = new Date(lastDataTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before last data point
  const filteredData = sortedCurveData.filter(d => {
    const date = new Date(d["Datetime"]);
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

  const timeMin = new Date(filteredData[0]["Datetime"]).getTime();
  const timeMax = new Date(filteredData[filteredData.length - 1]["Datetime"]).getTime();
  const timeRange = timeMax - timeMin;

  // Convert data to SVG coordinates
  const points = filteredData.map(d => {
    const time = new Date(d["Datetime"]).getTime();
    const value = d["Predicted_ft_MSL"];
    
    const x = padding + ((time - timeMin) / timeRange) * graphWidth;
    const y = padding + ((yMax - value) / yRange) * graphHeight;
    
    return { x, y, time, value };
  });

  // Create path string for tide curve with smooth curves
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M${point.x},${point.y}`;
    }
    
    // Create smooth curves using quadratic bezier curves
    if (index === 1) {
      return `${path} Q${point.x},${point.y} ${point.x},${point.y}`;
    }
    
    const prevPoint = points[index - 1];
    const controlX = (prevPoint.x + point.x) / 2;
    const controlY = (prevPoint.y + point.y) / 2;
    
    return `${path} Q${controlX},${controlY} ${point.x},${point.y}`;
  }, '');

  // Find high and low tides from tideData
  const tidePoints = tideData
    .filter(d => {
      const date = new Date(d["Date Time"]);
      return date >= startTime; // Use same time range as curve data
    })
    .map(d => {
      const time = new Date(d["Date Time"]).getTime();
      const value = d["Prediction_ft_MSL"];
      const x = padding + ((time - timeMin) / timeRange) * graphWidth;
      const y = padding + ((yMax - value) / yRange) * graphHeight;
      return { x, y, time, value, type: d["Type"] };
    });

  const highTides = tidePoints.filter(point => point.type === 'H');
  const lowTides = tidePoints.filter(point => point.type === 'L');

  // Find current time marker on the curve
  const currentTimeHST = new Date().toLocaleString("en-US", {timeZone: "Pacific/Honolulu"});
  const currentTime = new Date(currentTimeHST).getTime();
  let currentTimePoint = null;
  
  if (currentTime >= timeMin && currentTime <= timeMax) {
    // Find the closest data point to current time or interpolate
    const currentTimeData = filteredData.find(d => {
      const dataTime = new Date(d["Datetime"]).getTime();
      return Math.abs(dataTime - currentTime) < 30 * 60 * 1000; // Within 30 minutes
    });
    
    if (currentTimeData) {
      const time = new Date(currentTimeData["Datetime"]).getTime();
      const value = currentTimeData["Predicted_ft_MSL"];
      const x = padding + ((time - timeMin) / timeRange) * graphWidth;
      const y = padding + ((yMax - value) / yRange) * graphHeight;
      currentTimePoint = { x, y, time, value };
    } else {
      // Interpolate between nearest points
      const beforePoint = filteredData.filter(d => new Date(d["Datetime"]).getTime() <= currentTime).pop();
      const afterPoint = filteredData.find(d => new Date(d["Datetime"]).getTime() > currentTime);
      
      if (beforePoint && afterPoint) {
        const beforeTime = new Date(beforePoint["Datetime"]).getTime();
        const afterTime = new Date(afterPoint["Datetime"]).getTime();
        const ratio = (currentTime - beforeTime) / (afterTime - beforeTime);
        const interpolatedValue = beforePoint["Predicted_ft_MSL"] + 
          (afterPoint["Predicted_ft_MSL"] - beforePoint["Predicted_ft_MSL"]) * ratio;
        
        const x = padding + ((currentTime - timeMin) / timeRange) * graphWidth;
        const y = padding + ((yMax - interpolatedValue) / yRange) * graphHeight;
        currentTimePoint = { x, y, time: currentTime, value: interpolatedValue };
      }
    }
  }

  // Y-axis labels
  const yTicks = [-1, 0, 1, 2, 3, 4];
  
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
  
  // Threshold lines
  const threshold1Y = padding + ((yMax - 2.12) / yRange) * graphHeight;
  const threshold2Y = padding + ((yMax - 2.92) / yRange) * graphHeight;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="tideGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(54, 162, 235, 0.3)" />
              <Stop offset="100%" stopColor="rgba(54, 162, 235, 0.1)" />
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
          
          {/* Tide curve area fill */}
          <Path
            d={`${pathData} L${points[points.length - 1].x},${padding + graphHeight} L${points[0].x},${padding + graphHeight} Z`}
            fill="url(#tideGradient)"
          />
          
          {/* Tide curve line */}
          <Path
            d={pathData}
            stroke="rgba(54, 162, 235, 0.8)"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* High tide points */}
          {highTides.map((point, index) => (
            <Polygon
              key={`high-${index}`}
              points={`${point.x},${point.y - 6} ${point.x - 5},${point.y + 4} ${point.x + 5},${point.y + 4}`}
              fill="#000000"
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
          
          {/* Low tide points */}
          {lowTides.map((point, index) => (
            <Polygon
              key={`low-${index}`}
              points={`${point.x},${point.y + 6} ${point.x - 5},${point.y - 4} ${point.x + 5},${point.y - 4}`}
              fill="#000000"
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
          
          {/* Current time marker */}
          {currentTimePoint && (
            <Line
              x1={currentTimePoint.x}
              y1={padding}
              x2={currentTimePoint.x}
              y2={padding + graphHeight}
              stroke="#000000"
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
            2.12 ft
          </SvgText>
          <SvgText
            x={padding + 5}
            y={threshold2Y - 5}
            fontSize="10"
            fill="#F44336"
          >
            2.92 ft
          </SvgText>
        </Svg>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine]} />
            <Text style={styles.legendText}>Tide Curve</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendTriangleUp]} />
            <Text style={styles.legendText}>High Tides</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendTriangleDown]} />
            <Text style={styles.legendText}>Low Tides</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendVerticalLine]} />
            <Text style={styles.legendText}>Current Time</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
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
    flexWrap: 'wrap',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    backgroundColor: '#36A2EB',
    marginRight: 6,
    alignSelf: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  legendVerticalLine: {
    width: 2,
    height: 12,
    backgroundColor: '#000000',
    marginRight: 6,
    alignSelf: 'center',
  },
  legendTriangleUp: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000000',
    marginRight: 6,
  },
  legendTriangleDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000000',
    marginRight: 6,
  },
});

export default WaikaneTideGraph;
