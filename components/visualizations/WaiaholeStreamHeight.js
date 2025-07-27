import React, { useEffect, useState } from 'react';
import GaugeChart from 'react-gauge-chart';

const WaiaholeStreamHeight = () => {
  const [streamLevel, setStreamLevel] = useState(null);
  const [streamTime, setStreamTime] = useState(null);

  const maxLevel = 22;
  const greenEnd = 12 / maxLevel;
  const yellowEnd = 16.4 / maxLevel;
  const redEnd = 1;
  const customTicks = Array.from({ length: 12 }, (_, i) => i * 2);

  useEffect(() => {
    fetch('http://localhost:5000/api/waiahole_stream')
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const latest = data
          .filter(d => d.ft != null && d.DateTime)
          .map(d => ({
            time: new Date(d.DateTime),
            value: d.ft
          }))
          .filter(d => d.time <= now)
          .sort((a, b) => b.time - a.time)[0];

        if (latest) {
          setStreamLevel(latest.value);
          setStreamTime(latest.time);
        }
      })
      .catch(err => console.error("Failed to load stream data", err));
  }, []);

  const percent = streamLevel !== null ? streamLevel / maxLevel : 0;

  const formattedDateTime = streamTime
    ? 'Latest Reading: ' + new Date(streamTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Pacific/Honolulu'
      }) + ' HST'
    : 'Loading...';

  return (
    <div style={{ width: '600px', margin: '0 auto', position: 'relative', marginTop: '50px' }}>
      <h3 style={{ color: 'black', marginBottom: '24px', fontSize: '20px' }}>Waiāhole Stream Height</h3>
      <GaugeChart
        id="stream-gauge"
        nrOfLevels={3}
        colors={["#4CAF50", "#FFC107", "#F44336"]}
        percent={percent}
        textColor="#000000"
        needleColor="#000000"
        needleBaseColor="#000000"
        arcWidth={0.3}
        formatTextValue={() => ''}
        style={{ width: '100%' }}
        arcsLength={[greenEnd, yellowEnd - greenEnd, redEnd - yellowEnd]}
        animate={true}
      />
      <div style={{ 
        color: 'black', 
        fontSize: '32px', 
        marginTop: '15px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {streamLevel !== null ? `${streamLevel.toFixed(2)} ft` : 'Loading...'}
      </div>
      <div style={{ 
        color: 'black', 
        fontSize: '16px', 
        marginTop: '8px',
        textAlign: 'center'
      }}>
        {formattedDateTime}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px',
        color: 'black',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#4CAF50' }}></div>
          <span>0-12 ft: No Flooding</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#FFC107' }}></div>
          <span>12-16.4 ft: Minor Flooding</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#F44336' }}></div>
          <span>16.4-22 ft: Major Flooding</span>
        </div>
      </div>
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {customTicks.map((tick) => {
          const angle = 180 - (tick / maxLevel) * 180;
          const radian = (angle * Math.PI) / 180;

          const radius = 225;
          const x = 300 + radius * Math.cos(radian);
          const y = 300 - radius * Math.sin(radian);

          const labelRadius = radius + 30;
          const labelX = 300 + labelRadius * Math.cos(radian);
          const labelY = 300 - labelRadius * Math.sin(radian);

          return (
            <g key={tick}>
              <line
                x1={x}
                y1={y}
                x2={x + 15 * Math.cos(radian)}
                y2={y - 15 * Math.sin(radian)}
                stroke="#000000"
                strokeWidth="3"
              />
              <text
                x={labelX}
                y={labelY}
                fill="#000000"
                fontSize="16"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {`${tick} ft`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WaiaholeStreamHeight;
