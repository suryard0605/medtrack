const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const Member = require("../models/Member");
const User = require("../models/User");
const MedicineLog = require("../models/MedicineLog"); // ✅ Import log model
const { sendEmail } = require("../utils/emailService");
const { sendSMS } = require("../utils/smsService");
const cron = require("node-cron");

/**
 * ✅ Add Medicine
 */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      memberId,
      name,
      dosage,
      beforeAfterFood,
      timesPerDay,
      durationDays,
      startDate,
      endDate,
      notes,
      reminderTimes
    } = req.body;

    const newMedicine = new Medicine({
      userId,
      memberId,
      name,
      dosage,
      beforeAfterFood,
      timesPerDay,
      durationDays,
      startDate,
      endDate,
      notes,
      reminderTimes: Array.isArray(reminderTimes) ? reminderTimes : []
    });

    await newMedicine.save();

    // Fetch related user & member for notifications
    const member = await Member.findById(memberId);
    const user = await User.findOne({ uid: userId });

    const recipientsEmail = [];
    const recipientsPhone = [];

    if (user?.email) recipientsEmail.push(user.email);
    if (member?.email) recipientsEmail.push(member.email);
    if (user?.phone) recipientsPhone.push(user.phone);
    if (member?.phone) recipientsPhone.push(member.phone);

    // Email notification
    if (recipientsEmail.length > 0) {
      await sendEmail(
        recipientsEmail,
        `💊 New Medicine Added: ${newMedicine.name}`,
        `Hello,\n\nA new medicine has been added for ${member?.memberName || "your family member"}.\n\n` +
        `Medicine: ${newMedicine.name}\n` +
        `Dosage: ${newMedicine.dosage}\n` +
        `Times per day: ${newMedicine.timesPerDay}\n` +
        `Duration: ${newMedicine.durationDays} days\n` +
        `Start Date: ${newMedicine.startDate || "Not set"}\n\n` +
        `Please make sure to follow the schedule.`
      );
    }

    // SMS notification
    recipientsPhone.forEach(num => {
      sendSMS(`+91${num}`, `💊 New Medicine Added: ${newMedicine.name} for ${member?.memberName || "you"}`);
    });

    res.status(201).json(newMedicine);
  } catch (err) {
    console.error("❌ Error adding medicine:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ Save Medicine Log (Taken / Missed)
 */
router.post("/logs", async (req, res) => {
  try {
    const { userId, memberId, medicineId, status, time } = req.body; // status = "taken" or "missed"

    if (!userId || !medicineId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newLog = new MedicineLog({
      userId,
      memberId,
      medicineId,
      status,
      time: time ? new Date(time) : new Date()
    });

    await newLog.save();
    res.json({ success: true, log: newLog });
  } catch (err) {
    console.error("❌ Error saving medicine log:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ Get medicines for a user (optional member filter)
 */
router.get("/", async (req, res) => {
  try {
    const { userId, memberId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const query = { userId };
    if (memberId) query.memberId = memberId;

    const medicines = await Medicine.find(query);
    res.json(medicines);
  } catch (err) {
    console.error("❌ Error fetching medicines:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ✅ Get medicines due right now for a specific user
 */
router.get("/:userId/due", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const medicines = await Medicine.find({ userId });

    const due = medicines.filter(med =>
      med.reminderTimes?.some(time => time === currentTime)
    );

    res.json(due);
  } catch (err) {
    console.error("❌ Error fetching due medicines:", err.message);
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Medicine.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    );

    if (!updated) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating medicine:", err.message);
    res.status(500).json({ message: err.message });
  }
});
/**
 * ✅ CRON: Check every minute for reminders and send notifications
 */
cron.schedule("* * * * *", async () => {
  console.log("⏳ Checking for medicine reminders...");

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  try {
    const medicines = await Medicine.find();

    for (const med of medicines) {
      if (!med.reminderTimes) continue;

      med.reminderTimes.forEach(async (time) => {
        const [hour, minute] = time.split(":").map(Number);

        if (hour === currentHour && minute === currentMinute) {
          const member = await Member.findById(med.memberId);
          const user = await User.findOne({ uid: med.userId });

          const recipientsEmail = [];
          const recipientsPhone = [];

          if (user?.email) recipientsEmail.push(user.email);
          if (member?.email) recipientsEmail.push(member.email);
          if (user?.phone) recipientsPhone.push(user.phone);
          if (member?.phone) recipientsPhone.push(member.phone);

          // Email reminder
          if (recipientsEmail.length > 0) {
            await sendEmail(
              recipientsEmail,
              `💊 Medicine Reminder: ${med.name}`,
              `Hello ${member?.memberName || "User"},\n\n` +
              `This is your reminder to take your medicine:\n\n` +
              `Name: ${med.name}\n` +
              `Dosage: ${med.dosage}\n` +
              `Time: ${time}\n` +
              `Instructions: ${med.beforeAfterFood}\n\n` +
              `Stay Healthy!`
            );
          }

          // SMS reminder
          recipientsPhone.forEach(num => {
            sendSMS(`+91${num}`, `💊 Reminder: Take ${med.name} (${med.dosage}) now.`);
          });
        }
      });
    }
  } catch (error) {
    console.error("❌ Error in reminder job:", error.message);
  }
});

module.exports = router;
