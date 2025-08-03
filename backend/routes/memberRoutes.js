// routes/members.js
const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

router.post("/", async (req, res) => {
  try {
    const { userId, memberName, email, age, dob, phone, medicalHistory } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Member email is required" });
    }

    const newMember = new Member({
      userId,
      memberName,
      email,
      age,
      dob,
      phone,
      medicalHistory
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    console.error("❌ Error adding member:", err.message);
    res.status(500).json({ error: err.message });
  }
});


router.get("/:userId", async (req, res) => {
  try {
    const members = await Member.find({ userId: req.params.userId });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/single/:id", async (req, res) => {
  const member = await Member.findById(req.params.id);
  res.json(member);
});

router.delete("/:id", async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
router.put("/:id", async (req, res) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    );

    if (!updatedMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(updatedMember);
  } catch (err) {
    console.error("Error updating member:", err.message);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
