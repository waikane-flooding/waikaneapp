//getting data from OpenWeatherMap API for Waikāne Valley, O'ahu

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Waikāne Valley coordinates
  const lat = 21.4853;
  const lon = -157.8445;
  const API_KEY = '72fee9f945db2ce098f8f118758aa602';

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Fetch current weather
        const currentResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
        );

        // Fetch 7-day forecast
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`
        );

        // Process forecast data to get daily values
        const dailyForecasts = {};
        forecastResponse.data.list.forEach(item => {
          const date = new Date(item.dt * 1000).toLocaleDateString();
          if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
              high: item.main.temp_max,
              low: item.main.temp_min,
              conditions: item.weather[0].main,
              rain: item.pop * 100
            };
          } else {
            dailyForecasts[date].high = Math.max(dailyForecasts[date].high, item.main.temp_max);
            dailyForecasts[date].low = Math.min(dailyForecasts[date].low, item.main.temp_min);
          }
        });

        setWeatherData({
          current: {
            temp: Math.round(currentResponse.data.main.temp),
            humidity: currentResponse.data.main.humidity,
            windSpeed: Math.round(currentResponse.data.wind.speed),
            rainfall: currentResponse.data.rain ? currentResponse.data.rain['1h'] || 0 : 0,
            conditions: currentResponse.data.weather[0].main
          },
          forecast: Object.entries(dailyForecasts).slice(0, 7).map(([date, data]) => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            high: Math.round(data.high),
            low: Math.round(data.low),
            conditions: data.conditions,
            rain: `${Math.round(data.rain)}%`
          }))
        });
        setLoading(false);
      } catch (err) {
        console.error('Weather API Error:', err);
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeatherData();
    // Refresh data every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [API_KEY, lat, lon]);

  const getWeatherIcon = (conditions) => {
    switch (conditions.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'mostly sunny': return '🌤️';
      case 'partly cloudy': return '⛅';
      case 'scattered showers': return '🌦️';
      case 'rain': return '🌧️';
      default: return '☁️';
    }
  };

  if (loading) return <div className="loading">Loading weather data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!weatherData) return null;

  return (
    <div className="weather-data">
      <div className="component-card">
        <div className="card-header">
          <div className="card-icon">🌤️</div>
          <div className="card-title">
            Weather Conditions
            <div className="card-subtitle">Waikāne Valley, O'ahu</div>
          </div>
        </div>
        
        {/* Current Conditions */}
        <div className="current-weather">
          <h3>Current Conditions</h3>
          <div className="data-grid">
            <div className="data-item">
              <div className="data-value">{weatherData.current.temp}°F</div>
              <div className="data-label">Temperature</div>
            </div>
            
            <div className="data-item">
              <div className="data-value">{weatherData.current.humidity}%</div>
              <div className="data-label">Humidity</div>
            </div>

            <div className="data-item">
              <div className="data-value">{weatherData.current.windSpeed} mph</div>
              <div className="data-label">Wind Speed</div>
            </div>

            <div className="data-item">
              <div className="data-value">{weatherData.current.rainfall}"</div>
              <div className="data-label">Rainfall (24h)</div>
            </div>
          </div>
        </div>

        {/* Weekly Forecast */}
        <div className="weekly-forecast">
          <h3>7-Day Forecast</h3>
          <div className="forecast-grid">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-day">{day.day}</div>
                <div className="forecast-icon">{getWeatherIcon(day.conditions)}</div>
                <div className="forecast-temps">
                  <span className="high">{day.high}°</span>
                  <span className="low">{day.low}°</span>
                </div>
                <div className="forecast-rain">{day.rain} rain</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherData;