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
- **NO CSV FILES** - Data is fetched LIVE from APIs on each request
- **NO DATABASE** - This is a real-time dashboard
- **BACKEND API ROUTE** - `/app/api/weather/route.ts` handles all API calls
- **SECURE** - API keys stored in `.env.local` (never exposed to client)

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

### Step 1: Download & Extract
```bash
# Click three dots in v0 and select "Download ZIP"
# Extract the folder
cd weather-forecast-pro
```

### Step 2: Configure Environment Variables
Edit `.env.local` file (already created for you):

```env
NEXT_PUBLIC_KARACHI_LAT=24.8607
NEXT_PUBLIC_KARACHI_LON=67.0011

OPENWEATHER_API_KEY=YOUR_OPENWEATHER_KEY_HERE
AQICN_API_KEY=YOUR_AQICN_KEY_HERE
```

Replace with your actual API keys from Step 1.

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run the App
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Features

✅ **Manual Day Input** - Enter 1-16 days (not dropdown)
✅ **Karachi Only** - No city selector, locked to Karachi, Pakistan
✅ **Accurate Forecast** - Different temp/humidity/wind for each day
✅ **Real AQI Values** - PM2.5, PM10, NO₂, O₃ from live sensors
✅ **Live Charts** - Temperature, humidity, wind speed trends
✅ **Professional UI** - Slate, blue, and orange color scheme
✅ **Realistic Weather Icons** - SVG graphics (not animated)

## How It Works

1. **User enters days** (e.g., "3") → clicks "Update Forecast"
2. **Frontend sends request** → `/api/weather`
3. **Backend fetches** from OpenWeather + AQICN APIs
4. **Backend returns** weather + forecast + AQI data
5. **Frontend displays** charts and visualizations

## Troubleshooting

### "Missing API keys" error
- Add your API keys to `.env.local`
- Restart the server: `npm run dev`

### "Same data for every day"
- This is now fixed! API returns different data per day
- Each day has different: temp, humidity, wind speed

### "PM10, NO2, O3 showing 0"
- AQICN API returns 0 if sensor data unavailable
- Check https://aqicn.org/city/karachi/ for live data
- Your API key must be valid

### App not starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Commands

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm start        # Run production build
npm run lint     # Check code quality
```

## Important Notes

- **API calls happen on the server** (.env.local is never sent to browser)
- **5-day forecast limit** - OpenWeather free tier provides 5 days max
- **Real-time data** - Data updates when you click "Update Forecast"
- **Karachi coordinates** - Fixed to 24.8607°N, 67.0011°E
