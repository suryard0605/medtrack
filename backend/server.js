const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const medicineRoutes = require("./routes/medicineRoutes");
const memberRoutes = require("./routes/memberRoutes");
const userRoutes = require("./routes/users"); // ✅ our fixed users route
const medicineLogsRoutes = require("./routes/medicineLogs");
const app = express();

app.use(cors({ origin: "*"}));

app.use(express.json());

app.use("/api/medicines", medicineRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/users", userRoutes); // ✅ mount here
app.use("/api/medicine-logs", medicineLogsRoutes);
app.use("/api/medicineLogs", medicineLogsRoutes); // For Dashboard compatibility
app.get("/", (req, res) => {
  res.send("API is running...");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
