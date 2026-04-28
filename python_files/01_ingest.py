# ==========================================
# 01_INGEST.PY
# Professional Ingestion with Parquet
# ==========================================
import pandas as pd
import numpy as np
import os

# Create data directory if not exists
os.makedirs('data', exist_ok=True)

def generate_synthetic_data(n=2000):
    np.random.seed(42)
    data = {
        "customer_id": [f"CUST-{i:05d}" for i in range(n)],
        "tenure_months": np.random.randint(1, 72, n),
        "billing_amount": np.random.uniform(20.0, 150.0, n),
        "active_days": np.random.randint(0, 31, n),
        "support_tickets": np.random.poisson(0.5, n),
        "plan_tier": np.random.choice(['Basic', 'Standard', 'Premium'], n),
        "region": np.random.choice(['North', 'South', 'East', 'West'], n),
        "is_autopay": np.random.choice([True, False], n),
        "is_discounted": np.random.choice([True, False], n, p=[0.2, 0.8]),
        "monthly_usage_hours": np.random.uniform(5.0, 100.0, n),
        "nps_score": np.random.randint(1, 11, n)
    }
    
    # Logic for churn (simulation)
    # Higher ticket count + high billing + low active days = high churn prob
    noise = np.random.normal(0, 0.1, n)
    churn_prob = (
        (data['support_tickets'] * 0.2) + 
        (1.0 - (data['active_days'] / 30.0)) + 
        (data['billing_amount'] / 150.0) * 0.3 -
        (data['tenure_months'] / 72.0) * 0.2 +
        noise
    )
    data['churned_next_cycle'] = (churn_prob > 0.8).astype(int)
    
    return pd.DataFrame(data)

df = generate_synthetic_data()
df.to_csv("data/churn_frame.csv", index=False)
print("✅ Synthetic data generated and saved to data/churn_frame.csv")
