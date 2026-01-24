const API_URL = "https://crowdsight-backend.onrender.com";

function send(level, emergency = "None") {
  fetch(`${API_URL}/entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: document.getElementById("location").value,
      crowdLevel: level,
      emergency: emergency
    })
  .then(res => res.json())
.then(data => {
  console.log("Backend response:", data);
  alert("Report sent successfully");
})
.catch(err => {
  console.error("Error:", err);
  alert("Failed to send report");
});

}

function updateTime() {
  document.getElementById("time").innerText = new Date().toLocaleString();
}

setInterval(updateTime, 1000);
updateTime();
