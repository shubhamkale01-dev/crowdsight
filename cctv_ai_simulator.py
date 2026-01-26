import time
import requests
import random

API_URL = "https://crowdsight-backend.onrender.com/entry"

LOCATION = "Bus Stand"

print("🎥 CCTV AI started (simulation)...")

while True:
    people_count = random.randint(300, 500)

    if people_count > 420:
        level = "HIGH"
    elif people_count > 250:
        level = "MEDIUM"
    else:
        level = "LOW"

    payload = {
        "location": LOCATION,
        "crowdLevel": level,
        "emergency": "None"
    }

    try:
        res = requests.post(API_URL, json=payload, timeout=5)
        print(f"Sent → {LOCATION} | {level} | People: {people_count}")
    except Exception as e:
        print("Error sending data", e)

    time.sleep(5)