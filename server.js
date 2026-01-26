const express = require("express");
const cors = require("cors");
const path = require("path");

const generateAIAdvisory = require("./aiAdvisory");

const app = express(); // ✅ MUST COME BEFORE app.use

app.use(cors());
app.use(express.json());

// ✅ Serve frontend files (dashboard.html, js, css)
app.use(express.static(path.join(__dirname)));

/***********************
 * ROOT CHECK
 ***********************/
app.get("/", (req, res) => {
  res.send("CrowdSight Backend is running 🚀");
});

/***********************
 * DATA
 ***********************/
const lastCctvSignal = {};
let alerts = [];

let zoneStatus = {
  "Railway Station": "NORMAL",
  "Bus Stand": "NORMAL",
  "Ramkund Ghat": "NORMAL"
};

/***********************
 * ENTRY API
 ***********************/
app.post("/entry", (req, res) => {
  const { location, crowdLevel, emergency } = req.body;

  const now = Date.now();
  let confirmed = false;

  // CCTV input
  if (emergency === "None") {
    lastCctvSignal[location] = now;
  }
  // Field staff input
  else {
    const lastCctvTime = lastCctvSignal[location];
    if (lastCctvTime && now - lastCctvTime <= 2 * 60 * 1000) {
      confirmed = true;
    }
  }

  const alert = {
    location,
    crowdLevel,
    emergency,
    confirmed,
    time: new Date().toISOString()
  };

  alerts.push(alert);
  zoneStatus[location] = crowdLevel;

  res.json({ success: true, confirmed });
});

/***********************
 * DASHBOARD API
 ***********************/
app.get("/dashboard", (req, res) => {
  res.json({
    alerts,
    zones: zoneStatus,
    advisory: generateAIAdvisory(alerts, zoneStatus)
  });
});

/***********************
 * START SERVER
 ***********************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
