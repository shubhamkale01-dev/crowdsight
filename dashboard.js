/***********************
 * GLOBAL STATE
 ***********************/
let currentAdvisoryTab = "summary";
const API_URL = "https://crowdsight-backend.onrender.com";

let lastAlerts = [];
let advisoryData = {};
let evacuationLayer = null;
const markers = {};

/***********************
 * TIME
 ***********************/
function updateTime() {
  document.getElementById("time").innerText =
    new Date().toLocaleString();
}

/***********************
 * CONFIDENCE SCORE (PROBABILITY ONLY)
 ***********************/
function calculateConfidence(a) {
  let score = 0;

  // CCTV vs Field weight
  if (a.emergency !== "None") score += 0.6;
  else score += 0.3;

  if (a.crowdLevel === "HIGH") score += 0.3;
  else if (a.crowdLevel === "MEDIUM") score += 0.2;
  else score += 0.1;

  return Math.min(score, 1);
}

/***********************
 * MAP SETUP
 ***********************/
const locations = {
  "Railway Station": [20.0059, 73.7897],
  "Bus Stand": [20.0006, 73.7810],
  "Ramkund Ghat": [20.0063, 73.7889]
};

const emergencyContacts = {
  "Medical Emergency": "+919356781972",
  "Fire Hazard": "+91101",
  "Law & Order Issue": "+91100",
  "Stampede Risk": "+91100"
};

const map = L.map("map").setView([20.0059, 73.7897], 14);
setTimeout(() => map.invalidateSize(), 300);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "© OpenStreetMap" }
).addTo(map);

/***********************
 * MAP HELPERS
 ***********************/
function getColor(level) {
  if (level === "HIGH") return "red";
  if (level === "MEDIUM") return "orange";
  return "green";
}

function pulseIcon(color) {
  return L.divIcon({
    className: "pulse-marker",
    html: `<div class="pulse ${color}"></div>`,
    iconSize: [20, 20]
  });
}

/***********************
 * DASHBOARD FETCH
 ***********************/
function loadDashboard() {
  fetch(`${API_URL}/dashboard`)
    .then(res => res.json())
    .then(data => {
      lastAlerts = data.alerts;
      updateAlerts(lastAlerts);
      updateMap(data.zones, lastAlerts);
      buildAdvisory(data);
      showAdvisory(currentAdvisoryTab);
    });
}

/***********************
 * ALERT HISTORY
 ***********************/
function updateAlerts(alerts) {
  const box = document.getElementById("alerts");
  box.innerHTML = "";

  alerts.slice().reverse().forEach((a, i) => {
    const confidence = calculateConfidence(a);
    const confidencePct = Math.round(confidence * 100);

    const source = a.emergency === "None" ? "CCTV AI" : "Field Staff";

    box.innerHTML += `
      <div class="alert-item ${a.confirmed ? "alert-critical" : ""}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
  <strong>${a.location}</strong>
  <span style="
    font-weight:bold;
    color:${confidence >= 0.75 ? 'red' : confidence >= 0.5 ? 'orange' : 'green'};
  ">
    Confidence: ${confidencePct}%
  </span>
</div>


        <div>
          Severity: <b>${a.crowdLevel}</b><br>
          Emergency: ${a.emergency}
        </div>

        <small>
          ${a.time} · ${source} ·
          ${a.confirmed ? "CONFIRMED" : "UNVERIFIED"}
        </small>

        <div style="margin-top:6px;">
          <button onclick="expandAlert(${i})">Details</button>
        </div>
      </div>
      <hr>
    `;
  });
}

function expandAlert(index) {
  const a = lastAlerts[index];

  alert(
`WHY:
Source: ${a.emergency === "None" ? "CCTV AI" : "Field Staff"}
Crowd Level: ${a.crowdLevel}
Emergency: ${a.emergency}

STATUS:
${a.confirmed ? "CONFIRMED BY FIELD + CCTV" : "AWAITING CONFIRMATION"}`
  );
}

/***********************
 * MAP UPDATE (CONFIRMATION-GATED)
 ***********************/
function updateMap(zones, alerts) {
  if (evacuationLayer) map.removeLayer(evacuationLayer);
  evacuationLayer = L.layerGroup().addTo(map);

  for (let zone in zones) {
    const coord = locations[zone];
    if (!coord) continue;

    if (markers[zone]) map.removeLayer(markers[zone]);

    const last = alerts.filter(a => a.location === zone).slice(-1)[0];
    const confirmed = last && last.confirmed === true;
    const color = getColor(zones[zone]);

    markers[zone] = confirmed
      ? L.marker(coord, { icon: pulseIcon(color) })
      : L.circleMarker(coord, {
          radius: 8,
          color,
          fillOpacity: 0.4
        });

    markers[zone]
      .addTo(map)
      .bindPopup(`
        <b>${zone}</b><br>
        Status: ${zones[zone]}<br>
        ${confirmed && emergencyContacts[last.emergency]
          ? `<a href="tel:${emergencyContacts[last.emergency]}">🚨 Call Response</a>`
          : "Monitoring only"}
      `);

    if (confirmed) {
      L.polyline(
        [coord, [coord[0] + 0.002, coord[1] + 0.002]],
        { color: "blue", dashArray: "6,6" }
      ).addTo(evacuationLayer);
    }
  }
}

/***********************
 * AI ADVISORY
 ***********************/
function buildAdvisory(data) {
  const last = data.alerts.slice(-1)[0];

  if (!last) {
    advisoryData = {
      summary: "Situation stable.",
      why: "No abnormal signals.",
      action: "Continue monitoring."
    };
    return;
  }

  advisoryData = {
    summary: data.advisory,
    why: last.confirmed
      ? "Field staff confirmed the AI-detected risk."
      : "AI detected elevated crowd. Awaiting confirmation.",
    action: last.confirmed
      ? "Initiate emergency response."
      : "Monitor and verify."
  };
}

function showAdvisory(type) {
  currentAdvisoryTab = type;
  document.getElementById("aiAdvisoryText").innerText =
    advisoryData[type] || "";
}

/***********************
 * INIT
 ***********************/
setInterval(updateTime, 1000);
setInterval(loadDashboard, 2000);

updateTime();
loadDashboard();
