import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';

Chart.register(annotationPlugin);

const WaikaneTideGraph = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [curveData, setCurveData] = useState([]);
  const [tideData, setTideData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/waikane_tide_curve')
      .then(res => res.json())
      .then(curve => {
        setCurveData(curve);
      })
      .catch(error => {
        console.error('Error fetching curve data:', error);
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/waikane_tides')
      .then(res => res.json())
      .then(data => {
        setTideData(data);
      })
      .catch(error => {
        console.error('Error fetching tide data:', error);
      });
  }, []);

  useEffect(() => {
    if (curveData.length === 0 || tideData.length === 0) {
      return;
    }

    const sortedCurveData = [...curveData].sort((a, b) => new Date(a["Datetime"]) - new Date(b["Datetime"]));

    const curvePoints = sortedCurveData.map(d => ({
      x: new Date(d["Datetime"]),
      y: d["Predicted_ft_MSL"]
    }));

    const xMin = curvePoints.length > 0 ? curvePoints[0].x : null;
    const xMax = curvePoints.length > 0 ? curvePoints[curvePoints.length - 1].x : null;

    const now = new Date();
    let latestPointIndex = -1;
    for (let i = curvePoints.length - 1; i >= 0; i--) {
      if (curvePoints[i].x <= now) {
        latestPointIndex = i;
        break;
      }
    }

    const latestPoint = latestPointIndex !== -1 ? curvePoints[latestPointIndex] : null;

    const tidePoints = tideData.map(d => ({
      x: new Date(d["Date Time"]),
      y: d["Prediction_ft_MSL"],
      type: d["Type"]
    }));

    const highTides = tidePoints.filter(point => point.type === 'H');
    const lowTides = tidePoints.filter(point => point.type === 'L');

    const data = {
      datasets: [
        {
          label: 'Tide Curve',
          data: curvePoints,
          borderColor: 'rgba(54, 162, 235, 0.8)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.3,
          fill: 'start',
          spanGaps: true,
          order: 2,
          pointRadius: 0,
          pointStyle: 'rect',
          pointHitRadius: 10
        },
        {
          label: 'High Tides',
          data: highTides.map(point => ({ x: point.x, y: point.y })),
          type: 'scatter',
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointRadius: 8,
          pointHoverRadius: 10,
          showLine: false,
          order: 1
        },
        {
          label: 'Low Tides',
          data: lowTides.map(point => ({ x: point.x, y: point.y })),
          type: 'scatter',
          backgroundColor: 'rgba(132, 185, 115, 0.8)',
          borderColor: 'rgba(132, 185, 115, 0.8)',
          pointRadius: 8,
          pointHoverRadius: 10,
          showLine: false,
          order: 1
        },
        {
          label: 'Latest Reading',
          data: latestPoint ? [latestPoint] : [],
          type: 'scatter',
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          pointStyle: 'triangle',
          radius: 8,
          order: 1
        }
      ]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          annotation: {
            annotations: {
              yellowLine: {
                type: 'line',
                yMin: 2.12,
                yMax: 2.12,
                borderColor: '#FFC107',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  content: '2.12 ft',
                  enabled: true,
                  position: 'start'
                }
              },
              redLine: {
                type: 'line',
                yMin: 2.92,
                yMax: 2.92,
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  content: '2.92 ft',
                  enabled: true,
                  position: 'start'
                }
              }
            }
          },
          title: {
            display: true,
            text: 'Waikāne Predicted Tides (Above Mean Sea Level)',
            font: { size: 16 },
            color: 'black'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const date = context.parsed.x ? new Date(context.parsed.x) : null;
                const dateStr = date
                  ? date.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                  : '';
                if (context.dataset.label === 'High Tides') {
                  return `High Tide: ${context.parsed.y} ft\n${dateStr}`;
                } else if (context.dataset.label === 'Low Tides') {
                  return `Low Tide: ${context.parsed.y} ft\n${dateStr}`;
                } else if (context.dataset.label === 'Latest Reading') {
                  return `Latest Reading: ${context.parsed.y} ft\n${dateStr}`;
                }
                return `Tide: ${context.parsed.y} ft`;
              }
            }
          },
          legend: {
            labels: {
              color: 'black',
              usePointStyle: true,
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            min: xMin,
            max: xMax,
            time: {
              unit: 'hour',
              displayFormats: {
                hour: 'MMM d, h:mm a'
              }
            },
            title: {
              display: true,
              text: 'Time',
              color: 'black'
            },
            ticks: {
              color: 'black',
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false,
              stepSize: 1,
              callback: function(value) {
                const date = new Date(value);
                const hour = date.getHours();
                return hour % 6 === 0 ? date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                }) : '';
              }
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          },
          y: {
            min: -1,
            max: 3.92,
            title: {
              display: true,
              text: 'Tide Height (ft)',
              color: 'black'
            },
            ticks: {
              color: 'black'
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            }
          }
        }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [curveData, tideData]);

  return (
    <div style={{ width: '800px', height: '400px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '0 auto' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default WaikaneTideGraph;
