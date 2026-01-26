let autoZoomLocked =false;
let currentAdvisoryTab = "summary";

function updateTime() {
  document.getElementById("time").innerText = new Date().toLocaleString();
}

const API_URL = "https://crowdsight-backend.onrender.com";

/* ================= MAP SETUP ================= */

const locations = {
  "Railway Station": [20.0059, 73.7897],
  "Bus Stand": [20.0006, 73.7810],
  "Ramkund Ghat": [20.0063, 73.7889]
};

// Emergency contacts (demo)
const emergencyContacts = {
  "Medical Emergency": "+919356781972",
  "Fire Hazard": "+91101",
  "Law & Order Issue": "+91100",
  "Stampede Risk": "+91100"
};

// Map init
const map = L.map("map").setView([20.0059, 73.7897], 14);

// Base layers
const baseMaps = {
  "Standard Map": L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap" }
  ),
  "High-Quality (Satellite)": L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "© Esri" }
  )
};

// Default map
baseMaps["Standard Map"].addTo(map);
L.control.layers(baseMaps).addTo(map);

const markers = {};
let lastAlerts = [];
let advisoryData = {};
let evacuationLayer = null;

/* Marker color */
function getColor(status) {
  if (status === "HIGH") return "red";
  if (status === "MEDIUM") return "orange";
  return "green";
}

/* Pulsing icon = FIELD CONFIRMED */
function pulseIcon(color) {
  return L.divIcon({
    className: "pulse-marker",
    html: `<div class="pulse ${color}"></div>`,
    iconSize: [20, 20]
  });
}

/* ================= DASHBOARD ================= */

function loadDashboard() {
  fetch(`${API_URL}/dashboard`)
    .then(res => res.json())
    .then(data => {
      lastAlerts = data.alerts;
      buildAdvisory(data);
      updateAlerts(data.alerts);
      updateMap(data.zones, data.alerts);
      showAdvisory(currentAdvisoryTab);
    });
}

/* ========== ALERT HISTORY ========== */

function updateAlerts(alerts) {
  const box = document.getElementById("alerts");
  box.innerHTML = "";

  alerts.slice().reverse().forEach((a, i) => {
    const source = a.emergency === "None" ? "CCTV AI" : "Field Staff";

    box.innerHTML += `
      <div onclick="expandAlert(${i})">
        <b>${a.location}</b><br>
        ${a.crowdLevel} | ${a.emergency}
        <br><small>${a.time} · Source: ${source}</small>
        <br>
        <button onclick="acknowledge(event)">Acknowledge</button>
      </div><hr>
    `;
  });
}

function expandAlert(index) {
  const a = lastAlerts[index];
  const isField = a.emergency !== "None";

  let responseText = "Verification required";
  if (isField && emergencyContacts[a.emergency]) {
    responseText = `Initiate Response → ${emergencyContacts[a.emergency]}`;
  }

  alert(
`WHY:
Source: ${isField ? "Field Staff" : "CCTV AI"}
Crowd Level: ${a.crowdLevel}
Emergency: ${a.emergency}

ACTION:
${isField ? "Initiate departmental response" : "Verify via field staff"}

${responseText}`
  );
}

function acknowledge(e) {
  e.stopPropagation();
  alert("Response acknowledged by control room");
}

/* ========== MAP + 1️⃣ AUTO-SATELLITE + 2️⃣ EVACUATION ========== */

function updateMap(zones, alerts) {

  const hasActiveEmergency = alerts.some(a => a.emergency !== "None");
if (!hasActiveEmergency) {
  autoZoomLocked = false; // 🔓 allow future emergencies
}

  // Clear evacuation layer
  if (evacuationLayer) map.removeLayer(evacuationLayer);
  evacuationLayer = L.layerGroup().addTo(map);

  for (let zone in zones) {
    const status = zones[zone];
    const coord = locations[zone];
    if (!coord) continue;

    if (markers[zone]) map.removeLayer(markers[zone]);

    const last = alerts.filter(a => a.location === zone).slice(-1)[0];
    const isFieldConfirmed = last && last.emergency !== "None";
    const isCctvSignal = last && last.emergency === "None";
    const color = getColor(status);

    /* Marker logic */
    markers[zone] = isFieldConfirmed
      ? L.marker(coord, { icon: pulseIcon(color) })
      : isCctvSignal
        ? L.circleMarker(coord, {
            radius: 8,
            color,
            dashArray: "4,4",
            fillOpacity: 0.4
          })
        : L.circleMarker(coord, {
            radius: 10,
            color,
            fillColor: color,
            fillOpacity: 0.8
          });

    markers[zone]
      .addTo(map)
      .bindPopup(`
        <b>${zone}</b><br>
        Status: ${status}<br>
        Source: ${isFieldConfirmed ? "Field Staff" : "CCTV AI"}<br>
        ${isFieldConfirmed && emergencyContacts[last.emergency]
          ? `<a href="tel:${emergencyContacts[last.emergency]}"
               style="color:red;font-weight:bold;">🚨 Initiate Response</a>`
          : "<small>Await confirmation</small>"}
      `);

    /* 1️⃣ Auto-suggest Satellite */
   if (isFieldConfirmed && !autoZoomLocked) {
  baseMaps["High-Quality (Satellite)"].addTo(map);
  map.setView(coord, 16);
  autoZoomLocked = true; // 🔒 zoom only once
}

    /* 2️⃣ Evacuation Route (simulated) */
    if (isFieldConfirmed) {
      L.polyline(
        [coord, [coord[0] + 0.002, coord[1] + 0.002]],
        { color: "blue", dashArray: "6,6" }
      ).addTo(evacuationLayer);
    }
  }
}

/* ========== INCIDENT REPLAY ========== */

function replayIncident() {
  let i = 0;
  const seq = [...lastAlerts];

  const interval = setInterval(() => {
    if (i >= seq.length) return clearInterval(interval);
    updateMap({ [seq[i].location]: seq[i].crowdLevel }, [seq[i]]);
    i++;
  }, 1500);
}

/* ========== EXPLAINABLE ADVISORY ========== */

function buildAdvisory(data) {
  const last = data.alerts.slice(-1)[0];

  if (!last) {
    advisoryData = {
      summary: "Situation stable. Monitoring via CCTV and field staff.",
      why: "No abnormal signals detected.",
      action: "Continue monitoring."
    };
    return;
  }

  const source = last.emergency === "None"
    ? "CCTV AI detected elevated crowd density."
    : "Field staff confirmed an emergency.";

  advisoryData = {
    summary: data.advisory,
    why: `${source}
Location: ${last.location}
Crowd Level: ${last.crowdLevel}`,
    action:
      last.emergency === "None"
        ? "Await field confirmation."
        : "Initiate departmental response."
  };
}

function showAdvisory(type) {
  currentAdvisoryTab = type;
  document.getElementById("aiAdvisoryText").innerText =
    advisoryData[type] || "";
}

/* ================= TIMERS ================= */

setInterval(updateTime, 1000);
setInterval(loadDashboard, 2000);
updateTime();
loadDashboard();