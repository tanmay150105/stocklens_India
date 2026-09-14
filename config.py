from pathlib import Path

# =========================
# PROJECT PATHS
# =========================

BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

STOCK_DATA_DIR = RAW_DATA_DIR / "stocks"
NIFTY_DATA_DIR = RAW_DATA_DIR / "nifty"
SECTOR_DATA_DIR = RAW_DATA_DIR / "sectors"

MODEL_DIR = BASE_DIR / "models"
RESULTS_DIR = BASE_DIR / "results"


# =========================
# STOCK CONFIGURATION
# =========================

SUPPORTED_STOCKS = [
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "SBIN.NS",
    "AXISBANK.NS",

    "TCS.NS",
    "INFY.NS",
    "WIPRO.NS",
    "HCLTECH.NS",

    "RELIANCE.NS",
    "ONGC.NS",

    "MARUTI.NS",
    "M&M.NS",
    "TATAMOTORS.NS",

    "ITC.NS",
    "HINDUNILVR.NS",

    "SUNPHARMA.NS",
    "CIPLA.NS",

    "BHARTIARTL.NS",
    "LT.NS",
    "ADANIPORTS.NS",
]


# =========================
# TRAINING CONFIGURATION
# =========================

DEFAULT_WINDOW = 60

ALLOWED_WINDOWS = [
    30,
    60,
    90
]


# =========================
# DATA CONFIGURATION
# =========================

HISTORY_DAYS = 200

NIFTY_SYMBOL = "^NSEI"


# =========================
# API CONFIGURATION
# =========================

API_VERSION = "v1"