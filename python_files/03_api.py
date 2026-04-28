# ==========================================
# 03_API.PY
# FastAPI Scoring Service
# ==========================================
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="Churn Scoring Service")
model = joblib.load("models/churn_model.joblib")

class CustomerInput(BaseModel):
    tenure_months: int
    billing_amount: float
    active_days: int
    support_tickets: int
    plan_tier: str
    region: str
    is_autopay: bool
    is_discounted: bool
    monthly_usage_hours: float
    nps_score: int

@app.post("/score")
def score_customer(customer: CustomerInput):
    df = pd.DataFrame([customer.dict()])
    prob = float(model.predict_proba(df)[0, 1])
    return {
        "churn_probability": prob,
        "risk_level": "High" if prob > 0.7 else "Medium" if prob > 0.3 else "Low",
        "action_required": prob > 0.5
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
