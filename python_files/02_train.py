# ==========================================
# 02_TRAIN.PY
# XGBoost Training with Preprocessing
# ==========================================
import pandas as pd
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score

# Load
df = pd.read_csv("data/churn_frame.csv")

# Split
X = df.drop(columns=['customer_id', 'churned_next_cycle'])
y = df['churned_next_cycle']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# Features
NUM = ['tenure_months', 'billing_amount', 'active_days', 'support_tickets', 'monthly_usage_hours', 'nps_score']
CAT = ['plan_tier', 'region', 'is_autopay', 'is_discounted']

# Pipeline
preprocessor = ColumnTransformer([
    ('num', Pipeline([('imp', SimpleImputer(strategy='median')), ('sc', StandardScaler())]), NUM),
    ('cat', Pipeline([('imp', SimpleImputer(strategy='most_frequent')), ('ohe', OneHotEncoder(handle_unknown='ignore'))]), CAT)
])

model = Pipeline([
    ('pre', preprocessor),
    ('clf', XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, use_label_encoder=False, eval_metric='logloss'))
])

# Train
model.fit(X_train, y_train)

# Eval
preds = model.predict(X_test)
proba = model.predict_proba(X_test)[:, 1]
print(classification_report(y_test, preds))
print(f"ROC-AUC: {roc_auc_score(y_test, proba):.4f}")

# Save
joblib.dump(model, "models/churn_model.joblib")
print("✅ Model trained and saved to models/churn_model.joblib")
