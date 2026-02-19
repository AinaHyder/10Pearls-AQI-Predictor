import requests
import pandas as pd
from datetime import datetime
from config import OPENWEATHER_API_KEY, AQICN_API_KEY, LAT, LON, CITY


class DataFetcher:
    def __init__(self):
        self.openweather_base = "https://api.openweathermap.org/data/2.5"
        self.aqicn_base = "https://api.waqi.info"

    # --------------------------------------------------
    # CURRENT WEATHER (FREE)
    # --------------------------------------------------
    def fetch_weather_data(self):
        url = f"{self.openweather_base}/weather"
        params = {
            'lat': LAT,
            'lon': LON,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }

        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()

    # --------------------------------------------------
    # 5-DAY FORECAST (FREE)
    # --------------------------------------------------
    def fetch_forecast_data(self):
        url = f"{self.openweather_base}/forecast"
        params = {
            'lat': LAT,
            'lon': LON,
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }

        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()

    # --------------------------------------------------
    # CURRENT AQI
    # --------------------------------------------------
    def fetch_aqi_data(self):
        url = f"{self.aqicn_base}/feed/{CITY}/"
        params = {
            'token': AQICN_API_KEY
        }

        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()

    # --------------------------------------------------
    # SIMULATED HISTORICAL (using forecast)
    # --------------------------------------------------
    def get_historical_weather(self):
        forecast = self.fetch_forecast_data()

        data = []

        for item in forecast['list']:
            record = {
                'timestamp': datetime.fromtimestamp(item['dt']),
                'temp': item['main']['temp'],
                'humidity': item['main']['humidity'],
                'pressure': item['main']['pressure'],
                'wind_speed': item['wind']['speed'],
                'wind_deg': item['wind']['deg'],
                'weather_main': item['weather'][0]['main'],
                'weather_description': item['weather'][0]['description']
            }
            data.append(record)

        return pd.DataFrame(data)

    # --------------------------------------------------
    # CURRENT COMBINED DATA
    # --------------------------------------------------
    def get_current_data(self):
        weather = self.fetch_weather_data()
        aqi = self.fetch_aqi_data()

        current_data = {
            'timestamp': datetime.now(),
            'temp': weather['main']['temp'],
            'humidity': weather['main']['humidity'],
            'pressure': weather['main']['pressure'],
            'wind_speed': weather['wind']['speed'],
            'wind_deg': weather['wind']['deg'],
            'weather_main': weather['weather'][0]['main'],
            'weather_description': weather['weather'][0]['description'],
            'aqi': aqi['data']['aqi'],
            'pm25': aqi['data']['iaqi'].get('pm25', {}).get('v'),
            'pm10': aqi['data']['iaqi'].get('pm10', {}).get('v'),
            'o3': aqi['data']['iaqi'].get('o3', {}).get('v'),
            'no2': aqi['data']['iaqi'].get('no2', {}).get('v'),
            'so2': aqi['data']['iaqi'].get('so2', {}).get('v'),
            'co': aqi['data']['iaqi'].get('co', {}).get('v')
        }

        return current_data
