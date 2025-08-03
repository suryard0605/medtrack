const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID of main user
  memberName: { type: String, required: true },
  email: { type: String, required: true }, // ✅ member's own email
  age: String,
  dob: String,
  phone: String,
  medicalHistory: String
}, { timestamps: true });

module.exports = mongoose.model("Member", memberSchema);
