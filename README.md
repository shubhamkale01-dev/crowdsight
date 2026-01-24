# 🚦 CrowdSight – Real-Time Crowd Monitoring System

CrowdSight is a **full-stack web application** designed to monitor crowd density in real time and provide AI-based advisories for public safety management.  
The system consists of **two dashboards**:

1. **Reporter Dashboard** – used by field staff to submit live crowd reports  
2. **Control Dashboard** – used by authorities to monitor crowd status and receive advisories  

Both frontend and backend are **fully deployed on Render** and connected via live APIs.

---

## 🌐 Live Demo Links

### 🔹 Reporter Dashboard (Field Staff)
Submit crowd density reports in real time  
👉 **Live URL:**  
https://crowdsight-frontend.onrender.com/reporter.html

---

### 🔹 Control Dashboard (Authorities)
Monitor crowd status, alerts, and AI advisory  
👉 **Live URL:**  
https://crowdsight-frontend.onrender.com/dashboard.html

---

### 🔹 Backend API (Render – Node.js + Express)
Handles reports, alerts, an

Project Structure
crowdsight/
│
├── server.js               # Backend server
├── aiAdvisory.js           # AI advisory logic
│
├── index.html              # Landing page
├── reporter.html           # Reporter dashboard
├── reporter.js
├── reporter.css
│
├── dashboard.html          # Control dashboard
├── dashboard.js
├── dashboard.css
│
├── package.json
├── render.yaml
└── README.md
