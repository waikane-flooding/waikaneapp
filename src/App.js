import React, { useState, useEffect } from 'react';
import './App.css';

// Import components
import StreamMonitor from './components/StreamMonitor';
import TideConditions from './components/TideConditions';
import WaveMonitor from './components/WaveMonitor';
import FloodRisk from './components/FloodRisk';
import WeatherData from './components/WeatherData';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Update timestamp every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Stream Heights', icon: 'fas fa-water' },
    { id: 'tides', label: 'Tide Conditions', icon: 'fas fa-waves' },
    { id: 'waves', label: 'Wave Monitor', icon: 'fas fa-swimmer' },
    { id: 'flood-risk', label: 'Flood Risk', icon: 'fas fa-exclamation-triangle' },
    { id: 'weather', label: 'Weather Data', icon: 'fas fa-cloud-sun' }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <StreamMonitor />;
      case 'tides':
        return <TideConditions />;
      case 'waves':
        return <WaveMonitor />;
      case 'flood-risk':
        return <FloodRisk />;
      case 'weather':
        return <WeatherData />;
      default:
        return <StreamMonitor />;
    }
  };

  const getCurrentTitle = () => {
    const item = menuItems.find(item => item.id === currentView);
    return item ? item.label : 'Stream Heights';
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">🌺 Windward O'ahu Monitor</h1>
            <p className="app-subtitle">Real-time flood monitoring • Waikāne & Waiāhole Streams</p>
          </div>
          
          <div className="header-right">
            <button 
              className={`menu-toggle ${menuOpen ? 'active' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown Menu */}
      <div className={`dropdown-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-content">
          <div className="menu-header">
            <h3>🌊 Navigation</h3>
          </div>
          <nav className="menu-nav">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`menu-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView(item.id);
                  setMenuOpen(false);
                }}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
                {currentView === item.id && <i className="fas fa-check"></i>}
              </button>
            ))}
          </nav>
          
          <div className="menu-footer">
            <div className="last-update">
              <i className="fas fa-clock"></i>
              <span>Last Update:</span>
              <time>
                {lastUpdate.toLocaleString('en-US', {
                  timeZone: 'Pacific/Honolulu',
                  dateStyle: 'short',
                  timeStyle: 'medium'
                })} HST
              </time>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      {menuOpen && (
        <div 
          className="menu-overlay" 
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h2 className="content-title">
            <i className={menuItems.find(item => item.id === currentView)?.icon}></i>
            {getCurrentTitle()}
          </h2>
        </div>
        
        <div className="content-body">
          {renderCurrentView()}
        </div>
      </main>

      {/* Emergency Alert Banner */}
      <div className="emergency-banner" id="emergencyBanner" style={{display: 'none'}}>
        <div className="banner-content">
          <i className="fas fa-exclamation-triangle"></i>
          <span>HIGH WATER ALERT - Stream levels elevated. Avoid low-lying areas.</span>
          <button onClick={() => document.getElementById('emergencyBanner').style.display = 'none'}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;