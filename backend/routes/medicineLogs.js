const express = require("express");
const router = express.Router();
const MedicineLog = require("../models/MedicineLog");
const Member = require("../models/Member");
const Medicine = require("../models/Medicine");

// POST - Save when medicine is taken
router.post("/", async (req, res) => {
  try {
    const { userId, memberId, medicineId, status } = req.body;

    if (!userId || !medicineId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newLog = new MedicineLog({
      userId,
      memberId: memberId || undefined,
      medicineId,
      status: status || "taken",
      time: new Date()
    });

    await newLog.save();
    res.status(201).json(newLog);
  } catch (err) {
    console.error("Error saving medicine log:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET - Get logs for analytics
router.get("/", async (req, res) => {
  try {
    const { userId, medicineId } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (medicineId) query.medicineId = medicineId;

    const logs = await MedicineLog.find(query).sort({ time: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET - Analytics for all members and main user
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Get all members for this user
    const members = await Member.find({ userId });
    
    const analytics = [];

    // First, add analytics for the main user (always show, even with 0 medicines)
    const mainUserMedicines = await Medicine.find({ 
      userId, 
      memberId: undefined
    });
    
    if (mainUserMedicines.length > 0) {
      const mainUserAnalytics = {
        member: {
          id: 'main',
          name: 'You',
          email: userId, // We'll get the actual email from the user data
          age: null,
          isMainUser: true
        },
        medicines: [],
        summary: {
          totalMedicines: mainUserMedicines.length,
          totalTaken: 0,
          totalMissed: 0,
          adherenceRate: 0
        }
      };

      for (const medicine of mainUserMedicines) {
        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
          dateFilter.time = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }

        // Get logs for this medicine (main user medicines have undefined memberId in logs)
        const logs = await MedicineLog.find({
          userId,
          medicineId: medicine._id,
          memberId: undefined,
          ...dateFilter
        });

        const takenCount = logs.filter(log => log.status === 'taken').length;
        const missedCount = logs.filter(log => log.status === 'missed').length;
        const totalCount = takenCount + missedCount;
        const adherenceRate = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

        mainUserAnalytics.medicines.push({
          id: medicine._id,
          name: medicine.name,
          dosage: medicine.dosage,
          timesPerDay: medicine.timesPerDay,
          taken: takenCount,
          missed: missedCount,
          adherenceRate: Math.round(adherenceRate * 100) / 100
        });

        mainUserAnalytics.summary.totalTaken += takenCount;
        mainUserAnalytics.summary.totalMissed += missedCount;
      }

      // Calculate overall adherence rate for main user
      const totalLogs = mainUserAnalytics.summary.totalTaken + mainUserAnalytics.summary.totalMissed;
      mainUserAnalytics.summary.adherenceRate = totalLogs > 0 
        ? Math.round((mainUserAnalytics.summary.totalTaken / totalLogs) * 100 * 100) / 100 
        : 0;

      analytics.push(mainUserAnalytics);
    } else {
      // Add main user analytics even if they have no medicines
      const mainUserAnalytics = {
        member: {
          id: 'main',
          name: 'You',
          email: userId,
          age: null,
          isMainUser: true
        },
        medicines: [],
        summary: {
          totalMedicines: 0,
          totalTaken: 0,
          totalMissed: 0,
          adherenceRate: 0
        }
      };
      analytics.push(mainUserAnalytics);
    }

    // Then add analytics for all family members
    for (const member of members) {
      // Get all medicines for this member
      const medicines = await Medicine.find({ userId, memberId: member._id.toString() });
      
      const memberAnalytics = {
        member: {
          id: member._id,
          name: member.memberName,
          email: member.email,
          age: member.age,
          isMainUser: false
        },
        medicines: [],
        summary: {
          totalMedicines: medicines.length,
          totalTaken: 0,
          totalMissed: 0,
          adherenceRate: 0
        }
      };

      for (const medicine of medicines) {
        // Build date filter
        const dateFilter = {};
        if (startDate && endDate) {
          dateFilter.time = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }

        // Get logs for this medicine
        const logs = await MedicineLog.find({
          userId,
          memberId: member._id,
          medicineId: medicine._id,
          ...dateFilter
        });

        const takenCount = logs.filter(log => log.status === 'taken').length;
        const missedCount = logs.filter(log => log.status === 'missed').length;
        const totalCount = takenCount + missedCount;
        const adherenceRate = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

        memberAnalytics.medicines.push({
          id: medicine._id,
          name: medicine.name,
          dosage: medicine.dosage,
          timesPerDay: medicine.timesPerDay,
          taken: takenCount,
          missed: missedCount,
          adherenceRate: Math.round(adherenceRate * 100) / 100
        });

        memberAnalytics.summary.totalTaken += takenCount;
        memberAnalytics.summary.totalMissed += missedCount;
      }

      // Calculate overall adherence rate for member
      const totalLogs = memberAnalytics.summary.totalTaken + memberAnalytics.summary.totalMissed;
      memberAnalytics.summary.adherenceRate = totalLogs > 0 
        ? Math.round((memberAnalytics.summary.totalTaken / totalLogs) * 100 * 100) / 100 
        : 0;

      analytics.push(memberAnalytics);
    }

    res.json(analytics);
  } catch (err) {
    console.error("Error getting analytics:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET - Daily trends for a specific member or main user
router.get("/trends/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;
    const { days = 30, userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Build query based on whether it's main user or a member
    const query = {
      userId, // Add userId filter to ensure data belongs to the logged-in user
      time: { $gte: startDate }
    };

    if (memberId === 'main') {
      // For main user, look for logs with undefined memberId
      query.memberId = undefined;
    } else {
      // For family members, look for logs with specific memberId
      query.memberId = memberId;
    }

    const logs = await MedicineLog.find(query).sort({ time: 1 });

    // Group by date
    const dailyData = {};
    logs.forEach(log => {
      const date = log.time.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { taken: 0, missed: 0 };
      }
      if (log.status === 'taken') {
        dailyData[date].taken++;
      } else {
        dailyData[date].missed++;
      }
    });

    // Convert to array format for charts
    const trends = Object.keys(dailyData).map(date => ({
      date,
      taken: dailyData[date].taken,
      missed: dailyData[date].missed,
      total: dailyData[date].taken + dailyData[date].missed
    }));

    res.json(trends);
  } catch (err) {
    console.error("Error getting trends:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
