import time
import requests

API_URL = "https://crowdsight-backend.onrender.com/entry"

# Simulated timeline (seconds → AI output)
events = [
    (5,  "Railway Station", "MEDIUM", "None", 230),
    (10, "Railway Station", "HIGH", "None", 410),
    (15, "Bus Stand", "HIGH", "Medical Emergency", 520),
    (25, "Ramkund Ghat", "MEDIUM", "None", 260)
]

print("🎥 Playing recorded CCTV video...")
start = time.time()

for t, location, level, emergency, count in events:
    while time.time() - start < t:
        time.sleep(0.5)

    payload = {
        "location": location,
        "crowdLevel": level,
        "emergency": emergency,
        "peopleCount": count,
        "source": "CCTV AI"
    }

    requests.post(API_URL, json=payload)
    print(f"📡 {location} | {level} | People: {count}")

print("✅ Video analysis complete")