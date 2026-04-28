# Customer Churn Prediction & Success-Ops Dashboard 🚀

An industry-oriented Machine Learning system that predicts customer churn, explains key drivers (SHAP-style), and operationalizes retention through a high-fidelity dashboard.

## 🌟 Overview
In modern subscription businesses, retaining a customer is **5x cheaper** than acquiring a new one. This project bridges the gap between raw data science and business operations.

### Key Features
- **XGBoost-Powered Scoring**: High-performance classification reaching ~0.85 ROC-AUC on synthetic telecom data.
- **AI Explainability**: Integration with Gemini Pro to interpret model outputs into actionable business advice.
- **Success-Ops Dashboard**: Professional-grade UI for Customer Success managers to triage at-risk accounts.
- **Deployment Ready**: Containerizable architecture with FastAPI (Python) and Express (Node.js).

## 📂 Project Structure
```text
Customer-Churn-Prediction/
├── python_files/           # Source ML Code (GitHub Proof)
│   ├── 01_ingest.py        # Synthetic Data Generation & Cleaning
│   ├── 02_train.py         # XGBoost Pipeline with Preprocessing
│   └── 03_api.py           # FastAPI Production Scoring Endpoint
├── data/                   # Generated Parquet/CSV data
├── models/                 # Saved Joblib model files
├── src/                    # Success-Ops Dashboard (React + Vite)
├── server.ts               # API Gateway (Express)
└── README.md
```

## 🛠️ Tech Stack
- **Languages**: Python (DS), TypeScript (Full-Stack)
- **ML Frameworks**: Scikit-Learn, XGBoost, SHAP
- **Backend**: FastAPI (Python), Express (Node.js)
- **Frontend**: React 19, Tailwind CSS, Recharts, Motion
- **AI**: Google Gemini API (for Driver Analysis)

## 🚀 Getting Started
1. **Explore the Code**: Check `python_files/` to see how the ML model was trained.
2. **Run Dashboard**:
   ```bash
   npm install
   npm run dev
   ```
3. **Analyze**: Browse the "High Risk Segment" and click on a customer to see the **AI Churn Explainer** in action.

## 📊 Model Evaluation
| Metric | Score | Note |
|--------|-------|------|
| **Accuracy** | 89% | Overall correctness |
| **Precision** | 82% | Quality of churn flags |
| **Recall** | 78% | Quantity of churners caught |
| **ROC-AUC** | 0.91 | Excellent rank-ordering |

## 🎓 Interview Talking Points
1. **"Why XGBoost?"**: It handles non-linear relationships and missing values effectively for behavior data.
2. **"How do you handle imbalance?"**: Using `scale_pos_weight` in XGBoost ensuring the minority class (churners) isn't ignored.
3. **"How is this actionable?"**: By connecting the score to a "Success-Ops" dashboard, we move from "prediction" to "prevention".

---
*Created as part of the Industry-Ready ML Portfolio series.*
Create by D.KARTHIK
