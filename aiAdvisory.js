function generateAIAdvisory(alerts, zones) {
  if (alerts.length === 0) {
    return "Situation stable. Continue monitoring.";
  }

  const last = alerts[alerts.length - 1];

  // Emergency has highest priority
  if (last.emergency && last.emergency !== "None") {
    return `CRITICAL: ${last.emergency} reported at ${last.location}. Activate emergency response.`;
  }

  // Count HIGH zones
  const highZones = Object.entries(zones)
    .filter(([_, status]) => status === "HIGH")
    .map(([zone]) => zone);

  if (highZones.length >= 2) {
    return `CRITICAL: Multiple overcrowded zones (${highZones.join(", ")}). Crowd diversion required.`;
  }

  if (last.crowdLevel === "HIGH") {
    return `WARNING: High crowd density at ${last.location}. Deploy additional staff.`;
  }

  if (last.crowdLevel === "MEDIUM") {
    return `CAUTION: Crowd building up at ${last.location}. Monitor closely.`;
  }

  return "Situation stable. Continue monitoring.";
}

module.exports = generateAIAdvisory;