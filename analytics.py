import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import shap
import lime
import lime.lime_tabular
from database import DatabaseManager
from prediction import Predictor
import numpy as np

class Analytics:
    def __init__(self):
        self.db = DatabaseManager()
        self.predictor = Predictor()

    def perform_eda(self, days=30):
        """Perform Exploratory Data Analysis"""
        df = self.db.get_training_data(days)

        if df.empty:
            print("No data available for EDA")
            return

        # Basic statistics
        print("Basic Statistics:")
        print(df.describe())

        # Correlation heatmap
        self.plot_correlation_heatmap(df)

        # Time series plots
        self.plot_time_series(df)

        # AQI distribution
        self.plot_aqi_distribution(df)

        # Feature importance (if model available)
        self.plot_feature_importance()

    def plot_correlation_heatmap(self, df):
        """Plot correlation heatmap"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        corr_matrix = df[numeric_cols].corr()

        plt.figure(figsize=(12, 8))
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0)
        plt.title('Correlation Heatmap')
        plt.tight_layout()
        plt.savefig('correlation_heatmap.png')
        plt.close()

    def plot_time_series(self, df):
        """Plot time series of AQI and key pollutants"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))

        # AQI over time
        axes[0, 0].plot(df['timestamp'], df['aqi'], color='red')
        axes[0, 0].set_title('AQI Over Time')
        axes[0, 0].set_xlabel('Date')
        axes[0, 0].set_ylabel('AQI')

        # Temperature over time
        axes[0, 1].plot(df['timestamp'], df['temp'], color='blue')
        axes[0, 1].set_title('Temperature Over Time')
        axes[0, 1].set_xlabel('Date')
        axes[0, 1].set_ylabel('Temperature (°C)')

        # PM2.5 over time
        if 'pm25' in df.columns:
            axes[1, 0].plot(df['timestamp'], df['pm25'], color='green')
            axes[1, 0].set_title('PM2.5 Over Time')
            axes[1, 0].set_xlabel('Date')
            axes[1, 0].set_ylabel('PM2.5')

        # Humidity over time
        axes[1, 1].plot(df['timestamp'], df['humidity'], color='orange')
        axes[1, 1].set_title('Humidity Over Time')
        axes[1, 1].set_xlabel('Date')
        axes[1, 1].set_ylabel('Humidity (%)')

        plt.tight_layout()
        plt.savefig('time_series_plots.png')
        plt.close()

    def plot_aqi_distribution(self, df):
        """Plot AQI distribution"""
        plt.figure(figsize=(10, 6))
        sns.histplot(df['aqi'], bins=30, kde=True)
        plt.title('AQI Distribution')
        plt.xlabel('AQI')
        plt.ylabel('Frequency')
        plt.axvline(x=50, color='green', linestyle='--', label='Good')
        plt.axvline(x=100, color='yellow', linestyle='--', label='Moderate')
        plt.axvline(x=150, color='orange', linestyle='--', label='Unhealthy for Sensitive')
        plt.axvline(x=200, color='red', linestyle='--', label='Unhealthy')
        plt.legend()
        plt.tight_layout()
        plt.savefig('aqi_distribution.png')
        plt.close()

    def plot_feature_importance(self):
        """Plot feature importance using SHAP"""
        model, metadata = self.predictor.load_model()
        if model is None:
            print("No model available for feature importance")
            return

        # Get some sample data
        df = self.db.get_training_data(days=7)
        if df.empty:
            return

        from feature_engineering import FeatureEngineer
        fe = FeatureEngineer()
        df = fe.create_features(df)
        feature_cols = metadata.get('feature_columns', [])

        if not feature_cols:
            return

        # Prepare sample data
        X = df[feature_cols].values

        # For tree-based models
        if hasattr(model, 'feature_importances_'):
            # Traditional feature importance
            importances = model.feature_importances_
            indices = np.argsort(importances)[::-1]

            plt.figure(figsize=(10, 6))
            plt.title('Feature Importances')
            plt.bar(range(len(feature_cols)), importances[indices])
            plt.xticks(range(len(feature_cols)), [feature_cols[i] for i in indices], rotation=90)
            plt.tight_layout()
            plt.savefig('feature_importance.png')
            plt.close()

        # SHAP values
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X[:100])  # Sample

            plt.figure()
            shap.summary_plot(shap_values, X[:100], feature_names=feature_cols, show=False)
            plt.savefig('shap_summary.png')
            plt.close()
        except Exception as e:
            print(f"SHAP analysis failed: {e}")

    def explain_prediction(self, prediction_data):
        """Explain a specific prediction using LIME"""
        model, metadata = self.predictor.load_model()
        if model is None:
            return None

        # Get training data for LIME
        df = self.db.get_training_data(days=7)
        from feature_engineering import FeatureEngineer
        fe = FeatureEngineer()
        df = fe.create_features(df)
        feature_cols = metadata.get('feature_columns', [])

        X = df[feature_cols].values

        try:
            explainer = lime.lime_tabular.LimeTabularExplainer(
                X, feature_names=feature_cols, mode='regression'
            )

            exp = explainer.explain_instance(
                prediction_data, model.predict, num_features=10
            )

            return exp.as_list()
        except Exception as e:
            print(f"LIME explanation failed: {e}")
            return None

    def check_alerts(self, current_aqi):
        """Check if AQI requires alerts"""
        alerts = []

        if current_aqi > 300:
            alerts.append("HAZARDOUS: Health alert - everyone may experience serious health effects")
        elif current_aqi > 200:
            alerts.append("VERY UNHEALTHY: Health alert - general public will be noticeably affected")
        elif current_aqi > 150:
            alerts.append("UNHEALTHY: Some members of the general public may experience health effects")
        elif current_aqi > 100:
            alerts.append("MODERATE: Air quality is acceptable; however, there may be a risk for some people")
        else:
            alerts.append("GOOD: Air quality is satisfactory")

        return alerts