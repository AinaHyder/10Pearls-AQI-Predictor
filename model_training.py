import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb
from database import DatabaseManager
from feature_engineering import FeatureEngineer
from datetime import datetime

class ModelTrainer:
    def __init__(self):
        self.db = DatabaseManager()
        self.fe = FeatureEngineer()

    # --------------------------------------------------
    # PREPARE DATA
    # --------------------------------------------------
    def prepare_data(self, days=30):
        df = self.db.get_training_data(days)

        if df.empty:
            raise ValueError("No training data available. Run backfill first.")

        df = self.fe.create_features(df)
        X, y, feature_cols = self.fe.prepare_training_data(df)

        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        X_train_scaled, X_test_scaled = self.fe.scale_features(X_train, X_test)

        return X_train_scaled, X_test_scaled, y_train, y_test, feature_cols

    # --------------------------------------------------
    # MODELS
    # --------------------------------------------------
    def train_random_forest(self, X_train, y_train):
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        return model

    def train_ridge(self, X_train, y_train):
        model = Ridge(alpha=1.0)
        model.fit(X_train, y_train)
        return model

    def train_xgboost(self, X_train, y_train):
        model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        model.fit(X_train, y_train)
        return model

    def train_lightgbm(self, X_train, y_train):
        model = lgb.LGBMRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        model.fit(X_train, y_train)
        return model

    # --------------------------------------------------
    # EVALUATION
    # --------------------------------------------------
    def evaluate_model(self, model, X_test, y_test, model_name):
        y_pred = model.predict(X_test)

        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        mae = float(mean_absolute_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))

        print(f"{model_name} → RMSE: {rmse:.2f}, MAE: {mae:.2f}, R²: {r2:.2f}")

        return {'rmse': rmse, 'mae': mae, 'r2': r2}

    # --------------------------------------------------
    # TRAIN ALL MODELS
    # --------------------------------------------------
    def train_all_models(self):
        try:
            X_train, X_test, y_train, y_test, feature_cols = self.prepare_data()

            models = {
                "random_forest": self.train_random_forest,
                "ridge": self.train_ridge,
                "xgboost": self.train_xgboost,
                "lightgbm": self.train_lightgbm
            }

            best_model = None
            best_score = float("inf")
            best_name = None

            for name, trainer in models.items():
                print(f"Training {name}...")
                model = trainer(X_train, y_train)
                metrics = self.evaluate_model(model, X_test, y_test, name)

                if metrics['rmse'] < best_score:
                    best_score = metrics['rmse']
                    best_model = model
                    best_name = name

                # Convert numpy types to float for MongoDB
                safe_metrics = {k: float(v) for k, v in metrics.items()}

                metadata = {
                    "metrics": safe_metrics,
                    "feature_columns": feature_cols,
                    "training_date": datetime.now(),
                    "version": 1
                }

                self.db.store_model(f"{name}_v1", model, metadata)

            print(f"\n✅ Best model: {best_name} (RMSE: {best_score:.2f})")

        except Exception as e:
            print(f"Error training models: {e}")

    # --------------------------------------------------
    # BACKFILL (FREE TIER SAFE)
    # --------------------------------------------------
    def backfill_historical_data(self, start_date=None, end_date=None):
        from data_fetcher import DataFetcher

        fetcher = DataFetcher()

        try:
            print("📦 Fetching forecast data (free tier)...")

            weather_df = fetcher.get_historical_weather()

            if weather_df.empty:
                print("No data fetched.")
                return

            # Simulated AQI (since free tier has no historical AQI)
            weather_df['aqi'] = np.random.randint(40, 160, len(weather_df))

            # Only keep numeric columns for training
            numeric_cols = weather_df.select_dtypes(include=[np.number]).columns.tolist()
            features_df = self.fe.create_features(weather_df[numeric_cols + ['timestamp']])

            self.db.store_features(features_df)

            print("✅ Backfill complete (using forecast data).")

        except Exception as e:
            print(f"Error during backfill: {e}")
