import React, { useEffect, useState } from 'react';
import GaugeChart from 'react-gauge-chart';

const WaikaneTideLevel = () => {
  const [tideLevel, setTideLevel] = useState(null);
  const [tideTime, setTideTime] = useState(null);

  const minLevel = -1;
  const maxLevel = 3.92;

  useEffect(() => {
    fetch('http://localhost:5000/api/waikane_tide_curve')
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const pastTides = data
          .map(item => ({
            time: new Date(item["Datetime"]),
            height: item["Predicted_ft_MSL"]
          }))
          .filter(d => d.time <= now)
          .sort((a, b) => b.time - a.time);

        if (pastTides.length > 0) {
          const latest = pastTides[0];
          setTideLevel(latest.height);
          setTideTime(latest.time);
        }
      })
      .catch(err => console.error("Failed to load tide data", err));
  }, []);

  const percent = tideLevel !== null ? (tideLevel - minLevel) / (maxLevel - minLevel) : 0;

  const greenEnd = 2.12;
  const yellowEnd = 2.92;

  const greenToYellow = (greenEnd - minLevel) / (maxLevel - minLevel);
  const yellowToRed = (yellowEnd - minLevel) / (maxLevel - minLevel);

  const formattedDateTime = tideTime
    ? 'Latest Reading: ' + new Date(tideTime).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Pacific/Honolulu'
      }) + ' HST'
    : 'Loading...';

  const customTicks = [-1, 0, 1, 2, 3];

  return (
    <div style={{ width: '600px', margin: '0 auto', position: 'relative', marginTop: '50px' }}>
      <h3 style={{ color: 'black', marginBottom: '24px', fontSize: '20px' }}>Waikāne Tide Level</h3>
      <GaugeChart
        id="tide-gauge"
        nrOfLevels={3}
        colors={["#4CAF50", "#FFC107", "#F44336"]}
        percent={percent}
        textColor="#000000"
        needleColor="#000000"
        needleBaseColor="#000000"
        arcWidth={0.3}
        formatTextValue={() => ''}
        style={{ width: '100%' }}
        arcsLength={[greenToYellow, yellowToRed - greenToYellow, 1 - yellowToRed]}
        animate={true}
      />
      <div style={{
        color: 'black',
        fontSize: '32px',
        marginTop: '15px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {tideLevel !== null ? `${tideLevel.toFixed(2)} ft` : 'Loading...'}
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
          <span>-1-2.12 ft: No Flooding</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#FFC107' }}></div>
          <span>2.12-2.92 ft: Minor Flooding</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '15px', height: '15px', backgroundColor: '#F44336' }}></div>
          <span>2.92-3.92 ft: Major Flooding</span>
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
          const angle = 180 - ((tick - minLevel) / (maxLevel - minLevel)) * 180;
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

export default WaikaneTideLevel;