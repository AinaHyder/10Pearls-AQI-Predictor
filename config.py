import os
from dotenv import load_dotenv

# Explicitly load .env.local first
load_dotenv(dotenv_path=".env.local")

# Fallback: also try loading .env if it exists
load_dotenv()

# -------------------------
# API Keys
# -------------------------
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
AQICN_API_KEY = os.getenv("AQICN_API_KEY")

# Validate required keys
if not OPENWEATHER_API_KEY:
    raise ValueError("OPENWEATHER_API_KEY not found in environment variables")

if not AQICN_API_KEY:
    raise ValueError("AQICN_API_KEY not found in environment variables")

# -------------------------
# MongoDB Configuration
# -------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "aqi_prediction"

# -------------------------
# Location Configuration
# -------------------------
LAT = float(os.getenv("NEXT_PUBLIC_KARACHI_LAT", 24.8607))
LON = float(os.getenv("NEXT_PUBLIC_KARACHI_LON", 67.0011))
CITY = "Karachi"

# -------------------------
# Model / Collections
# -------------------------
MODEL_DIR = "models/"
FEATURE_STORE_COLLECTION = "features"
MODEL_REGISTRY_COLLECTION = "models"
