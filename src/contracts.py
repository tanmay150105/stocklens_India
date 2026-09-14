# =========================
# TARGET
# =========================

TARGET_COLUMN = "target_next_return"

PREDICTION_COLUMN = "predicted_next_return"


# =========================
# DIRECTION
# =========================

DIRECTION_UP = "UP"
DIRECTION_DOWN = "DOWN"


# =========================
# RISK
# =========================

RISK_LOW = "LOW"
RISK_MEDIUM = "MEDIUM"
RISK_HIGH = "HIGH"


# =========================
# MARKET REGIME
# =========================

REGIME_BULLISH = "Bullish"
REGIME_BEARISH = "Bearish"
REGIME_SIDEWAYS = "Sideways"
REGIME_HIGH_VOLATILITY = "High Volatility"


# =========================
# DATA STATUS
# =========================

DATA_FRESH = "FRESH"
DATA_CACHED = "CACHED"


# =========================
# FEATURES
# =========================

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
    "sector_trend",
]