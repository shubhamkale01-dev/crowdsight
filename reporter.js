const API_URL = "https://YOUR_RENDER_URL.onrender.com";

function send(level, emergency = "None") {
  fetch(`${API_URL}/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: document.getElementById("location").value,
      crowdLevel: level,
      emergency: emergency
    })
  }).then(() => {
    alert("Report sent successfully");
  });
}

function updateTime() {
  document.getElementById("time").innerText = new Date().toLocaleString();
}

setInterval(updateTime, 1000);
updateTime();
