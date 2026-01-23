const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let alerts = [];
let zoneStatus = {
  "Railway Station": "NORMAL",
  "Bus Stand": "NORMAL",
  "Ramkund Ghat": "NORMAL"
};

function generateAdvisory(alerts) {
  if (alerts.length === 0) return "Situation stable. Continue monitoring.";
  
  const last = alerts[alerts.length - 1];
  if (last.emergency && last.emergency !== "None") {
    return "CRITICAL: Emergency detected. Activate response teams.";
  }
  if (last.crowdLevel === "HIGH") {
    return "WARNING: High crowd density. Deploy additional staff.";
  }
  if (last.crowdLevel === "MEDIUM") {
    return "CAUTION: Crowd building up. Monitor closely.";
  }
  return "Situation stable. Continue monitoring.";
}

app.get("/", (req, res) => {
  res.json({ message: "Crowdsight Backend Running", status: "OK" });
});

app.post("/entry", (req, res) => {
  const { location, crowdLevel, emergency = "None" } = req.body;

  const alert = {
    location,
    crowdLevel,
    emergency,
    time: new Date().toLocaleTimeString()
  };

  alerts.push(alert);
  zoneStatus[location] = crowdLevel;

  res.json({ success: true });
});

app.get("/dashboard", (req, res) => {
  res.json({
    alerts,
    zones: zoneStatus,
    advisory: generateAdvisory(alerts)
  });
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});