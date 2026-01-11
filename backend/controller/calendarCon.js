import PlantCareSchedule from "../models/PlantCareSchedule.js";

export const getMonthSchedules = async (req, res) => {
  try {
    const { userId } = req.params;
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!userId || isNaN(year) || isNaN(month)) {
      console.warn("Invalid params:", { userId, year, month });
      return res.json([]);
    }

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const schedules = await PlantCareSchedule.find({
      userId,
      scheduledDate: { $gte: start, $lte: end },
    }).sort({ scheduledDate: 1 });

    console.log(`📅 Fetched ${schedules.length} schedules for ${userId} in ${month + 1}/${year}`);
    res.json(schedules || []);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json([]);
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { userId, plantId, plantName, careType, scheduledDate } = req.body;
    
    console.log("📝 Creating schedule:", { userId, plantId, plantName, careType });
    
    if (!userId || !plantId || !plantName || !careType || !scheduledDate) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["userId", "plantId", "plantName", "careType", "scheduledDate"]
      });
    }

    const schedule = new PlantCareSchedule({
      ...req.body,
      scheduledDate: new Date(scheduledDate),
      completed: false,
    });
    
    const saved = await schedule.save();
    console.log("✅ Schedule created:", saved._id);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating schedule:", err);
    res.status(500).json({ error: "Create failed", message: err.message });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    console.log("✏️ Updating schedule:", scheduleId);
    
    const updated = await PlantCareSchedule.findByIdAndUpdate(
      scheduleId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    console.log("✅ Schedule updated:", scheduleId);
    res.json(updated);
  } catch (err) {
    console.error("Error updating schedule:", err);
    res.status(500).json({ error: "Update failed", message: err.message });
  }
};

export const markCompleted = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { completed } = req.body;
    
    console.log("✓ Marking schedule completed:", { scheduleId, completed });
    
    const updated = await PlantCareSchedule.findByIdAndUpdate(
      scheduleId,
      { completed },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error marking completed:", err);
    res.status(500).json({ error: "Failed", message: err.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    console.log("🗑️ Deleting schedule:", scheduleId);
    
    const deleted = await PlantCareSchedule.findByIdAndDelete(scheduleId);
    
    if (!deleted) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    
    console.log("✅ Schedule deleted:", scheduleId);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: "Delete failed", message: err.message });
  }
};
