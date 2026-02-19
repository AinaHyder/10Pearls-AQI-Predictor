import schedule
import time
from datetime import datetime, timedelta
from data_fetcher import DataFetcher
from feature_engineering import FeatureEngineer
from database import DatabaseManager
from model_training import ModelTrainer

class Scheduler:
    def __init__(self):
        self.fetcher = DataFetcher()
        self.fe = FeatureEngineer()
        self.db = DatabaseManager()
        self.trainer = ModelTrainer()

    def hourly_feature_pipeline(self):
        """Run feature pipeline every hour"""
        try:
            print(f"Running hourly feature pipeline at {datetime.now()}")

            # Fetch current data
            current_data = self.fetcher.get_current_data()
            df = pd.DataFrame([current_data])

            # Create features
            features_df = self.fe.create_features(df)

            # Store in database
            self.db.store_features(features_df)

            print("Hourly feature pipeline completed")

        except Exception as e:
            print(f"Error in hourly pipeline: {e}")

    def daily_training_pipeline(self):
        """Run training pipeline daily"""
        try:
            print(f"Running daily training pipeline at {datetime.now()}")

            # Train models
            self.trainer.train_all_models()

            print("Daily training pipeline completed")

        except Exception as e:
            print(f"Error in daily training pipeline: {e}")

    def backfill_pipeline(self):
        """Run backfill pipeline (one-time or periodic)"""
        try:
            print("Running backfill pipeline")

            # Backfill last 30 days
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)

            self.trainer.backfill_historical_data(start_date, end_date)

            print("Backfill pipeline completed")

        except Exception as e:
            print(f"Error in backfill pipeline: {e}")

    def start_scheduler(self):
        """Start the automated scheduler"""
        # Run feature pipeline every hour
        schedule.every().hour.do(self.hourly_feature_pipeline)

        # Run training pipeline daily at 2 AM
        schedule.every().day.at("02:00").do(self.daily_training_pipeline)

        print("Scheduler started. Press Ctrl+C to stop.")

        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

if __name__ == "__main__":
    import pandas as pd  # Import here to avoid circular imports

    scheduler = Scheduler()

    # Run initial backfill
    scheduler.backfill_pipeline()

    # Start scheduler
    scheduler.start_scheduler()