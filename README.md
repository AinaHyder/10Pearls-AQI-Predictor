# AQI Prediction Dashboard

A comprehensive Air Quality Index (AQI) prediction system with machine learning models, automated pipelines, and a modern web dashboard.

## Features

### 🔄 Feature Pipeline Development
- Fetches raw weather and pollutant data from OpenWeatherMap and AQICN APIs
- Computes time-based features (hour, day, month) and derived features like AQI change rate
- Stores processed features in MongoDB

### 📊 Historical Data Backfill
- Runs feature pipeline for past dates to generate training data
- Creates comprehensive dataset for model training and evaluation

### 🤖 Training Pipeline Implementation
- Fetches historical features and targets from MongoDB
- Experiments with multiple ML models: Random Forest, Ridge Regression, XGBoost, LightGBM, LSTM
- Evaluates performance using RMSE, MAE, and R² metrics
- Stores trained models in MongoDB model registry

### 🔄 Automated CI/CD Pipeline
- Feature pipeline runs every hour automatically
- Training pipeline runs daily for model updates
- GitHub Actions for continuous integration and deployment

### 🌐 Web Application Dashboard
- Built with Next.js and React
- Loads models and features from MongoDB
- Computes real-time predictions for next 3 days
- Interactive dashboard with charts and visualizations

### 📈 Advanced Analytics Features
- Exploratory Data Analysis (EDA) with correlation heatmaps and time series plots
- SHAP and LIME for feature importance explanations
- Alert system for hazardous AQI levels

## Tech Stack

- **Backend**: Python, FastAPI
- **Frontend**: Next.js, React, TypeScript
- **Database**: MongoDB
- **ML Models**: Scikit-learn, TensorFlow, XGBoost, LightGBM
- **APIs**: OpenWeatherMap, AQICN
- **Deployment**: GitHub Actions

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB
- API keys for OpenWeatherMap and AQICN

### 1. Clone and Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.local` and update with your API keys:

```env
OPENWEATHER_API_KEY=your_openweather_key
AQICN_API_KEY=your_aqicn_key
MONGO_URI=mongodb://localhost:27017/
PYTHON_API_BASE=http://localhost:8000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system.

### 4. Backfill Historical Data

```bash
python main.py --mode backfill --days 30
```

### 5. Train Models

```bash
python main.py --mode train
```

### 6. Start the API Server

```bash
python main.py --mode api
```

### 7. Start the Frontend

```bash
npm run dev
```

### 8. (Optional) Start Automated Scheduler

```bash
python main.py --mode scheduler
```

## API Endpoints

- `GET /api/current-aqi` - Get current AQI data
- `GET /api/predictions` - Get AQI predictions for next 3 days
- `GET /api/alerts` - Get current alerts based on AQI
- `POST /api/train-models` - Trigger model training
- `POST /api/backfill-data` - Backfill historical data
- `GET /api/analytics/plots` - Generate analytics plots

## Project Structure

```
├── app.py                 # FastAPI application
├── main.py               # Main entry point
├── config.py             # Configuration settings
├── data_fetcher.py       # API data fetching
├── feature_engineering.py # Feature creation
├── database.py           # MongoDB operations
├── model_training.py     # Model training logic
├── prediction.py         # Prediction engine
├── analytics.py          # EDA and explanations
├── scheduler.py          # Automated pipelines
├── requirements.txt      # Python dependencies
├── .github/workflows/    # CI/CD pipelines
├── app/                  # Next.js frontend
├── components/           # React components
└── public/               # Static assets
```

## Usage

1. **Real-time Dashboard**: Visit `http://localhost:3000` to see current AQI, predictions, and analytics
2. **API Access**: Use the REST API endpoints for integration with other systems
3. **Model Training**: Run training pipeline to update models with new data
4. **Analytics**: Generate EDA reports and feature importance analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details