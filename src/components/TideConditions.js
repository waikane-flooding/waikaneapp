import React, { useState, useEffect } from 'react';
import WaikaneTideGraph from './WaikaneTideGraph';
import WaikaneTideLevel from './WaikaneTideLevel';

const TideConditions = () => {
  const [loading, setLoading] = useState(true);
  // Initialize with current date for nextHigh and nextLow
  const [tideData, setTideData] = useState({
    currentHeight: 0,
    direction: 'rising',
    nextHigh: new Date(),
    nextLow: new Date(),
    status: 'normal'
  });

  useEffect(() => {
    const fetchTideData = async () => {
      try {
        setLoading(true);
        // Fetch curve for current height/direction
        const curveRes = await fetch('http://localhost:5000/api/waikane_tide_curve');
        const curveData = await curveRes.json();
        // Fetch tides for next high/low
        const tidesRes = await fetch('http://localhost:5000/api/waikane_tides');
        const tidesData = await tidesRes.json();

        // Get latest curve entry for current height
        const now = new Date();
        const pastCurves = curveData
          .map(item => ({
            time: new Date(item["Datetime"]),
            height: item["Predicted_ft_MSL"]
          }))
          .filter(d => d.time <= now)
          .sort((a, b) => b.time - a.time);
        const latestCurve = pastCurves[0];

        // Determine direction (rising/falling) by comparing to previous point
        let direction = 'N/A';
        if (pastCurves.length > 1) {
          direction = latestCurve.height > pastCurves[1].height ? 'rising' : 'falling';
        }

        // Get next high and low tides from tidesData
        const futureTides = tidesData
          .map(item => ({
            time: new Date(item["Date Time"]),
            type: item["Type"]
          }))
          .filter(d => d.time > now)
          .sort((a, b) => a.time - b.time);
        const nextHigh = futureTides.find(d => d.type === 'H');
        const nextLow = futureTides.find(d => d.type === 'L');

        // Status logic
        let status = 'safe';
        if (latestCurve) {
          if (latestCurve.height > 1.87 && latestCurve.height <= 3) {
            status = 'danger';
          } else if (latestCurve.height > 1 && latestCurve.height <= 1.87) {
            status = 'warning';
          } else if (latestCurve.height >= -2 && latestCurve.height <= 1) {
            status = 'safe';
          } else {
            status = 'safe'; // fallback for out-of-range values
          }
        }

        setTideData({
          currentHeight: latestCurve ? latestCurve.height : 0,
          direction: direction,
          nextHigh: nextHigh ? nextHigh.time : null,
          nextLow: nextLow ? nextLow.time : null,
          status: status
        });
      } catch (err) {
        console.error('Failed to fetch tide data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTideData();
  }, []);

  const formatTime = (date) => {
    // Add null check
    if (!date) return 'N/A';
    
    try {
      return date.toLocaleString('en-US', {
        timeZone: 'Pacific/Honolulu',
        timeStyle: 'short'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  // ...rest of the component code remains the same...

  const getStatusIcon = (status) => {
    switch (status) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      case 'safe': return '✅';
      default: return '🌊';
    }
  };

  const LoadingSkeleton = () => (
    <div className="data-grid">
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Current Height</div>
      </div>
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Tide Direction</div>
      </div>
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Next High Tide</div>
      </div>
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Next Low Tide</div>
      </div>
    </div>
  );

  return (
    <div className="tide-conditions">
      <div className="component-card">
        <div className="card-header">
          <div className="card-icon">🌊</div>
          <div className="card-title">Current Tide Conditions - Kāne'ohe Bay</div>
          {loading && <div className="loading-badge">Loading...</div>}
        </div>
        
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="data-grid">
            <div className="data-item">
              <div className="data-value">
                {tideData.currentHeight.toFixed(2)} ft
              </div>
              <div className="data-label">Current Height</div>
            </div>
            
            <div className="data-item">
              <div className="data-value">
                {tideData.direction}
              </div>
              <div className="data-label">Tide Direction</div>
            </div>
            
            <div className="data-item">
              <div className="data-value">
                {formatTime(tideData.nextHigh)}
              </div>
              <div className="data-label">Next High Tide</div>
            </div>
            
            <div className="data-item">
              <div className="data-value">
                {formatTime(tideData.nextLow)}
              </div>
              <div className="data-label">Next Low Tide</div>
            </div>
          </div>
        )}
        
        {!loading && (
          <div className={`status-indicator status-${tideData.status}`}>
            {getStatusIcon(tideData.status)} Tide Status: {tideData.status.toUpperCase()}
          </div>
        )}
        
        <WaikaneTideLevel />
        <WaikaneTideGraph />
      </div>
    </div>
  );
};

export default TideConditions;