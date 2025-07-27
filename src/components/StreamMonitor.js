// components/StreamMonitor.js
import React, { useState, useEffect } from 'react';
import WaikaneStreamGraph from './WaikaneStreamGraph';
import WaiaholeStreamGraph from './WaiaholeStreamGraph';
import WaikaneStreamHeight from './WaikaneStreamHeight';
import WaiaholeStreamHeight from './WaiaholeStreamHeight';

const StreamMonitor = () => {
  const [loading, setLoading] = useState(true);
  const [streamData, setStreamData] = useState({
    waikane: {
      height: 0,
      flow: 0,
      status: 'safe',
      lastReading: null
    },
    waiahole: {
      height: 0,
      flow: 0,
      status: 'safe',
      lastReading: null
    }
  });

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        setLoading(true);
        const [waikaneRes, waiaholeRes] = await Promise.all([
          fetch('http://localhost:5000/api/waikane_stream'),
          fetch('http://localhost:5000/api/waiahole_stream')
        ]);
        const [waikaneData, waiaholeData] = await Promise.all([
          waikaneRes.json(),
          waiaholeRes.json()
        ]);

        // Helper to get latest valid reading
        const getLatest = (data) => {
          const now = new Date();
          return data
            .filter(d => d.ft != null && d.DateTime)
            .map(d => ({
              time: new Date(d.DateTime),
              value: d.ft
            }))
            .filter(d => d.time <= now)
            .sort((a, b) => b.time - a.time)[0];
        };

        const waikaneLatest = getLatest(waikaneData);
        const waiaholeLatest = getLatest(waiaholeData);

        // Status logic (adjust thresholds as needed)
        const getStatus = (height, isWaikane) => {
          if (isWaikane) {
            if (height > 10.8) return 'danger';
            if (height > 7) return 'warning';
            return 'safe';
          } else {
            if (height > 16.4) return 'danger';
            if (height > 12) return 'warning';
            return 'safe';
          }
        };

        setStreamData({
          waikane: {
            height: waikaneLatest ? waikaneLatest.value : 0,
            flow: waikaneLatest ? waikaneLatest.value * 15 : 0,
            status: waikaneLatest ? getStatus(waikaneLatest.value, true) : 'safe',
            lastReading: waikaneLatest ? waikaneLatest.time : null
          },
          waiahole: {
            height: waiaholeLatest ? waiaholeLatest.value : 0,
            flow: waiaholeLatest ? waiaholeLatest.value * 12 : 0,
            status: waiaholeLatest ? getStatus(waiaholeLatest.value, false) : 'safe',
            lastReading: waiaholeLatest ? waiaholeLatest.time : null
          }
        });

        // Show emergency banner if either stream is high
        const emergencyBanner = document.getElementById('emergencyBanner');
        if (emergencyBanner) {
          if ((waikaneLatest && waikaneLatest.value > 10) || (waiaholeLatest && waiaholeLatest.value > 12)) {
            emergencyBanner.style.display = 'block';
          } else {
            emergencyBanner.style.display = 'none';
          }
        }
      } catch (err) {
        console.error('Failed to fetch stream data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      default: return '✅';
    }
  };

  const getStatusText = (status, isWaikane) => {
    if (status === 'danger') return 'HIGH WATER - AVOID AREA';
    if (status === 'warning') return 'Elevated levels - Use caution';
    return 'Normal levels';
  };

  const formatTime = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Pacific/Honolulu'
    }) + ' HST';
  };

  const LoadingSkeleton = () => (
    <div className="data-grid">
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Current Height</div>
      </div>
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Last Reading</div>
      </div>
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Status</div>
      </div>
    </div>
  );

  return (
    <div className="stream-monitor">
      {/* Waikāne Stream Monitor */}
      <div className="component-card">
        <div className="card-header">
          <div className="card-icon">🏞️</div>
          <div className="card-title">Waikāne Stream Monitor</div>
          {loading && <div className="loading-badge">Loading...</div>}
        </div>
        
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="data-grid">
            <div className="data-item">
              <div className="data-value">
                {streamData.waikane.height.toFixed(2)} ft
              </div>
              <div className="data-label">Current Height</div>
            </div>
            
            {/* Commenting out Flow Rate
            <div className="data-item">
              <div className="data-value">
                {streamData.waikane.flow.toFixed(0)} cfs
              </div>
              <div className="data-label">Flow Rate</div>
            </div>
            */}
            
            <div className="data-item">
              <div className="data-value">
                {formatTime(streamData.waikane.lastReading)}
              </div>
              <div className="data-label">Last Reading</div>
            </div>
            
            <div className="data-item">
              <div className="data-value">
                {getStatusIcon(streamData.waikane.status)}
              </div>
              <div className="data-label">Status</div>
            </div>
          </div>
        )}
        
        {!loading && (
          <div className={`status-indicator status-${streamData.waikane.status}`}>
            {getStatusIcon(streamData.waikane.status)} {getStatusText(streamData.waikane.status, true)}
          </div>
        )}
        
        {/* Live Chart Placeholder */}
        <WaikaneStreamHeight />
        <WaikaneStreamGraph />
      </div>

      {/* Waiahōle Stream Monitor */}
      <div className="component-card">
        <div className="card-header">
          <div className="card-icon">🌊</div>
          <div className="card-title">Waiahōle Stream Monitor</div>
          {loading && <div className="loading-badge">Loading...</div>}
        </div>
        
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="data-grid">
            <div className="data-item">
              <div className="data-value">
                {streamData.waiahole.height.toFixed(2)} ft
              </div>
              <div className="data-label">Current Height</div>
            </div>
            
            {/* Commenting out Flow Rate
            <div className="data-item">
              <div className="data-value">
                {streamData.waiahole.flow.toFixed(0)} cfs
              </div>
              <div className="data-label">Flow Rate</div>
            </div>
            */}
            
            <div className="data-item">
              <div className="data-value">
                {formatTime(streamData.waiahole.lastReading)}
              </div>
              <div className="data-label">Last Reading</div>
            </div>
            
            <div className="data-item">
              <div className="data-value">
                {getStatusIcon(streamData.waiahole.status)}
              </div>
              <div className="data-label">Status</div>
            </div>
          </div>
        )}
        
        {!loading && (
          <div className={`status-indicator status-${streamData.waiahole.status}`}>
            {getStatusIcon(streamData.waiahole.status)} {getStatusText(streamData.waiahole.status, false)}
          </div>
        )}
        
        {/* Live Chart Placeholder */}
        <WaiaholeStreamHeight />
        <WaiaholeStreamGraph />
      </div>
    </div>
  );
};

export default StreamMonitor;