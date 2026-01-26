// ===============================
// CrowdSight Backend (FINAL)
// ===============================

const path = require("path");
app.use(express.static(path.join(__dirname)));

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// MEMORY
// ===============================

// Store last CCTV signal time per location
const lastCctvSignal = {};

// Alerts store
let alerts = [];

// Zone status
let zoneStatus = {
  "Railway Station": "NORMAL",
  "Bus Stand": "NORMAL",
  "Ramkund Ghat": "NORMAL"
};

// ===============================
// ROOT CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("CrowdSight Backend is running 🚀");
});

// ===============================
// ADVISORY (SIMPLE + SAFE)
// ===============================
function generateAdvisory(alerts) {
  if (alerts.length === 0) {
    return "Situation stable. Monitoring via CCTV and field staff.";
  }

  const last = alerts[alerts.length - 1];

  if (last.confirmed) {
    return "CONFIRMED INCIDENT: Initiate emergency response.";
  }

  if (last.crowdLevel === "HIGH") {
    return "AI detected high crowd. Awaiting field confirmation.";
  }

  if (last.crowdLevel === "MEDIUM") {
    return "Crowd building up. Monitoring closely.";
  }

  return "Situation stable. Continue monitoring.";
}

// ===============================
// ENTRY API (CORE LOGIC)
// ===============================
app.post("/entry", (req, res) => {
  const { location, crowdLevel, emergency } = req.body;
  const now = Date.now();

  let confirmed = false;

  // -------------------------------
  // CASE 1: CCTV INPUT
  // -------------------------------
  if (emergency === "None") {
    lastCctvSignal[location] = now;
    confirmed = false; // CCTV never confirms
  }

  // -------------------------------
  // CASE 2: FIELD STAFF INPUT
  // -------------------------------
  else {
    const lastCctvTime = lastCctvSignal[location];

    // Confirm only if CCTV was recent (2 minutes)
    if (lastCctvTime && now - lastCctvTime <= 2 * 60 * 1000) {
      confirmed = true;
    } else {
      confirmed = false;
    }
  }

  const alert = {
    location,
    crowdLevel,
    emergency,
    confirmed,
    timestamp: now,
    time: new Date(now).toLocaleTimeString()
  };

  alerts.push(alert);

  // Update zone status (visual only)
  zoneStatus[location] = crowdLevel;

  res.json({
    success: true,
    confirmed
  });
});

// ===============================
// DASHBOARD API
// ===============================
app.get("/dashboard", (req, res) => {
  res.json({
    alerts,
    zones: zoneStatus,
    advisory: generateAdvisory(alerts)
  });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
