const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    memberId: { type: String, required: false },
    name: { type: String, required: true },
    dosage: { type: String },
    beforeAfterFood: { type: String },
    timesPerDay: { type: Number },
    durationDays: { type: Number },
    startDate: { type: String },
    endDate: { type: String },
    notes: { type: String },
    reminderTimes: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", MedicineSchema);
