# AQI Prediction Dashboard - Complete Setup Guide

## Data Source & Storage

### WHERE DATA COMES FROM:
1. **OpenWeather API** - Current weather & 5-day forecast
   - Real-time temperature, humidity, wind speed, conditions
   - Different data for each day (not repeated)
   - Source: https://api.openweathermap.org

2. **AQICN API** - Air Quality Index & Pollutant Data
   - Real-time PM2.5, PM10, NO₂, O₃ measurements
   - Sourced from Karachi monitoring stations
   - Source: https://api.waqi.info

### WHERE DATA IS STORED:
- **MongoDB** - Processed features and trained models
- **Real-time API calls** - Current weather and AQI data
- **Python Backend** - FastAPI server handles ML predictions
- **Next.js Frontend** - React dashboard with visualizations

### HOW TO GET API KEYS:

#### 1. OpenWeather API Key (Free)
```
1. Go to: https://openweathermap.org/api
2. Sign up for free account
3. Create API key (5-day forecast is free)
4. Copy the key to .env.local as OPENWEATHER_API_KEY
```

#### 2. AQICN API Key (Free)
```
1. Go to: https://aqicn.org/api/
2. Sign up for free account
3. Get your token/API key
4. Copy the key to .env.local as AQICN_API_KEY
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB
- API keys for OpenWeatherMap and AQICN

### Step 1: Download & Extract
```bash
# Click three dots in v0 and select "Download ZIP"
# Extract the folder
cd aqi-prediction-dashboard
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Install Node.js Dependencies
```bash
npm install
```

### Step 4: Configure Environment Variables
Edit `.env.local` file:
```env
NEXT_PUBLIC_KARACHI_LAT=24.8607
NEXT_PUBLIC_KARACHI_LON=67.0011

OPENWEATHER_API_KEY=YOUR_OPENWEATHER_KEY_HERE
AQICN_API_KEY=YOUR_AQICN_KEY_HERE
MONGO_URI=mongodb://localhost:27017/
PYTHON_API_BASE=http://localhost:8000
```

### Step 5: Start MongoDB
Make sure MongoDB is running on your system.

### Step 6: Backfill Historical Data
```bash
python main.py --mode backfill --days 30
```

### Step 7: Train Machine Learning Models
```bash
python main.py --mode train
```

### Step 8: Start Python API Server
```bash
python main.py --mode api
```

### Step 9: Start Next.js Frontend
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Features

✅ **Machine Learning Predictions** - AQI forecast for next 3 days
✅ **Multiple ML Models** - Random Forest, XGBoost, LSTM, etc.
✅ **Real-time Dashboard** - Current AQI with predictions
✅ **Advanced Analytics** - EDA, SHAP explanations, alerts
✅ **Automated Pipelines** - Hourly feature updates, daily training
✅ **MongoDB Storage** - Feature store and model registry
✅ **Professional UI** - Modern React dashboard with charts

## How It Works

1. **Data Collection**: Python scripts fetch weather and AQI data from APIs
2. **Feature Engineering**: Create time-based and derived features
3. **Model Training**: Train multiple ML models on historical data
4. **Predictions**: Use trained models to predict future AQI
5. **Dashboard**: Next.js frontend displays real-time data and predictions
6. **Automation**: Scheduler runs feature pipeline hourly, training daily

## API Endpoints

- `GET /api/current-aqi` - Current AQI data
- `GET /api/predictions` - AQI predictions for next 3 days
- `GET /api/alerts` - Health alerts based on AQI levels
- `POST /api/train-models` - Trigger model retraining
- `GET /api/analytics/plots` - Generate EDA visualizations

## Commands

```bash
# Python Backend
python main.py --mode api          # Start FastAPI server
python main.py --mode train        # Train ML models
python main.py --mode backfill     # Backfill historical data
python main.py --mode analytics    # Run EDA analysis
python main.py --mode scheduler    # Start automated pipelines

# Frontend
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm start        # Run production build
npm run lint     # Check code quality
```

## Troubleshooting

### "Missing API keys" error
- Add your API keys to `.env.local`
- Restart both Python and Node servers

### "No training data" error
- Run backfill first: `python main.py --mode backfill --days 30`
- Ensure MongoDB is running

### "Model not found" error
- Train models first: `python main.py --mode train`
- Check MongoDB for stored models

### App not starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install -r requirements.txt --force-reinstall
```

## Important Notes

- **API calls happen on the server** (.env.local is never sent to browser)
- **MongoDB required** - For storing features and models
- **Real-time predictions** - ML models predict next 3 days AQI
- **Automated updates** - Feature pipeline runs hourly, training daily
- **Karachi coordinates** - Fixed to 24.8607°N, 67.0011°E