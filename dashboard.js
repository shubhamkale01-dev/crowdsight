function updateTime() {
  document.getElementById("time").innerText = new Date().toLocaleString();
}

const API_URL = "https://crowdsight-backend.onrender.com";

function loadDashboard() {
  fetch(`${API_URL}/dashboard`)
    .then(res => res.json())
    .then(data => {
      const alertBox = document.getElementById("alerts");
      alertBox.innerHTML = "";
      data.alerts.forEach(a => {
        alertBox.innerHTML += `<div>${a.location} - ${a.crowdLevel}<br>${a.emergency} (${a.time})</div><hr>`;
      });

      for (let zone in data.zones) {
        const el = document.getElementById(zone);
        if (el) {
          el.className = "zone " + data.zones[zone].toLowerCase();
          el.querySelector("span").innerText = data.zones[zone];
        }
      }

      document.getElementById("aiAdvisoryText").innerText = data.advisory;
    });
}

setInterval(updateTime, 1000);
setInterval(loadDashboard, 2000);
updateTime();
loadDashboard();
