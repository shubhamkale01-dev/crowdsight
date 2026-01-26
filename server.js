const express = require("express");

const app = express(); // MUST come before app.use

app.use(express.json());

app.get("/", (req, res) => {
  res.send("CrowdSight backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});