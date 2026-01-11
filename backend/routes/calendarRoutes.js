import express from "express";
import {
  getMonthSchedules,
  createSchedule,
  updateSchedule,
  markCompleted,
  deleteSchedule,
} from "../controller/calendarCon.js";

const router = express.Router();

router.get("/month/:userId", getMonthSchedules);
router.post("/create", createSchedule);
router.put("/:scheduleId", updateSchedule);
router.patch("/:scheduleId/complete", markCompleted);
router.delete("/:scheduleId", express.json(), deleteSchedule);

export default router;
