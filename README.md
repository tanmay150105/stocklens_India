# IndiaStockLens

## Recency-Aware Explainable Machine Learning for Short-Term Forecasting of Indian Equities

IndiaStockLens is a lightweight, data-driven machine-learning framework for **short-term forecasting of selected Indian equities listed on the National Stock Exchange (NSE)**.

The project investigates whether **recent rolling market windows** can provide useful short-term forecasts while reducing unnecessary data processing, training time, and computational cost.

The system combines:

- Recent stock-market data
- Technical indicators
- NIFTY 50 market context
- Sector-level context
- Multiple machine-learning models
- Chronological time-series validation
- Recency experiments
- Market-regime analysis
- Explainability
- Model-based risk assessment
- Local data caching
- Fast inference
- Flask API
- Interactive web dashboard

---

# 1. Core Research Question

> **Does a recency-aware learning approach improve short-term forecasting for Indian equities while reducing unnecessary computational cost?**

---

# 2. Research Motivation

Financial markets are dynamic and non-stationary. Market behavior, volatility, sector relationships, and investor behavior can change over time.

Using very large historical datasets may increase the number of observations but can also introduce:

- Older market regimes
- Unnecessary computation
- Longer training time
- Higher memory usage
- Larger storage requirements

However, the project does **not** assume that old data is useless.

Instead, IndiaStockLens experimentally studies the relationship between:

```text
Data Recency
      +
Training Window Size
      +
Forecasting Performance
      +
Computational Cost
```

---

# 3. Hypothesis

> **A recent-data or recency-aware training strategy can provide competitive short-term forecasting performance for Indian equities while reducing training time and computational requirements compared with unnecessarily large historical datasets.**

The hypothesis must be evaluated using experimental results.

---

# 4. Project Objectives

The system must:

1. Retrieve the latest available Indian market data.
2. Maintain a local data cache.
3. Support selected NSE-listed equities.
4. Calculate technical indicators.
5. Incorporate NIFTY 50 context.
6. Incorporate sector-level context.
7. Train multiple ML models.
8. Compare 30, 60, and 90 trading-day training windows.
9. Use chronological time-series validation.
10. Predict next-trading-day return.
11. Derive predicted closing price.
12. Predict UP/DOWN direction.
13. Generate a model-based risk level.
14. Generate forecast reliability information.
15. Explain important prediction features.
16. Analyze different market regimes.
17. Measure training and inference time.
18. Provide predictions through Flask.
19. Display results through a web dashboard.
20. Continue functioning with cached data when the external source is unavailable.

---

# 5. Project Scope

## In Scope

- Indian equities
- NSE-focused stock universe
- Latest/near-real-time accessible data
- Local caching
- Technical indicators
- NIFTY context
- Sector context
- Recent rolling windows
- Linear Regression
- Random Forest
- XGBoost
- Time-series validation
- Recency experiments
- Market-regime analysis
- Feature importance
- Risk indicator
- Forecast reliability
- Flask backend
- HTML/CSS/JavaScript frontend
- Chart.js visualizations

## Out of Scope

The following are intentionally not part of the core project:

- Automated trading
- Broker order execution
- Portfolio management
- Payment systems
- Authentication
- Mobile application
- React
- Kubernetes
- Microservices
- Enterprise infrastructure
- Large production databases
- LSTM
- Transformers
- High-frequency trading
- Continuous retraining per request
- Guaranteed investment recommendations
- Large-scale news-processing infrastructure

Optional features must not delay the core implementation.

---

# 6. Initial Stock Universe

The initial system will support approximately 20 established Indian equities across multiple sectors.

### Banking

- HDFCBANK.NS
- ICICIBANK.NS
- SBIN.NS
- AXISBANK.NS

### Information Technology

- TCS.NS
- INFY.NS
- WIPRO.NS
- HCLTECH.NS

### Energy

- RELIANCE.NS
- ONGC.NS

### Automobile

- MARUTI.NS
- M&M.NS
- TATAMOTORS.NS

### FMCG

- ITC.NS
- HINDUNILVR.NS

### Pharmaceutical

- SUNPHARMA.NS
- CIPLA.NS

### Other

- BHARTIARTL.NS
- LT.NS
- ADANIPORTS.NS

The stock list can be expanded after successful integration.

---

# 7. Data Strategy

## 7.1 Data Retrieval

The system should retrieve approximately **100–200 trading days** when required for feature calculation.

This supports indicators such as:

- SMA-50
- EMA
- RSI
- MACD
- Bollinger Bands
- ATR
- Rolling volatility

## 7.2 Training Data

The default training window is:

> **60 trading days**

Research windows:

```text
30 days
60 days
90 days
```

An optional longer-history baseline may be included.

---

# 8. Important Distinction

The amount of data retrieved is not necessarily the amount of data used for training.

Example:

```text
100–200 trading days retrieved
            ↓
     Calculate indicators
            ↓
      Build valid rows
            ↓
      Select training window
            ↓
      30 / 60 / 90 days
            ↓
        Train model
```

This keeps the project computationally lightweight.

---

# 9. Latest Data and Cache

The project targets the **latest available data from the selected provider**.

It should not claim guaranteed zero-latency real-time market data unless explicitly supported by the provider.

Architecture:

```text
External Data Source
        ↓
    Data Manager
        ↓
     Local Cache
        ↓
 Feature / Prediction
```

Failure path:

```text
External Data Source
        ↓
       FAIL
        ↓
     Local Cache
        ↓
    Prediction
```

The dashboard must indicate whether the data is:

```text
FRESH
```

or:

```text
CACHED
```

---

# 10. Data Source Abstraction

All external market-data access belongs to:

```text
src/data_manager.py
```

Possible initial provider:

```text
yfinance
```

The exact provider may change.

The rest of the project must not directly depend on the provider.

Required conceptual interface:

```python
get_latest_data(symbol)
get_historical_data(symbol)
get_nifty_data()
get_sector_data(symbol)
update_data()
```

---

# 11. Prediction Target

The primary prediction target is:

> **Next trading day's percentage return**

```python
next_day_return = (
    Close[t+1] - Close[t]
) / Close[t]
```

Predicted price:

```python
predicted_price = (
    current_price * (1 + predicted_return)
)
```

Direction:

```python
if predicted_return > 0:
    direction = "UP"
else:
    direction = "DOWN"
```

---

# 12. Feature Set

## Stock Features

- Open
- High
- Low
- Close
- Volume

## Lag Features

- Close lag 1
- Close lag 2
- Close lag 3
- Close lag 5
- Close lag 10

## Return Features

- Daily return
- 5-day return
- 20-day return

## Trend

- SMA-10
- SMA-20
- SMA-50
- EMA-10
- EMA-20

## Momentum

- RSI
- MACD

## Volatility

- Rolling volatility
- ATR
- Bollinger Bands

## NIFTY

- NIFTY return
- NIFTY volatility
- NIFTY trend

## Sector

- Sector return
- Sector volatility
- Sector trend

---

# 13. Data Leakage Rule

This is mandatory.

Features at time `t` may use only information available at time `t`.

They predict:

```text
t → t+1
```

Future information must never enter the feature vector.

This applies to:

- Stock data
- NIFTY data
- Sector data
- Technical indicators
- Target construction

---

# 14. Model Set

The core ML models are:

### Linear Regression

Baseline model.

### Random Forest

Nonlinear tree-based model.

### XGBoost

Gradient-boosting model.

No deep-learning model is required.

---

# 15. Evaluation

Random train/test splitting must not be used for the main time-series experiment.

The system uses:

- Chronological split
- Walk-forward validation where practical

Metrics:

### Regression

- MAE
- RMSE
- R²
- MAPE where appropriate

### Direction

- Accuracy
- Precision
- Recall
- F1

### Efficiency

- Training time
- Feature-processing time
- Prediction latency
- Memory usage where practical

---

# 16. Recency Experiment

Each model/window combination should be evaluated.

```text
30-day window
       ↓
 Models
       ↓
 Metrics

60-day window
       ↓
 Models
       ↓
 Metrics

90-day window
       ↓
 Models
       ↓
 Metrics
```

Required comparison output:

```text
results/window_comparison.csv
```

Recommended columns:

```text
symbol
window_days
model
mae
rmse
r2
direction_accuracy
precision
recall
f1
training_time_ms
prediction_time_ms
```

---

# 17. Market Regime Analysis

The system classifies broad market conditions as:

- Bullish
- Bearish
- Sideways
- High Volatility

The exact thresholds must be defined and documented in:

```text
src/market_regime.py
```

The system should evaluate whether model performance changes by market regime.

Required output:

```text
results/regime_analysis.csv
```

---

# 18. Explainability

The system should answer:

> **Why did the model make this prediction?**

Initial implementation:

> Feature importance

Example:

```text
NIFTY trend       → High importance
20-day return     → High importance
MACD              → Medium importance
RSI               → Medium importance
Volatility        → Low importance
```

Feature importance must not automatically be described as a direct percentage change in the predicted price.

SHAP is optional.

---

# 19. Risk

Risk is represented as:

```text
LOW
MEDIUM
HIGH
```

The indicator may use:

- Historical volatility
- Forecast error
- Expected movement
- Market regime
- Data sufficiency

It is a **model-based analytical indicator**, not financial advice.

---

# 20. Forecast Reliability

The system provides a:

> **Reliability Score**

The exact methodology must be documented.

Possible components:

- Recent validation performance
- Recent forecast error
- Volatility
- Market regime
- Data sufficiency

The score must not be presented as a guarantee.

---

# 21. Four-Member Parallel Development Strategy

The project is divided into four independently buildable sections.

```text
┌─────────────────────────────────────────────────────────┐
│                    IndiaStockLens                       │
├─────────────────┬─────────────────┬─────────────────────┤
│ MEMBER 1        │ MEMBER 2        │ MEMBER 3            │
│ DATA + FEATURES │ ML + RESEARCH   │ BACKEND + PREDICT   │
└─────────────────┴─────────────────┴─────────────────────┘
                         +
                MEMBER 4
            FRONTEND + VISUALIZATION
```

All four members can work simultaneously.

The integration point is the **shared contract**, not the internal code.

---

# 22. MEMBER 1 — Data & Feature Engineering

## Objective

Build the complete data layer independently.

## Ownership

```text
src/data_manager.py
src/preprocessing.py
src/indicators.py
src/feature_engineering.py
scripts/update_data.py
data/
```

Member 1 may additionally own:

```text
src/schemas.py
```

for shared data structures.

## Responsibilities

1. Retrieve market data.
2. Retrieve stock data.
3. Retrieve NIFTY data.
4. Retrieve sector data.
5. Store local cached data.
6. Handle data-provider failures.
7. Clean missing/invalid observations.
8. Calculate technical indicators.
9. Generate lag and return features.
10. Generate NIFTY and sector features.
11. Generate next-day return target.
12. Ensure leakage prevention.
13. Produce a stable feature dataset.

## Main Deliverable

Member 1 must produce:

```text
data/processed/
```

with a stable feature dataset.

Recommended schema:

```text
timestamp
symbol
open
high
low
close
volume
close_lag_1
close_lag_2
close_lag_3
close_lag_5
close_lag_10
return_daily
return_5d
return_20d
sma_10
sma_20
sma_50
ema_10
ema_20
rsi_14
macd_diff
rolling_volatility
atr
bollinger_upper
bollinger_lower
nifty_return
nifty_volatility
nifty_trend
sector_return
sector_volatility
sector_trend
target_next_return
```

## Member 1 does NOT need to build

- ML training
- Flask
- Dashboard
- Model selection

---

# 23. MEMBER 2 — ML & Research Engine

## Objective

Build the complete machine-learning and experimental layer independently from Flask.

## Ownership

```text
src/train.py
src/evaluate.py
src/market_regime.py
scripts/train_models.py
models/
results/
```

## Responsibilities

1. Read Member 1's processed feature data.
2. Implement Linear Regression.
3. Implement Random Forest.
4. Implement XGBoost.
5. Implement chronological validation.
6. Implement walk-forward validation where practical.
7. Compare 30/60/90-day windows.
8. Measure training time.
9. Measure prediction time.
10. Detect market regime.
11. Compare models.
12. Save trained models.
13. Generate evaluation results.

## Model Contract

Saved models may follow:

```text
models/{symbol}_{window}_{model}.joblib
```

Example:

```text
models/TCS.NS_60_xgboost.joblib
```

The model must accept:

```text
X = feature vector with fixed feature order
```

and return:

```text
predicted_next_return
```

## Required Outputs

```text
models/
results/metrics.csv
results/model_comparison.csv
results/window_comparison.csv
results/regime_analysis.csv
```

## Member 2 does NOT need to build

- Flask
- HTML
- CSS
- JavaScript
- External market-data fetching

---

# 24. MEMBER 3 — Backend & Prediction Engine

## Objective

Build the complete application/API layer independently of the frontend.

## Ownership

```text
app.py
src/predict.py
src/explain.py
config.py
```

## Responsibilities

1. Load configuration.
2. Load saved models.
3. Load latest/cached data.
4. Prepare latest prediction features.
5. Generate prediction.
6. Convert predicted return into predicted price.
7. Determine UP/DOWN direction.
8. Determine market regime.
9. Generate reliability score.
10. Generate risk level.
11. Generate feature-importance output.
12. Expose API endpoints.
13. Handle invalid inputs.
14. Handle missing models.
15. Handle insufficient data.

## Primary API Contract

```text
GET /api/v1/predict?symbol=TCS.NS&window=60
```

Expected response:

```json
{
  "status": "success",
  "symbol": "TCS.NS",
  "window_days": 60,
  "current_price": 4250.00,
  "predicted_return": 0.0082,
  "predicted_price": 4284.85,
  "direction": "UP",
  "market_regime": "Bullish",
  "risk_level": "MEDIUM",
  "reliability_score": 0.84,
  "feature_importance": [
    {
      "feature": "nifty_trend",
      "importance": 0.31
    },
    {
      "feature": "rsi_14",
      "importance": 0.18
    }
  ],
  "data_status": "FRESH",
  "timestamp": "2026-09-14 15:30:00"
}
```

The exact numeric values are examples only.

## Additional API endpoints

Possible:

```text
GET /api/v1/stocks
GET /api/v1/stock/<symbol>
GET /api/v1/metrics/<symbol>
```

## Member 3 does NOT need to build

- ML training experiments
- Dashboard design
- Chart.js logic
- CSS

---

# 25. MEMBER 4 — Frontend & Visualization

## Objective

Build the complete user-facing dashboard using the fixed backend API.

## Ownership

```text
templates/index.html
static/css/style.css
static/js/app.js
static/js/charts.js
```

## Responsibilities

1. Build stock selector.
2. Build training-window selector.
3. Display current price.
4. Display predicted price.
5. Display expected return.
6. Display direction.
7. Display risk.
8. Display reliability.
9. Display market regime.
10. Display technical indicators.
11. Display NIFTY/sector context.
12. Display feature importance.
13. Display price charts.
14. Display model comparison.
15. Display data freshness.
16. Handle API errors gracefully.

## Required UI Controls

```text
Stock:
[TCS ▼]

Training Window:
[30] [60] [90]
```

The frontend must call the backend rather than calculating ML predictions itself.

---

# 26. What Each Member Can Build Independently

The four sections are intentionally decoupled.

```text
MEMBER 1
Data + Features
      ↓
Stable processed dataset
```

```text
MEMBER 2
ML + Research
      ↓
Saved models + metrics
```

```text
MEMBER 3
Backend
      ↓
Stable JSON API
```

```text
MEMBER 4
Frontend
      ↓
Dashboard
```

Members do not need to wait for each other to finish.

---

# 27. Shared Contracts

The following items are **frozen interfaces**.

Changing them without informing all members is not allowed.

## Contract A — Symbol

Use NSE Yahoo-style identifiers consistently:

```text
TCS.NS
INFY.NS
RELIANCE.NS
HDFCBANK.NS
```

## Contract B — Window

Allowed values:

```text
30
60
90
```

## Contract C — Target

```text
target_next_return
```

## Contract D — Model Output

```text
predicted_next_return
```

## Contract E — Direction

Only:

```text
UP
DOWN
```

## Contract F — Risk

Only:

```text
LOW
MEDIUM
HIGH
```

## Contract G — Market Regime

Only:

```text
Bullish
Bearish
Sideways
High Volatility
```

## Contract H — Data Status

Only:

```text
FRESH
CACHED
```

---

# 28. Shared Feature Contract

The ML model expects a fixed feature order.

This is critical.

Member 1 produces the features.

Member 2 trains using those features.

Member 3 creates the same feature vector for inference.

Member 4 only displays results.

The feature order must therefore be defined centrally.

Example:

```python
FEATURE_COLUMNS = [
    "close_lag_1",
    "close_lag_2",
    "close_lag_3",
    "close_lag_5",
    "close_lag_10",
    "return_daily",
    "return_5d",
    "return_20d",
    "sma_10",
    "sma_20",
    "sma_50",
    "ema_10",
    "ema_20",
    "rsi_14",
    "macd_diff",
    "rolling_volatility",
    "atr",
    "bollinger_upper",
    "bollinger_lower",
    "nifty_return",
    "nifty_volatility",
    "nifty_trend",
    "sector_return",
    "sector_volatility",
    "sector_trend"
]
```

The actual feature list may be adjusted during implementation, but once finalized it must remain synchronized across Members 1, 2, and 3.

---

# 29. Shared Schema Strategy

A shared schema file may be maintained:

```text
src/schemas.py
```

Recommended objects:

```text
PredictionResponse
PredictionRequest
StockData
```

The purpose is to prevent key mismatches during integration.

Example:

```python
PredictionResponse(
    status="success",
    symbol="TCS.NS",
    window_days=60,
    current_price=4250.0,
    predicted_return=0.0082,
    predicted_price=4284.85,
    direction="UP",
    market_regime="Bullish",
    risk_level="MEDIUM",
    reliability_score=0.84
)
```

---

# 30. Configuration Contract

`config.py` is the shared configuration source.

It should define:

```text
SUPPORTED_STOCKS
DEFAULT_WINDOW
ALLOWED_WINDOWS
FEATURE_COLUMNS
DATA_PATHS
MODEL_PATHS
API_VERSION
```

Use:

```python
pathlib.Path
```

for file paths.

Do not hardcode operating-system-specific paths.

---

# 31. Integration Rule

The final system will be integrated by connecting:

```text
Member 1 → Member 2 → Member 3 → Member 4
```

through stable contracts.

Integration must **not** require rewriting the core logic of any member's module.

---

# 32. Integration Workflow

## Step 1 — Integrate Data Layer

Run:

```bash
python scripts/update_data.py
```

Verify:

```text
data/raw/
data/processed/
```

contain valid data.

---

## Step 2 — Integrate ML Layer

Run:

```bash
python scripts/train_models.py
```

Verify:

```text
models/
results/
```

contain expected files.

---

## Step 3 — Integrate Backend

Run:

```bash
python app.py
```

Test:

```text
/api/v1/predict?symbol=TCS.NS&window=60
```

Verify that the response matches the API contract.

---

## Step 4 — Integrate Frontend

Open:

```text
http://127.0.0.1:5000/
```

Verify:

- Stock selector
- Window selector
- Prediction cards
- Charts
- Indicators
- Market context
- Risk
- Reliability
- Explanation
- Error handling

---

# 33. Integration Testing Checklist

Before final submission, all four sections must pass:

### Data

```text
[ ] Stock data loads
[ ] NIFTY loads
[ ] Sector data loads
[ ] Cache works
[ ] Fallback works
[ ] Feature columns match contract
[ ] Target is correctly shifted
```

### ML

```text
[ ] All 3 models train
[ ] Models save correctly
[ ] 30-day experiment works
[ ] 60-day experiment works
[ ] 90-day experiment works
[ ] Time-series validation works
[ ] Metrics generated
[ ] Regime analysis works
```

### Backend

```text
[ ] Models load
[ ] Prediction works
[ ] Return converts to price
[ ] Direction works
[ ] Risk works
[ ] Reliability works
[ ] Feature importance works
[ ] API schema is correct
[ ] Error handling works
```

### Frontend

```text
[ ] Stock selector works
[ ] Window selector works
[ ] API calls work
[ ] Charts render
[ ] Prediction updates
[ ] Indicators display
[ ] Risk displays
[ ] Reliability displays
[ ] Explanation displays
[ ] API errors display correctly
```

---

# 34. Project Structure

```text
india-stocklens/
│
├── README.md
├── requirements.txt
├── .gitignore
├── config.py
├── app.py
│
├── data/
│   ├── raw/
│   │   ├── stocks/
│   │   ├── nifty/
│   │   └── sectors/
│   │
│   └── processed/
│
├── models/
│   ├── linear_regression/
│   ├── random_forest/
│   └── xgboost/
│
├── src/
│   ├── __init__.py
|   ├── contracts.py
│   ├── schemas.py
│   ├── data_manager.py
│   ├── preprocessing.py
│   ├── indicators.py
│   ├── feature_engineering.py
│   ├── market_regime.py
│   ├── train.py
│   ├── evaluate.py
│   ├── predict.py
│   └── explain.py
│
├── scripts/
│   ├── update_data.py
│   └── train_models.py
│
├── results/
│   ├── metrics.csv
│   ├── model_comparison.csv
│   ├── window_comparison.csv
│   ├── regime_analysis.csv
│   └── plots/
│
├── templates/
│   └── index.html
│
└── static/
    ├── css/
    │   └── style.css
    │
    └── js/
        ├── app.js
        └── charts.js
```

---

# 35. File Ownership

| File / Directory | Owner |
|---|---|
| `README.md` | Shared |
| `requirements.txt` | Shared |
| `.gitignore` | Shared |
| `config.py` | Member 3 + shared agreement |
| `app.py` | Member 3 |
| `data/` | Member 1 |
| `models/` | Member 2 |
| `results/` | Member 2 |
| `src/contracts.py` | Member 1 + shared agreement |
| `src/schemas.py` | Member 1 + shared agreement |
| `src/data_manager.py` | Member 1 |
| `src/preprocessing.py` | Member 1 |
| `src/indicators.py` | Member 1 |
| `src/feature_engineering.py` | Member 1 |
| `src/market_regime.py` | Member 2 |
| `src/train.py` | Member 2 |
| `src/evaluate.py` | Member 2 |
| `src/predict.py` | Member 3 |
| `src/explain.py` | Member 3 |
| `scripts/update_data.py` | Member 1 |
| `scripts/train_models.py` | Member 2 |
| `templates/index.html` | Member 4 |
| `static/css/` | Member 4 |
| `static/js/` | Member 4 |

---

# 36. Parallel Development Timeline

All four members can begin immediately.

```text
                    DAY 1
────────────────────────────────────────────────────────────
Member 1 → Data manager + preprocessing + indicators

Member 2 → ML models + evaluation framework using sample
           feature schema

Member 3 → Flask + API + prediction engine using mock
           model outputs

Member 4 → Dashboard + charts using mock JSON API
────────────────────────────────────────────────────────────

                    DAY 2
────────────────────────────────────────────────────────────
Member 1 → Real data + feature pipeline

Member 2 → Real feature data + saved models + experiments

Member 3 → Connect real models/data + final API

Member 4 → Connect final API + charts + error states
────────────────────────────────────────────────────────────

                    FINAL INTEGRATION
────────────────────────────────────────────────────────────
Member 1 → Final feature schema
      ↓
Member 2 → Final trained models
      ↓
Member 3 → Final prediction API
      ↓
Member 4 → Final dashboard
      ↓
    TEST
      ↓
   REPORT
────────────────────────────────────────────────────────────
```

The use of temporary mock data/models during independent development is allowed for **interface testing only**.

It must never become the final dataset or final experimental result.

---

# 37. Integration by Key Terms

The final system should connect modules through a small number of stable keys.

Core keys:

```text
symbol
window_days
feature_columns
target_next_return
predicted_return
predicted_price
direction
market_regime
risk_level
reliability_score
feature_importance
data_status
timestamp
```

Example flow:

```text
"symbol"
    ↓
Member 1
    ↓
Member 2
    ↓
Member 3
    ↓
Member 4
```

The idea is that each module uses the same names.

Do not create alternatives such as:

```text
ticker
stock_code
stock_symbol
```

for the same concept.

Use:

```text
symbol
```

everywhere.

Similarly, use:

```text
window_days
```

instead of different names such as:

```text
window
days
training_period
history_size
```

This greatly reduces integration conflicts.

---

# 38. Integration Contract Example

### Member 1 produces

```json
{
  "symbol": "TCS.NS",
  "window_days": 60,
  "features": {
    "return_daily": 0.012,
    "rsi_14": 58.4,
    "macd_diff": 4.2,
    "nifty_return": 0.005,
    "sector_return": 0.008
  },
  "target_next_return": 0.004
}
```

### Member 2 consumes

```text
features
    ↓
ML model
    ↓
predicted_return
```

### Member 3 produces

```json
{
  "symbol": "TCS.NS",
  "window_days": 60,
  "predicted_return": 0.0082,
  "predicted_price": 4284.85,
  "direction": "UP"
}
```

### Member 4 consumes

```text
JSON API
   ↓
Cards
Charts
Tables
Indicators
Explanation
```

This is the fundamental integration mechanism.

---

# 39. Important Rule for Parallel Work

A member may internally change:

- function names
- classes
- helper files
- algorithms
- implementation details

provided that the **external contract remains unchanged**.

For example, Member 1 may change the implementation of the data provider without changing:

```python
get_latest_data(symbol)
```

Similarly, Member 2 may tune XGBoost parameters without changing the prediction output contract.

Member 4 can redesign the dashboard without changing API field names.

This allows parallel work without constant synchronization.

---

# 40. Performance Strategy

The system is optimized for low cost and fast inference.

## Avoid

```text
User request
    ↓
Download years of data
    ↓
Recalculate everything
    ↓
Retrain model
    ↓
Predict
```

## Use

```text
Data update
    ↓
Cache

Training
    ↓
Saved model

User request
    ↓
Latest/cache data
    ↓
Latest features
    ↓
Saved model
    ↓
Prediction
```

Prediction latency must be measured rather than claiming an arbitrary value.

---

# 41. Stock-Level Retrieval

The system must not retrieve all supported stocks for each user request.

Example:

```text
User selects TCS.NS
        ↓
TCS data
   +
NIFTY
   +
IT sector
        ↓
Prediction
```

This minimizes:

- API requests
- Data transfer
- Processing
- Memory usage

---

# 42. New Stock Handling

If a stock does not have enough historical data for:

- required indicators
- selected training window
- model inference

the system should return:

```text
Prediction unavailable.
Reason: insufficient historical data.
```

It must not generate an unreliable prediction simply to fill the dashboard.

---

# 43. Error Handling

All sections must handle failures gracefully.

Possible failures:

- Network failure
- Data-provider failure
- Missing symbol
- Missing feature
- Missing model
- Corrupt cache
- Insufficient history
- Invalid API request
- Frontend API failure

The system should return useful errors instead of crashing.

---

# 44. Development Environment

Create a Python virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/macOS

```bash
python -m venv venv
source venv/bin/activate
```

Install:

```bash
pip install -r requirements.txt
```

Docker is optional.

---

# 45. Technology Stack

```text
Python
│
├── Pandas
├── NumPy
├── Scikit-learn
├── XGBoost
├── Joblib
├── Pydantic
│
├── Flask
│
├── HTML
├── CSS
├── JavaScript
└── Chart.js
```

The exact dependency versions should be frozen in `requirements.txt` once the working environment is confirmed.

---

# 46. Deployment

Primary environment:

```text
http://127.0.0.1:5000/
```

Public deployment is optional and should occur only after the local application works reliably.

---

# 47. Previous StockAI Project

The previous StockAI project already demonstrated features including:

- Stock prediction
- Technical indicators
- Risk
- Confidence scores
- Target price
- Buy/Sell/Hold
- AI-assisted analysis
- Global stocks

IndiaStockLens intentionally focuses on a different research contribution.

```text
Indian Equities
        +
Recent Data
        +
NIFTY Context
        +
Sector Context
        +
Recency Experiment
        +
Time-Series Validation
        +
Market Regimes
        +
Explainability
        +
Computational Efficiency
```

The previous project's ideas may inform UI or indicator implementation where technically appropriate, but the new project's experimental results must be based on the new pipeline and real market data.

---

# 48. Definition of Done

## Data Layer

```text
[ ] Real/latest data works
[ ] Cache works
[ ] Fallback works
[ ] Indicators work
[ ] Feature schema is fixed
[ ] No leakage
[ ] Target is correct
```

## ML Layer

```text
[ ] Linear Regression works
[ ] Random Forest works
[ ] XGBoost works
[ ] 30-day experiment works
[ ] 60-day experiment works
[ ] 90-day experiment works
[ ] Time-series validation works
[ ] Metrics generated
[ ] Regime analysis works
[ ] Models saved
```

## Backend Layer

```text
[ ] Saved models load
[ ] Latest features generated
[ ] Prediction works
[ ] Predicted price works
[ ] Direction works
[ ] Risk works
[ ] Reliability works
[ ] Explanation works
[ ] API contract works
```

## Frontend Layer

```text
[ ] Stock selector works
[ ] Window selector works
[ ] API integration works
[ ] Chart works
[ ] Indicators display
[ ] NIFTY/sector context displays
[ ] Risk displays
[ ] Reliability displays
[ ] Explanation displays
[ ] Error handling works
```

---

# 49. Final Research Outputs

The final project should produce:

```text
results/
├── metrics.csv
├── model_comparison.csv
├── window_comparison.csv
├── regime_analysis.csv
└── plots/
```

These results will support the final project report.

The report should answer:

1. Which model performed best?
2. Which training window performed best?
3. Did recent data improve short-term forecasting?
4. How much training time changed with window size?
5. Does performance vary by market regime?
6. Which features were most important?
7. What are the system's limitations?

---

# 50. Final Locked Architecture

```text
                    ┌─────────────────────┐
                    │     DATA SOURCES    │
                    │ Stocks/NIFTY/Sector │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │     MEMBER 1        │
                    │ Data + Features     │
                    └──────────┬──────────┘
                               ↓
                    Processed Feature Data
                               ↓
                    ┌─────────────────────┐
                    │     MEMBER 2        │
                    │ ML + Research       │
                    └──────────┬──────────┘
                               ↓
                      Saved Trained Models
                               ↓
                    ┌─────────────────────┐
                    │     MEMBER 3        │
                    │ Backend + Predict   │
                    └──────────┬──────────┘
                               ↓
                         JSON API
                               ↓
                    ┌─────────────────────┐
                    │     MEMBER 4        │
                    │ Frontend + Charts   │
                    └─────────────────────┘
```

---

# 51. Final Locked Decisions

| Category | Decision |
|---|---|
| Project | IndiaStockLens |
| Focus | Indian equities |
| Initial universe | ~20 NSE stocks |
| Forecast horizon | Next trading day |
| Primary target | Percentage return |
| Derived output | Predicted closing price |
| Direction | UP/DOWN |
| Default window | 60 trading days |
| Experiment windows | 30/60/90 |
| Indicator history | ~100–200 trading days |
| Market context | NIFTY 50 |
| Sector context | Yes |
| Models | Linear Regression, Random Forest, XGBoost |
| Validation | Chronological / Walk-forward |
| Recency experiment | Required |
| Market regime | Required |
| Explainability | Feature importance |
| SHAP | Optional |
| Risk | Model-based |
| Reliability | Model-based |
| Cache | Required |
| Offline fallback | Required |
| Training during request | Never |
| Backend | Flask |
| Frontend | HTML/CSS/JS |
| Charts | Chart.js |
| Data layer | Provider abstraction |
| API validation | Pydantic where useful |
| Model storage | Joblib |
| Database | Not required |
| Docker | Optional |
| Paid APIs | Avoid where practical |
| Automated trading | No |
| LSTM | No |
| Transformer | No |
| React | No |
| Enterprise infrastructure | No |
| Public deployment | Optional |

---

# 52. Root Source Rule

This README is the **single source of truth for IndiaStockLens**.

Every member must build according to:

```text
Scope
   ↓
Architecture
   ↓
Ownership
   ↓
Contracts
   ↓
Integration
```

Internal implementation can change.

Shared contracts cannot change without coordinated integration.

The most important shared terms are:

```text
symbol
window_days
feature_columns
target_next_return
predicted_return
predicted_price
direction
market_regime
risk_level
reliability_score
feature_importance
data_status
timestamp
```

The final integration should connect these terms across all four sections.

> **Four members may build four sections independently, but the final system must behave as one consistent pipeline.**

---

# 53. Final Project Statement

> **IndiaStockLens is a lightweight, recency-aware and explainable machine-learning framework for short-term forecasting of Indian equities. The system combines recent stock-level market information with technical indicators, NIFTY 50 market context, and sector-level information. Multiple machine-learning models are evaluated using chronological time-series validation, while different historical training windows are compared to study the relationship between data recency, forecasting performance, and computational cost. Market-regime analysis and feature-based explanations are used to assess prediction reliability. A Flask-based web application provides fast access to the latest available forecasts while using local caching to improve robustness and reduce unnecessary data retrieval.**

---

# 54. Core Principle

> **Build independently. Integrate through contracts. Measure everything. Keep the system lightweight.**

The project should first achieve a working end-to-end pipeline.

Only after the four sections are successfully integrated should optional improvements be considered.