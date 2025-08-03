const mongoose = require("mongoose");

const medicineLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: false },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  status: { type: String, enum: ["taken", "missed"], required: true },
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicineLog", medicineLogSchema);
