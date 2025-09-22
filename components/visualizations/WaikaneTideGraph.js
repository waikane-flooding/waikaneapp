import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, Line, Circle, Polygon, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

const WaikaneTideGraph = () => {
  const [curveData, setCurveData] = useState([]);
  const [tideData, setTideData] = useState([]);

  useEffect(() => {
    fetch('http://149.165.159.169:5000/api/waikane_tide_curve')
      .then(res => res.json())
      .then(curve => {
        setCurveData(curve);
      })
      .catch(error => {
        console.error('Error fetching curve data:', error);
      });
  }, []);

  useEffect(() => {
    fetch('http://149.165.159.169:5000/api/waikane_tides')
      .then(res => res.json())
      .then(data => {
        setTideData(data);
      })
      .catch(error => {
        console.error('Error fetching tide data:', error);
      });
  }, []);

  // Chart dimensions - fill the container
  const chartWidth = 650;
  const chartHeight = 300;
  const padding = 50;
  const graphWidth = chartWidth - 2 * padding;
  const graphHeight = chartHeight - 2 * padding;

  // Y-axis range
  const yMin = -2;
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

  // Robust HST 'now' logic: get UTC, subtract 10h, format as HST string, parse as local time
  function getNowHSTAsLocalDate() {
    const nowUTC = new Date();
    nowUTC.setUTCHours(nowUTC.getUTCHours() - 10);
    // Format as 'YYYY-MM-DDTHH:mm:ss' (API format)
    const yyyy = nowUTC.getUTCFullYear();
    const mm = String(nowUTC.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(nowUTC.getUTCDate()).padStart(2, '0');
    const hh = String(nowUTC.getUTCHours()).padStart(2, '0');
    const min = String(nowUTC.getUTCMinutes()).padStart(2, '0');
    const ss = String(nowUTC.getUTCSeconds()).padStart(2, '0');
    const hstString = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    return new Date(hstString);
  }
  // Get current HST time as local date
  const nowHST = getNowHSTAsLocalDate();

  // Calculate 12 AM previous day in HST (start window)
  const startWindow = new Date(nowHST);
  startWindow.setHours(0, 0, 0, 0);
  startWindow.setDate(startWindow.getDate() - 1);

  // Find the latest reading in the filtered window (for end window)
  const filteredData = sortedCurveData.filter(d => {
    const date = new Date(d["Datetime"]);
    return date >= startWindow && date <= nowHST;
  });

  // Find the latest reading in the window
  let latestReadingDate = nowHST;
  if (filteredData.length > 0) {
    latestReadingDate = new Date(filteredData[filteredData.length - 1]["Datetime"]);
  }

  // Calculate 12 AM the next day after the latest reading (end window)
  const endWindow = new Date(latestReadingDate);
  endWindow.setHours(0, 0, 0, 0);
  endWindow.setDate(endWindow.getDate() + 1);

  // Final data for graph: all points between startWindow and endWindow
  const displayData = sortedCurveData.filter(d => {
    const date = new Date(d["Datetime"]);
    return date >= startWindow && date <= endWindow;
  });

  if (displayData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No recent data available</Text>
        </View>
      </View>
    );
  }

  // Always use the full window from 12 AM previous day to 12 AM next day
  const timeMin = startWindow.getTime();
  const timeMax = endWindow.getTime();
  const timeRange = timeMax - timeMin;

  // Convert data to SVG coordinates
  const points = displayData.map(d => {
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
      return date >= startWindow && date <= endWindow; // Use same time range as curve data
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

  // Find latest reading marker on the curve (MUST match WaikaneTideLevel logic exactly)
  let latestReadingPoint = null;
  let latestReading = null;
  let latestReadingTime = null;
  // Sort curveData by Datetime ascending (just in case)
  const sortedByTime = [...curveData].sort((a, b) => new Date(a["Datetime"]) - new Date(b["Datetime"]));
  for (let i = sortedByTime.length - 1; i >= 0; i--) {
    const d = sortedByTime[i];
    const dataTime = new Date(d["Datetime"]);
    if (dataTime <= nowHST && !isNaN(dataTime.getTime()) && d["Predicted_ft_MSL"] != null) {
      latestReading = d;
      latestReadingTime = dataTime;
      break;
    }
  }
  if (latestReading && latestReadingTime) {
    const time = latestReadingTime.getTime();
    const value = latestReading["Predicted_ft_MSL"];
    // Project this time onto the current graph window
    const x = padding + ((time - timeMin) / timeRange) * graphWidth;
    const y = padding + ((yMax - value) / yRange) * graphHeight;
    latestReadingPoint = { x, y, time, value, datetime: latestReading["Datetime"] };
  }

  // Y-axis labels
  const yTicks = [-2, -1, 0, 1, 2, 3, 4];
  
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
      timeLabel = '12:00 AM';
    } else if (hour === 6) {
      timeLabel = '6:00 AM';
    } else if (hour === 12) {
      timeLabel = '12:00 PM';
    } else if (hour === 18) {
      timeLabel = '6:00 PM';
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
  const threshold1Y = padding + ((yMax - 2.92) / yRange) * graphHeight;
  const threshold2Y = padding + ((yMax - 3.42) / yRange) * graphHeight;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Y-axis title */}
          <SvgText
            x={padding - 25}
            y={padding + graphHeight / 2}
            fontSize="14"
            fill="#333"
            textAnchor="middle"
            transform={`rotate(-90, ${padding - 25}, ${padding + graphHeight / 2})`}
            fontWeight="bold"
          >
            Tide Height (ft)
          </SvgText>
          {/* X-axis title */}
          <SvgText
            x={padding + graphWidth / 2}
            y={padding + graphHeight + 50}
            fontSize="14"
            fill="#333"
            textAnchor="middle"
            fontWeight="bold"
          >
            Date and Time
          </SvgText>
          
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
          
          {/* Latest reading marker */}
          {latestReadingPoint && (
            <>
              <Line
                x1={latestReadingPoint.x}
                y1={padding}
                x2={latestReadingPoint.x}
                y2={padding + graphHeight}
                stroke="#000000"
                strokeWidth={3}
              />
            </>
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
                {tick}
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
            fontSize="12"
            fill="#FFC107"
          >
            Elevated Tide: 2.92 ft
          </SvgText>
          <SvgText
            x={padding + 5}
            y={threshold2Y - 5}
            fontSize="12"
            fill="#F44336"
          >
            Extreme Tide: 3.42 ft
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
            <View style={[styles.legendBar]} />
            <Text style={styles.legendText}>Latest Reading</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

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
  legendBar: {
    width: 3,
    height: 16,
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
