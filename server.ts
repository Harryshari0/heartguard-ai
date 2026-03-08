import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { spawn } from "child_process";
import Database from "better-sqlite3";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database
const db = new Database("heart_guard.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    riskLevel TEXT,
    probability REAL,
    insight TEXT,
    modelUsed TEXT,
    timestamp INTEGER,
    data TEXT
  )
`);

app.use(express.json());

/* ---------------- HEALTH CHECK ROUTE ---------------- */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "HeartGuard AI",
    timestamp: new Date().toISOString()
  });
});

/* ---------------- HISTORY API ---------------- */
app.get("/api/history", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM history ORDER BY timestamp DESC").all();
    const history = rows.map((row: any) => ({
      ...row,
      data: JSON.parse(row.data)
    }));
    res.json(history);
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

app.post("/api/history", (req, res) => {
  try {
    const item = req.body;
    const stmt = db.prepare(`
      INSERT INTO history (id, riskLevel, probability, insight, modelUsed, timestamp, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      item.id,
      item.riskLevel,
      item.probability,
      item.insight,
      item.modelUsed || "logistic_regression",
      item.timestamp,
      JSON.stringify(item.data)
    );

    res.json({ success: true });

  } catch (error) {
    console.error("Failed to save history:", error);
    res.status(500).json({ error: "Failed to save history" });
  }
});

/* ---------------- PREDICTION API ---------------- */

app.post("/api/predict", async (req, res) => {
  try {
    const patientData = req.body;

    // Use python3 for Linux (Render) and py for Windows
    const pythonCommand = process.platform === "win32" ? "py" : "python3";

    const pythonProcess = spawn(pythonCommand, ["model.py"], {
      cwd: process.cwd(),
    });

    let resultData = "";
    let errorData = "";

    // Send patient data to Python
    pythonProcess.stdin.write(JSON.stringify(patientData));
    pythonProcess.stdin.end();

    // Capture Python output
    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
      console.log("Python output:", data.toString());
    });

    // Capture Python errors
    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
      console.error("Python error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python process exited with code:", code);
        console.error(errorData);
        return res.status(500).json({
          error: "Python model execution failed",
        });
      }

      try {
        const prediction = JSON.parse(resultData);
        res.json(prediction);
      } catch (err) {
        console.error("JSON parse error:", err);
        console.error("Raw Python output:", resultData);

        res.status(500).json({
          error: "Invalid response from Python model",
        });
      }
    });

  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      error: "Server failed to process prediction",
    });
  }
});
/* ---------------- SERVER SETUP ---------------- */
async function setupServer() {

  if (process.env.NODE_ENV !== "production") {

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);

  } else {

    app.use(express.static("dist"));

  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

}

setupServer();