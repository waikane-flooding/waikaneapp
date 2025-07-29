# Waikāne Flooding Backend API

This is the backend API server for the Waikāne flooding monitoring system, providing real-time stream and tide data for flood prediction and monitoring.

## Features

- Real-time stream height data from USGS monitoring stations
- Tide level predictions and current conditions
- Flood threshold analysis and alerts
- Data visualization generation
- RESTful API endpoints for frontend consumption

## API Endpoints

### Stream Data
- `GET /api/waikane_stream` - Get Waikāne stream height data
- `GET /api/waiahole_stream` - Get Waiahole stream height data

### Tide Data
- `GET /api/waikane_tide_curve` - Gets Waikāne tide level data
- `GET /api/waikane_tides` - Gets Waikāne high and low tides data

### Health Check
- `GET /api/health` - Server health status

## Data Sources

- **USGS Water Services**: Real-time stream gauge data
- **NOAA Tides & Currents**: Tide predictions and observations
- **Local Monitoring**: Custom flood threshold configurations

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-backend-repo-url>
   cd waikane-backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the API server**
   ```bash
   python api.py
   ```

4. **Access the API**
   - Server runs on `http://localhost:5000`
   - API documentation available at endpoints above

## Data Files

### Stream Data
- `Waikane_Stream_Data.json` - Historical Waikāne stream data
- `Waiahole_Stream_Data.json` - Historical Waiahole stream data

### Tide Data
- `Waikane_Tide_Data.json` - High and Low Tide observations
- `Waikane_Tide_Curve.json` - Tide curve predictions
- `1612480_tide_predictions.csv` - NOAA tide predictions
- `Mokuoloe_tide_predictions.csv` - Local tide predictions

### Flood Thresholds
- `Flooding_Thresholds/Waikane_16294900_stream_flood_thresholds.csv`
- `Flooding_Thresholds/Waiahole_16294100_stream_flood_thresholds.csv`
- `Flooding_Thresholds/Mokuoloe-Waikane_tide_flood_thresholds.csv`
- `Flooding_Thresholds/Rain_Gauge_Thresholds_Waiahole.csv`

## Data Analysis

- `Waikane_Flood_Visuals.ipynb` - Jupyter notebook for data analysis and visualization
- `run_notebook.py` - Script to execute notebook programmatically

## Generated Outputs

- `stream.png` - Stream height visualizations
- `tides.png` - Tide level charts

## Configuration

The API server is configured to:
- Accept CORS requests from frontend applications
- Serve data in JSON format
- Handle real-time data fetching from external sources
- Process and filter data based on current conditions

## Development

To add new endpoints or modify data processing:

1. Edit `api.py` for new routes
2. Update data processing logic in the respective functions
3. Add new threshold files to `Flooding_Thresholds/` as needed
4. Test endpoints using tools like Postman or curl

## Deployment

For production deployment:

1. Set up environment variables for API keys if needed
2. Configure proper CORS settings for your domain
3. Set up process management (PM2, systemd, etc.)
4. Configure reverse proxy (nginx) if needed
5. Set up SSL certificates for HTTPS

## License

This project is developed for flood monitoring and public safety in the Waikāne area.
