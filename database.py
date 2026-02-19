from pymongo import MongoClient
from config import MONGO_URI, DATABASE_NAME, FEATURE_STORE_COLLECTION, MODEL_REGISTRY_COLLECTION
import pickle
import pandas as pd
from datetime import datetime


class DatabaseManager:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DATABASE_NAME]
        self.features_collection = self.db[FEATURE_STORE_COLLECTION]
        self.models_collection = self.db[MODEL_REGISTRY_COLLECTION]

    # =========================
    # FEATURE STORAGE
    # =========================

    def store_features(self, features_df):
        """Store processed features in MongoDB"""
        if features_df.empty:
            print("No features to store.")
            return

        records = features_df.to_dict('records')

        # Ensure timestamps are datetime objects
        for record in records:
            if isinstance(record.get('timestamp'), str):
                record['timestamp'] = datetime.fromisoformat(record['timestamp'])

        self.features_collection.insert_many(records)
        print(f"Stored {len(records)} feature records")

    def get_features(self, start_date=None, end_date=None, limit=None):
        """Retrieve features from MongoDB"""
        query = {}

        if start_date and end_date:
            query['timestamp'] = {'$gte': start_date, '$lte': end_date}

        cursor = self.features_collection.find(query).sort('timestamp', 1)

        if limit:
            cursor = cursor.limit(limit)

        df = pd.DataFrame(list(cursor))

        if df.empty:
            return df

        # 🔥 DROP MongoDB ObjectId column (IMPORTANT FIX)
        if "_id" in df.columns:
            df.drop(columns=["_id"], inplace=True)

        # Ensure timestamp is datetime
        if "timestamp" in df.columns:
            df["timestamp"] = pd.to_datetime(df["timestamp"])

        return df

    # =========================
    # MODEL STORAGE
    # =========================

    def store_model(self, model_name, model, metadata):
        """Store trained model in MongoDB"""
        model_data = pickle.dumps(model)

        document = {
            'name': model_name,
            'model': model_data,
            'metadata': metadata,
            'created_at': datetime.now(),
            'version': metadata.get('version', 1)
        }

        self.models_collection.insert_one(document)
        print(f"Stored model: {model_name}")

    def get_model(self, model_name, version=None):
        """Retrieve model from MongoDB"""
        query = {'name': model_name}

        if version:
            query['version'] = version

        document = self.models_collection.find_one(
            query,
            sort=[('created_at', -1)]
        )

        if document:
            model = pickle.loads(document['model'])
            return model, document['metadata']

        return None, None

    # =========================
    # TRAINING HELPERS
    # =========================

    def get_latest_features(self, hours=24):
        """Get latest features for prediction"""
        end_date = datetime.now()
        start_date = end_date - pd.Timedelta(hours=hours)

        return self.get_features(start_date, end_date)

    def get_training_data(self, days=30):
        """Get training data for model training"""
        end_date = datetime.now()
        start_date = end_date - pd.Timedelta(days=days)

        df = self.get_features(start_date, end_date)

        # Safety: ensure no ObjectId column sneaks in
        if "_id" in df.columns:
            df.drop(columns=["_id"], inplace=True)

        return df
