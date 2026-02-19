PROJECT SUMMARY — AQI Prediction Dashboard
=========================================

Problem statement
-----------------
Urban air quality affects health and planning. This project builds an automated pipeline that ingests weather and pollutant measurements, engineers time- and history-aware features, trains multiple forecasting models, stores trained models, and serves real-time 3-day AQI forecasts via a web dashboard.

High-level architecture
-----------------------
- Data sources: OpenWeatherMap (weather) and AQICN (AQI/pollutants)
- Feature pipeline: data fetch → cleaning → feature engineering → feature store (MongoDB in this implementation)
- Training pipeline: read historical features → model experiments → evaluation → model registry (MongoDB)
- Serving: FastAPI exposes endpoints used by Next.js frontend; scheduler runs hourly feature updates and daily training

ASCII diagram
-------------

  [OpenWeather / AQICN] ---> [Data Fetcher] ---> [Feature Eng.] ---> [MongoDB Feature Store]
                                              |                     |
                                              v                     v
                                       [Scheduler hourly]    [Model Registry (MongoDB)]
                                              |                     |
                                              v                     v
                                         [Trainer daily] ---> [Best Model saved]
                                                              |
                                                              v
                                                       [FastAPI Prediction API] ---> [Next.js / React Dashboard]

Data sources & API keys
-----------------------
- OpenWeatherMap: current weather + 5-day forecast. ENV key: `OPENWEATHER_API_KEY`.
- AQICN (waqi.info): real-time AQI and pollutant iaqi values. ENV key: `AQICN_API_KEY`.
- Note: free tiers may restrict historical/time-machine or extensive historical pollutant data; historical AQI often not available free — see Limitations.

Where data is stored (this implementation)
-----------------------------------------
- MongoDB used as both feature store and model registry (collections: `features`, `models`).
- Models serialized with `pickle` and stored with metadata (metrics, feature list, timestamp, version).

Feature pipeline & EDA
----------------------
- Fetching: `data_fetcher.py` calls OpenWeather (current + forecast or timemachine for historical where available) and AQICN for current AQI.
- EDA artifacts: correlation heatmaps, time series plots, distribution plots created by `analytics.py`.
- Typical EDA checks: missingness over time, seasonal trends (hour/day/month), pollutant vs AQI correlations, autocorrelation.

Feature engineering (key features)
----------------------------------
- Time features: `hour`, `day`, `month`, `weekday`, `is_weekend`.
- Cyclic encodings: `hour_sin`, `hour_cos`, `month_sin`, `month_cos`.
- Lags & rolling stats: `pm25_lag_1`, `pm25_lag_24`, `pm25_rolling_mean_24`, `pm25_rolling_std_24`, same for other pollutants and `aqi`.
- Change rates: `aqi_change_rate` and pollutant diffs.
- Weather interactions: `temp_humidity_interaction`, `wind_temp_interaction`.
- Categorical: binned `aqi_category`.

Modeling & training
-------------------
Models implemented:
- Random Forest (sklearn)
- Ridge Regression (sklearn)
- XGBoost (xgboost)
- LightGBM (lightgbm)
- LSTM (TensorFlow/Keras) for sequence modeling

Why these models?
- Random Forest: robust baseline, handles nonlinearities, interpretable via feature importances.
- Ridge: fast linear baseline, useful if relationship is mostly linear.
- XGBoost / LightGBM: gradient-boosted trees usually provide strong tabular performance and handle missingness and heterogeneity well.
- LSTM: sequence-aware model that can exploit temporal patterns and multivariate sequences.

Evaluation metrics
------------------
- RMSE (root mean squared error): penalizes large errors.
- MAE (mean absolute error): robust to outliers.
- R²: overall explained variance. Use these to compare models on hold-out time-ordered split.

Model selection guidance (short)
-------------------------------
- For tabular meteorology + pollutant features, tree-based models (XGBoost/LightGBM) often yield best accuracy and training speed.
- Random Forest is a strong, simpler alternative when tuning resources are limited.
- LSTM may help when long sequential patterns matter, but needs more data and compute; sensitive to scaling.
- Recommendation: start with LightGBM/XGBoost; use Random Forest as a sanity check; try LSTM if you have abundant sequential labeled data.

Explainability & Alerts
-----------------------
- SHAP used for global and local feature importance plots (tree explainers for tree models).
- LIME used for single-instance explanations.
- Alerts: category thresholds emit warnings (Moderate/Unhealthy/Very Unhealthy/Hazardous); integrates into API and dashboard.

CI/CD and automation
--------------------
- Scheduler: in-repo scheduler (schedule/apscheduler) performs hourly feature ingestion and daily model retraining.
- CI: GitHub Actions workflow included — installs deps, runs simple import checks, spins up MongoDB service on runners, optionally triggers training on schedule.
- Alternative production-grade orchestration: Apache Airflow (recommended for complex pipelines) or Cloud-managed schedulers.

Frontend & serving
------------------
- FastAPI serves the prediction endpoints (`/api/current-aqi`, `/api/predictions`, `/api/alerts`, `/api/analytics/plots`).
- Next.js React frontend consumes these endpoints; visualizations (charts, heatmaps) are provided via the frontend components. The repo includes a Next.js app configured to call the Python backend via `PYTHON_API_BASE`.
- Alternative dashboards: Streamlit or Gradio can be used for quick interactive prototypes; a Flask server is also possible for simpler deployments.

Limitations & hardships encountered
----------------------------------
- Historical pollutant & AQI data is often limited on free tiers:
  - OpenWeather's timemachine endpoint may have restrictions and limited lookback days.
  - AQICN provides current station data but historical granular pollutant time series are not always available for free — obtaining long, clean historical labels is a primary challenge.
- Result: historical backfill is partly simulated or approximated in minimal setups; for production-grade training you must secure paid API access, public historical datasets, or deploy local sensors.
- Model storage & versioning: storing pickled models in MongoDB works for prototypes, but for scale use an artifact registry (S3 + MLflow, Vertex Model Registry, or Hopsworks Model Registry) for reproducible lineage.
- Compute: LSTM training requires more compute and careful preprocessing; training on laptop may be slow.

Where to improve / next steps
----------------------------
- Use a true feature store: Hopsworks or Vertex AI Feature Store for production feature lineage and online serving.
- Use MLflow / Vertex Model Registry for proper model lineage, artifact storage, and rollback.
- Replace simulated historical AQI with a curated dataset (government sensors, research datasets) or paid API access.
- Introduce Airflow for robust DAG scheduling, retries, and monitoring.
- Add unit/integration tests and CI tests covering model reproducibility and API contract.

Quick run checklist
-------------------
1. Create `.env.local` with: `OPENWEATHER_API_KEY`, `AQICN_API_KEY`, `MONGO_URI`, `PYTHON_API_BASE`.
2. Install: `pip install -r requirements.txt` and `npm install`.
3. Start MongoDB.
4. Backfill: `python main.py --mode backfill --days 30`.
5. Train: `python main.py --mode train`.
6. API: `python main.py --mode api`; Frontend: `npm run dev`.

Contact & references
--------------------
- OpenWeather: https://openweathermap.org/api
- AQICN / WAQI: https://aqicn.org/api/
- SHAP: https://github.com/slundberg/shap
- XGBoost/LightGBM docs: respective repos

— end —
