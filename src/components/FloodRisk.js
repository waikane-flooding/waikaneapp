import React, { useState, useEffect } from 'react';

const FloodRisk = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    waikaneStream: { height: 0, status: 'safe', lastReading: null },
    waiaholeStream: { height: 0, status: 'safe', lastReading: null },
    waikaneTide: { height: 0, status: 'normal', lastReading: null }
  });

  const emergencyContacts = [
    {
      name: "Honolulu Emergency Services",
      number: "911",
      description: "For immediate emergency response"
    },
    {
      name: "Windward Police Station",
      number: "(808) 723-8650",
      description: "Kāne'ohe Police Department"
    },
    {
      name: "Flood Control Hotline",
      number: "(808) 723-8488",
      description: "Report flooding issues"
    },
    {
      name: "Board of Water Supply",
      number: "(808) 748-5000",
      description: "Water emergency & main breaks"
    },
    {
      name: "Hawaiian Electric",
      number: "(808) 548-7961",
      description: "Power outages & emergencies"
    }
  ];

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [waikaneStreamRes, waiaholeStreamRes, waikaneTideRes] = await Promise.all([
          fetch('http://localhost:5000/api/waikane_stream'),
          fetch('http://localhost:5000/api/waiahole_stream'),
          fetch('http://localhost:5000/api/waikane_tide_curve')
        ]);

        const [waikaneStreamData, waiaholeStreamData, waikaneTideData] = await Promise.all([
          waikaneStreamRes.json(),
          waiaholeStreamRes.json(),
          waikaneTideRes.json()
        ]);

        // Helper to get latest valid reading
        const getLatest = (data, isTide = false) => {
          const now = new Date();
          return data
            .filter(d => {
              if (isTide) {
                return d.Predicted_ft_MSL != null && d.Datetime;
              }
              return d.ft != null && d.DateTime;
            })
            .map(d => ({
              time: new Date(isTide ? d.Datetime : d.DateTime),
              value: isTide ? d.Predicted_ft_MSL : d.ft
            }))
            .filter(d => d.time <= now)
            .sort((a, b) => b.time - a.time)[0];
        };

        const waikaneStreamLatest = getLatest(waikaneStreamData);
        const waiaholeStreamLatest = getLatest(waiaholeStreamData);
        const waikaneTideLatest = getLatest(waikaneTideData, true);

        // Status logic for streams
        const getStreamStatus = (height, isWaikane) => {
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

        // Status logic for tide
        const getTideStatus = (height) => {
          if (height >= 1.87) return 'danger';
          if (height >= 1) return 'warning';
          return 'safe';
        };

        setSummaryData({
          waikaneStream: {
            height: waikaneStreamLatest ? waikaneStreamLatest.value : 0,
            status: waikaneStreamLatest ? getStreamStatus(waikaneStreamLatest.value, true) : 'safe',
            lastReading: waikaneStreamLatest ? waikaneStreamLatest.time : null
          },
          waiaholeStream: {
            height: waiaholeStreamLatest ? waiaholeStreamLatest.value : 0,
            status: waiaholeStreamLatest ? getStreamStatus(waiaholeStreamLatest.value, false) : 'safe',
            lastReading: waiaholeStreamLatest ? waiaholeStreamLatest.time : null
          },
          waikaneTide: {
            height: waikaneTideLatest ? waikaneTideLatest.value : 0,
            status: waikaneTideLatest ? getTideStatus(waikaneTideLatest.value) : 'normal',
            lastReading: waikaneTideLatest ? waikaneTideLatest.time : null
          }
        });

      } catch (err) {
        console.error('Failed to fetch summary data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      case 'high': return '🌊';
      case 'low': return '🏖️';
      default: return '✅';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'danger': return 'Danger';
      case 'warning': return 'Warning';
      default: return 'Safe';
    }
  };

  const formatTime = (date) => {
    if (!date) return '--';
    return date.toLocaleString('en-US', {
      timeZone: 'Pacific/Honolulu',
      timeStyle: 'short'
    });
  };

  const LoadingSkeleton = () => (
    <div className="data-grid">
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Waikāne Stream Risk</div>
      </div>
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Waiāhole Stream Risk</div>
      </div>
      <div className="data-item">
        <div className="data-value loading-skeleton">--</div>
        <div className="data-label">Waikāne Tides Risk</div>
      </div>
    </div>
  );

  return (
    <div className="flood-risk">
      {/* Flood Risk Assessment Section */}
      <div className="component-card">
        <div className="card-header">
          <div className="card-icon">⚠️</div>
          <div className="card-title">Flood Risk Assessment</div>
          {loading && <div className="loading-badge">Loading...</div>}
        </div>
        
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="data-grid">
            <div className="data-item">
              <div className="data-value">
                {summaryData.waikaneStream.status === 'danger' ? 'High' : 
                 summaryData.waikaneStream.status === 'warning' ? 'Moderate' : 'Low'}
              </div>
              <div className="data-label">Waikāne Stream Risk</div>
              <div className="data-status">
                {getStatusIcon(summaryData.waikaneStream.status)} {getStatusText(summaryData.waikaneStream.status)}
              </div>
            </div>
            
            <div className="data-item">
              <div className="data-value">
                {summaryData.waiaholeStream.status === 'danger' ? 'High' : 
                 summaryData.waiaholeStream.status === 'warning' ? 'Moderate' : 'Low'}
              </div>
              <div className="data-label">Waiāhole Stream Risk</div>
              <div className="data-status">
                {getStatusIcon(summaryData.waiaholeStream.status)} {getStatusText(summaryData.waiaholeStream.status)}
              </div>
            </div>
            
            <div className="data-item">
              <div className="data-value">
                {summaryData.waikaneTide.status === 'danger' ? 'High' : 
                 summaryData.waikaneTide.status === 'warning' ? 'Moderate' : 'Low'}
              </div>
              <div className="data-label">Waikāne Tide Risk</div>
              <div className="data-status">
                {getStatusIcon(summaryData.waikaneTide.status)} {getStatusText(summaryData.waikaneTide.status)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts Section */}
      <div className="component-card">
        <div className="card-header">
          <div className="card-icon">🚨</div>
          <div className="card-title">Emergency Contacts</div>
        </div>
        <div className="contacts-grid">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="contact-item">
              <div className="contact-name">{contact.name}</div>
              <a href={`tel:${contact.number}`} className="contact-number">
                {contact.number}
              </a>
              <div className="contact-description">{contact.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloodRisk;