from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prediction import Predictor
from analytics import Analytics
from data_fetcher import DataFetcher
from model_training import ModelTrainer
from datetime import datetime, timedelta
import uvicorn

app = FastAPI(title="AQI Prediction API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = Predictor()
analytics = Analytics()
fetcher = DataFetcher()
trainer = ModelTrainer()

@app.get("/")
def read_root():
    return {"message": "AQI Prediction API"}

@app.get("/api/current-aqi")
def get_current_aqi():
    """Get current AQI data"""
    try:
        current_data = predictor.get_current_aqi()
        return current_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predictions")
def get_predictions():
    """Get AQI predictions for next 3 days"""
    try:
        predictions = predictor.predict_next_3_days()
        return {"predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/plots")
def get_analytics_plots():
    """Generate and return analytics plots"""
    try:
        analytics.perform_eda()
        return {"message": "Analytics plots generated", "plots": ["correlation_heatmap.png", "time_series_plots.png", "aqi_distribution.png", "feature_importance.png", "shap_summary.png"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/alerts")
def get_alerts():
    """Get current alerts based on AQI"""
    try:
        current_data = predictor.get_current_aqi()
        alerts = analytics.check_alerts(current_data['current_aqi'])
        return {"alerts": alerts, "current_aqi": current_data['current_aqi']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/train-models")
def train_models():
    """Trigger model training"""
    try:
        trainer.train_all_models()
        return {"message": "Model training completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backfill-data")
def backfill_data(start_date: str, end_date: str):
    """Backfill historical data"""
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
        trainer.backfill_historical_data(start, end)
        return {"message": "Data backfill completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/feature-importance")
def get_feature_importance():
    """Get feature importance explanation"""
    try:
        # This would need actual prediction data
        # For now, return placeholder
        return {"message": "Feature importance analysis available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)