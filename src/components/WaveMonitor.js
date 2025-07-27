import React, { useState, useEffect } from 'react';

const WaveMonitor = () => {
  const [waveData, setWaveData] = useState({
    height: 0,
    period: 0,
    direction: 'N',
    status: 'calm'
  });

  useEffect(() => {
    const generateWaveData = () => {
      const now = new Date();
      const height = Math.sin(now.getTime() / 1000000) * 2 + 3;
      const period = Math.sin(now.getTime() / 800000) * 5 + 10;
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const direction = directions[Math.floor((now.getTime() / 3600000) % 8)];
      
      setWaveData({
        height,
        period,
        direction,
        status: height > 4 ? 'high' : height > 2 ? 'moderate' : 'calm'
      });
    };

    generateWaveData();
    const interval = setInterval(generateWaveData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wave-monitor">
      <div className="component-card">
        <div className="card-header">
          <div className="card-icon">🌊</div>
          <div className="card-title">Wave Conditions - Kāne'ohe Bay</div>
        </div>
        
        <div className="data-grid">
          <div className="data-item">
            <div className="data-value">{waveData.height.toFixed(1)} ft</div>
            <div className="data-label">Wave Height</div>
          </div>
          
          <div className="data-item">
            <div className="data-value">{waveData.period.toFixed(1)} s</div>
            <div className="data-label">Wave Period</div>
          </div>
          
          <div className="data-item">
            <div className="data-value">{waveData.direction}</div>
            <div className="data-label">Wave Direction</div>
          </div>
          
          <div className="data-item">
            <div className="data-value">{waveData.status}</div>
            <div className="data-label">Conditions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveMonitor;