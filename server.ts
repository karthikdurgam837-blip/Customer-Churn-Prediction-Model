import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database for simulation
  const customers = [
    { id: "CUST-00124", name: "Alex Rivera", tenure: 12, billing: 120.50, active_days: 3, tickets: 4, plan: "Premium", region: "North", prob: 0.84, action: "Priority Support Call" },
    { id: "CUST-00562", name: "Jordan Smith", tenure: 48, billing: 45.00, active_days: 28, tickets: 0, plan: "Basic", region: "West", prob: 0.05, action: "Maintain" },
    { id: "CUST-00891", name: "Sam Chen", tenure: 6, billing: 89.99, active_days: 12, tickets: 2, plan: "Standard", region: "East", prob: 0.42, action: "Feature Nudge" },
    { id: "CUST-01202", name: "Maria Garcia", tenure: 24, billing: 150.00, active_days: 5, tickets: 3, plan: "Premium", region: "South", prob: 0.76, action: "Price Adjustment Offer" },
    { id: "CUST-01553", name: "Liam Wilson", tenure: 36, billing: 65.20, active_days: 20, tickets: 1, plan: "Standard", region: "North", prob: 0.12, action: "Renewal Prep" },
  ];

  // API Endpoints
  app.get("/api/customers", (req, res) => {
    res.json(customers);
  });

  app.post("/api/score", (req, res) => {
    const { tenure, billing, active_days, tickets } = req.body;
    // Simulation logic mimicking the Python XGBoost model
    let prob = (tickets * 0.15) + (1.0 - (active_days / 31)) * 0.5 + (billing / 200) * 0.2;
    prob = Math.min(Math.max(prob, 0.01), 0.99);
    
    res.json({
      probability: prob,
      risk: prob > 0.7 ? "High" : prob > 0.3 ? "Medium" : "Low",
      factors: [
        tickets > 2 ? "High Support Intensity" : null,
        active_days < 10 ? "Low Login Recency" : null,
        billing > 100 ? "Price Sensitivity" : null
      ].filter(Boolean)
    });
  });

  app.get("/api/stats", (req, res) => {
    res.json({
      total_customers: 2000,
      avg_churn_rate: 0.14,
      at_risk_pool: 280,
      monthly_revenue_vulnerable: 12500
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Success-Ops Server running on http://localhost:${PORT}`);
  });
}

startServer();
