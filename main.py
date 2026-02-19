#!/usr/bin/env python3
"""
AQI Prediction Dashboard - Main Entry Point
Complete system for AQI prediction with ML models,
feature engineering, and web dashboard
"""

import argparse
import sys


def main():
    parser = argparse.ArgumentParser(description="AQI Prediction Dashboard")

    parser.add_argument(
        "--mode",
        choices=["api", "scheduler", "train", "backfill", "analytics", "mock"],
        default="api",
        help="Mode to run the system"
    )

    parser.add_argument(
        "--days",
        type=int,
        default=30,
        help="Number of days for mock generation or analytics"
    )

    args = parser.parse_args()

    # --------------------------------------------------
    # API MODE
    # --------------------------------------------------
    if args.mode == "api":
        print("🚀 Starting FastAPI server...")
        from app import app
        import uvicorn

        uvicorn.run(app, host="0.0.0.0", port=8000)

    # --------------------------------------------------
    # SCHEDULER MODE
    # --------------------------------------------------
    elif args.mode == "scheduler":
        print("⏰ Starting automated scheduler...")
        from scheduler import Scheduler

        scheduler = Scheduler()
        scheduler.start_scheduler()

    # --------------------------------------------------
    # TRAIN MODE
    # --------------------------------------------------
    elif args.mode == "train":
        print("🤖 Training models...")
        from model_training import ModelTrainer

        trainer = ModelTrainer()
        trainer.train_all_models()

    # --------------------------------------------------
    # BACKFILL MODE (REAL API)
    # --------------------------------------------------
    elif args.mode == "backfill":
        print("📦 Running backfill using API data...")

        from model_training import ModelTrainer

        trainer = ModelTrainer()
        trainer.backfill_historical_data()

    # --------------------------------------------------
    # MOCK DATA MODE (BEST FOR TRAINING)
    # --------------------------------------------------
    elif args.mode == "mock":
        print(f"🧪 Generating {args.days} days of Karachi mock data...")

        from mock_data_generator import MockDataGenerator

        generator = MockDataGenerator()
        generator.generate_karachi_mock_data(days=args.days)

        print("✅ Mock dataset generation complete.")

    # --------------------------------------------------
    # ANALYTICS MODE
    # --------------------------------------------------
    elif args.mode == "analytics":
        print("📊 Running analytics...")
        from analytics import Analytics

        analytics = Analytics()
        analytics.perform_eda(days=args.days)

    else:
        print("❌ Invalid mode. Use --help for options.")
        sys.exit(1)


if __name__ == "__main__":
    main()
