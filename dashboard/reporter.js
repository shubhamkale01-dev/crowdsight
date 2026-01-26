const API_URL = "https://crowdsight-backend.onrender.com";

let emergencyInterval = null;
let countdown = 15;
let activeEmergency = null;
let emergencyActive = false; // 🔒 NEW FLAG

/* NORMAL SEND (UNCHANGED) */
function send(level, emergency = "None") {
  fetch(`${API_URL}/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: document.getElementById("location").value,
      crowdLevel: level,
      emergency: emergency
    })
  })
    .then(res => res.json())
    .then(() => alert("Report sent successfully"))
    .catch(() => alert("Failed to send report"));
}

/* START EMERGENCY TIMER */
function startEmergency(type) {
  if (emergencyActive) return; // 🚫 block double start

  emergencyActive = true;
  activeEmergency = type;
  countdown = 15;

  document.getElementById("emergencyText").innerText = type;
  document.getElementById("timerCount").innerText = countdown;
  document.getElementById("emergencyTimer").style.display = "block";
  document.getElementById("undoBtn").style.display = "block";

  emergencyInterval = setInterval(() => {
    countdown--;
    document.getElementById("timerCount").innerText = countdown;

    if (countdown === 0) {
      send("HIGH", activeEmergency);
      clearEmergency();
    }
  }, 1000);
}

/* UNDO */
function undoEmergency() {
  clearEmergency();
  alert("Emergency cancelled"); // ✅ visible confirmation
}

/* CLEAR TIMER (FIXED) */
function clearEmergency() {
  clearInterval(emergencyInterval);
  emergencyInterval = null;
  activeEmergency = null;
  emergencyActive = false; // 🔓 RELEASE LOCK

  document.getElementById("emergencyTimer").style.display = "none";
  document.getElementById("undoBtn").style.display = "none";
}

/* CLOCK */
function updateTime() {
  const t = document.getElementById("time");
  if (t) t.innerText = new Date().toLocaleString();
}

setInterval(updateTime, 1000);
updateTime();