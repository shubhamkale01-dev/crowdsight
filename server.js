const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express(); // ✅ app MUST be created first

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());

// Serve frontend files if needed
app.use(express.static(path.join(__dirname)));

/* =====================
   DATA
===================== */
let alerts = [];
let zoneStatus = {
  "Railway Station": "NORMAL",
  "Bus Stand": "NORMAL",
  "Ramkund Ghat": "NORMAL"
};

/* =====================
   ROUTES
===================== */

// Health check
app.get("/", (req, res) => {
  res.send("CrowdSight Backend is running 🚀");
});

// Entry API
app.post("/entry", (req, res) => {
  const { location, crowdLevel, emergency } = req.body;

  const alert = {
    location,
    crowdLevel,
    emergency,
    time: new Date().toISOString()
  };

  alerts.push(alert);
  zoneStatus[location] = crowdLevel;

  res.json({ success: true });
});

// Dashboard API
app.get("/dashboard", (req, res) => {
  res.json({
    alerts,
    zones: zoneStatus,
    advisory: "Monitoring crowd conditions in real-time"
  });
});

/* =====================
   START SERVER
===================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
