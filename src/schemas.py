from pydantic import BaseModel
from typing import List, Dict


class PredictionResponse(BaseModel):
    status: str
    symbol: str
    window_days: int

    current_price: float
    predicted_return: float
    predicted_price: float

    direction: str
    market_regime: str
    risk_level: str

    reliability_score: float

    feature_importance: List[Dict]

    data_status: str
    timestamp: str