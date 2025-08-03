const express = require("express");
const User = require("../models/User"); // make sure this exists

const router = express.Router();

// ✅ Create a new user in MongoDB
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// ✅ Get user by UID
router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update user by UID
router.put("/:uid", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      req.body,
      { new: true } // Return updated user
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;