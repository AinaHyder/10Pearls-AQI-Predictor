import pandas as pd
import numpy as np
from database import DatabaseManager
from feature_engineering import FeatureEngineer
from data_fetcher import DataFetcher
from datetime import datetime, timedelta

class Predictor:
    def __init__(self):
        self.db = DatabaseManager()
        self.fe = FeatureEngineer()
        self.fetcher = DataFetcher()

    def load_model(self, model_name='best_model'):
        """Load the best model"""
        model, metadata = self.db.get_model(model_name)
        if model is None:
            # Try to get the latest model
            # For simplicity, get random forest
            model, metadata = self.db.get_model('random_forest_v1')

        return model, metadata

    def predict_next_3_days(self):
        """Predict AQI for next 3 days"""
        # Get latest features
        latest_df = self.db.get_latest_features(hours=24)
        if latest_df.empty:
            raise ValueError("No recent data available for prediction")

        # Load model
        model, metadata = self.load_model()
        if model is None:
            raise ValueError("No trained model available")

        predictions = []
        current_time = datetime.now()

        # Get current weather forecast
        forecast_data = self.get_weather_forecast()

        for i in range(1, 4):  # Next 3 days
            pred_time = current_time + timedelta(days=i)

            # Use forecast data to create features
            # This is simplified; in practice, you'd need to properly integrate forecast
            pred_features = self.create_prediction_features(latest_df, forecast_data, i)

            # Make prediction
            if hasattr(model, 'predict'):
                pred = model.predict(pred_features.reshape(1, -1))[0]
            else:
                # For LSTM
                pred_features_reshaped = pred_features.reshape((1, 24, pred_features.shape[0] // 24))
                pred = model.predict(pred_features_reshaped).flatten()[0]

            predictions.append({
                'date': pred_time.date(),
                'predicted_aqi': max(0, pred),  # Ensure non-negative
                'category': self.get_aqi_category(pred)
            })

        return predictions

    def create_prediction_features(self, latest_df, forecast_data, day_offset):
        """Create features for prediction"""
        # This is a simplified version
        # In practice, you'd need to properly handle the feature engineering

        # Use the last available features as base
        base_features = latest_df.iloc[-1:].copy()

        # Update with forecast data (simplified)
        if day_offset <= len(forecast_data):
            forecast = forecast_data[day_offset - 1]
            base_features['temp'] = forecast.get('temp', base_features['temp'].iloc[0])
            base_features['humidity'] = forecast.get('humidity', base_features['humidity'].iloc[0])

        # Create features
        features_df = self.fe.create_features(base_features)

        # Prepare for model input
        feature_cols = [col for col in features_df.columns if col not in ['timestamp', 'aqi_category', 'aqi']]
        features = features_df[feature_cols].values.flatten()

        return features

    def get_weather_forecast(self):
        """Get weather forecast from OpenWeatherMap"""
        # This would need to be implemented properly
        # For now, return dummy data
        return [
            {'temp': 25, 'humidity': 60},
            {'temp': 26, 'humidity': 55},
            {'temp': 24, 'humidity': 65}
        ]

    def get_aqi_category(self, aqi):
        """Get AQI category"""
        if aqi <= 50:
            return 'Good'
        elif aqi <= 100:
            return 'Moderate'
        elif aqi <= 150:
            return 'Unhealthy for Sensitive Groups'
        elif aqi <= 200:
            return 'Unhealthy'
        elif aqi <= 300:
            return 'Very Unhealthy'
        else:
            return 'Hazardous'

    def get_current_aqi(self):
        """Get current AQI"""
        current_data = self.fetcher.get_current_data()
        return {
            'current_aqi': current_data['aqi'],
            'category': self.get_aqi_category(current_data['aqi']),
            'timestamp': current_data['timestamp']
        }