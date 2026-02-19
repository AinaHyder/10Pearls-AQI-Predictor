import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from database import DatabaseManager


class MockDataGenerator:
    def __init__(self):
        self.db = DatabaseManager()

    def generate_karachi_mock_data(self, days=90):
        print(f"Generating {days} days of mock Karachi weather + AQI data...")

        end_time = datetime.now()
        start_time = end_time - timedelta(days=days)

        timestamps = pd.date_range(start=start_time, end=end_time, freq='H')

        data = []

        for ts in timestamps:
            # Simulate daily temperature cycle
            hour_factor = np.sin(2 * np.pi * ts.hour / 24)

            temp = 28 + 7 * hour_factor + np.random.normal(0, 1)
            humidity = 65 - 10 * hour_factor + np.random.normal(0, 3)
            wind_speed = np.random.uniform(3, 20)
            pressure = np.random.uniform(1005, 1015)

            # AQI depends on humidity + wind (less wind → worse AQI)
            aqi_base = 100 + (humidity * 0.3) - (wind_speed * 1.5)
            pollution_spike = np.random.choice([0, 20, 40], p=[0.8, 0.15, 0.05])
            aqi = max(40, min(250, aqi_base + pollution_spike))

            record = {
                'timestamp': ts,
                'temp': round(temp, 2),
                'humidity': round(humidity, 2),
                'pressure': round(pressure, 2),
                'wind_speed': round(wind_speed, 2),
                'wind_deg': np.random.uniform(0, 360),
                'weather_main': 'Clear',
                'weather_description': 'clear sky',
                'aqi': round(aqi, 2),
                'pm25': aqi * 0.6,
                'pm10': aqi * 0.8,
                'o3': np.random.uniform(10, 50),
                'no2': np.random.uniform(10, 60),
                'so2': np.random.uniform(5, 25),
                'co': np.random.uniform(0.5, 2.0)
            }

            data.append(record)

        df = pd.DataFrame(data)

        print(f"Generated {len(df)} rows.")

        self.db.store_features(df)

        print("Mock data stored successfully in MongoDB.")
