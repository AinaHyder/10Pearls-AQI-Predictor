import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

class FeatureEngineer:
    def __init__(self):
        self.scaler = StandardScaler()

    # --------------------------------------------------
    # CREATE FEATURES
    # --------------------------------------------------
    def create_features(self, df):
        """Create features from raw data"""
        df = df.copy()

        # Ensure timestamp is datetime
        if not np.issubdtype(df['timestamp'].dtype, np.datetime64):
            df['timestamp'] = pd.to_datetime(df['timestamp'])

        # Time-based features
        df['hour'] = df['timestamp'].dt.hour
        df['day'] = df['timestamp'].dt.day
        df['month'] = df['timestamp'].dt.month
        df['weekday'] = df['timestamp'].dt.weekday
        df['is_weekend'] = df['weekday'].isin([5, 6]).astype(int)

        # Cyclic encoding for time features
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)

        # Rolling statistics for pollutants
        pollutant_cols = ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co', 'aqi']
        for col in pollutant_cols:
            if col in df.columns:
                df[f'{col}_lag_1'] = df[col].shift(1)
                df[f'{col}_lag_24'] = df[col].shift(24)
                df[f'{col}_rolling_mean_24'] = df[col].rolling(window=24).mean()
                df[f'{col}_rolling_std_24'] = df[col].rolling(window=24).std()
                df[f'{col}_change_rate'] = df[col].diff()

        # Weather interaction features
        df['temp_humidity_interaction'] = df['temp'] * df['humidity']
        df['wind_temp_interaction'] = df['wind_speed'] * df['temp']

        # AQI categories
        df['aqi_category'] = pd.cut(df['aqi'],
                                   bins=[0, 50, 100, 150, 200, 300, np.inf],
                                   labels=['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'])

        # One-hot encode weather strings (optional, numeric only will work too)
        for col in ['weather_main', 'weather_description']:
            if col in df.columns:
                df = pd.get_dummies(df, columns=[col], prefix=col)

        # Fill NaN values
        df = df.ffill().bfill()

        return df

    # --------------------------------------------------
    # PREPARE TRAINING DATA
    # --------------------------------------------------
    def prepare_training_data(self, df, target_col='aqi', lookback=24):
        """Prepare data for model training with lookback window"""
        features = []
        targets = []

        # Use numeric columns only
        feature_cols = [col for col in df.select_dtypes(include=[np.number]).columns if col != target_col]

        if len(df) < lookback + 1:
            raise ValueError("Not enough data to create training sequences.")

        for i in range(lookback, len(df)):
            features.append(df[feature_cols].iloc[i-lookback:i].values.flatten())
            targets.append(df[target_col].iloc[i])

        X = np.array(features, dtype=np.float32)
        y = np.array(targets, dtype=np.float32)

        return X, y, feature_cols

    # --------------------------------------------------
    # SCALE FEATURES
    # --------------------------------------------------
    def scale_features(self, X_train, X_test=None):
        """Scale features using StandardScaler"""
        X_train_scaled = self.scaler.fit_transform(X_train)

        if X_test is not None:
            X_test_scaled = self.scaler.transform(X_test)
            return X_train_scaled, X_test_scaled

        return X_train_scaled
