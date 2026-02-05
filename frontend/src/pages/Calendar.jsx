import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import calendarAPI from "../api/calendarAPI";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userPlants, setUserPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredSchedule, setHoveredSchedule] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0, showBelow: false });
  const [completingSchedule, setCompletingSchedule] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    plantId: "",
    plantName: "",
    careType: "watering",
    description: "",
    scheduledDate: "",
    frequency: "once",
    priority: "medium",
    notes: "",
  });

  // Color mappings
  const careTypeColors = {
    watering: "bg-blue-200 text-blue-800",
    pruning: "bg-purple-200 text-purple-800",
    fertilizer: "bg-amber-200 text-amber-800",
    "repotting": "bg-green-200 text-green-800",
    "pest-check": "bg-red-200 text-red-800",
    spraying: "bg-cyan-200 text-cyan-800",
    other: "bg-gray-200 text-gray-800",
  };

  const priorityColors = {
    low: "border-green-300",
    medium: "border-amber-300",
    high: "border-red-300",
  };

  // Calendar helpers
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days
  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Fetch plants
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoadingPlants(true);
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_BASE}/user-plants/user`, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        if (!res.ok) throw new Error();
        setUserPlants(await res.json());
      } catch (err) {
        console.error("Error fetching plants:", err);
        setUserPlants([]);
      } finally {
        setLoadingPlants(false);
      }
    };
    fetchPlants();
  }, [token]);

  // Fetch schedules for current month
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await calendarAPI.getMonthSchedules(
          userId,
          currentDate.getFullYear(),
          currentDate.getMonth()
        );
        setSchedules(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading schedules:", err);
        setError("Failed to load schedules");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentDate, userId]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handlers
  const previousMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1));
  };

  const getDaySchedules = (day) => {
    return schedules.filter((s) => {
      const scheduleDate = new Date(s.scheduledDate);
      return (
        scheduleDate.getDate() === day &&
        scheduleDate.getMonth() === currentDate.getMonth() &&
        scheduleDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlantSelect = (e) => {
    const plantId = e.target.value;
    const selectedPlant = userPlants.find((p) => p._id === plantId);
    setFormData((prev) => ({
      ...prev,
      plantId,
      plantName: selectedPlant ? (selectedPlant.customName || selectedPlant.actualName) : "",
    }));
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      plantId: schedule.plantId || "",
      plantName: schedule.plantName,
      careType: schedule.careType,
      description: schedule.description || "",
      scheduledDate: schedule.scheduledDate.split("T")[0],
      frequency: schedule.frequency || "once",
      priority: schedule.priority || "medium",
      notes: schedule.notes || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      plantId: "",
      plantName: "",
      careType: "watering",
      description: "",
      scheduledDate: "",
      frequency: "once",
      priority: "medium",
      notes: "",
    });
    setEditingSchedule(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.plantId || !formData.scheduledDate) {
      setError("Please select a plant and date");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Cannot add tasks for past dates. Please select today or a future date.");
      return;
    }

    try {
      const payload = {
        userId,
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
      };

      const saved = editingSchedule
        ? await calendarAPI.updateSchedule(editingSchedule._id, payload)
        : await calendarAPI.createSchedule(payload);

      setSchedules(editingSchedule
        ? schedules.map(s => s._id === saved._id ? saved : s)
        : [...schedules, saved]
      );

      setSuccess(editingSchedule ? "Schedule updated!" : "Schedule created!");
      handleCloseModal();
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError("Failed to save schedule");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await calendarAPI.deleteSchedule(id, userId);
      setSchedules(schedules.filter(s => s._id !== id));
      setSuccess("Schedule deleted");
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError("Failed to delete schedule");
    }
  };

  const handleMarkComplete = async (s) => {
    if (completingSchedule === s._id) return; // Prevent double-clicks
    
    try {
      setError("");
      setCompletingSchedule(s._id);
      
      const newCompletedStatus = !s.completed;
      const updated = await calendarAPI.markCompleted(s._id, userId, newCompletedStatus);
      
      // Ensure the updated schedule has the correct completed status
      const updatedSchedule = {
        ...updated,
        completed: updated.completed !== undefined ? updated.completed : newCompletedStatus
      };
      
      // Update schedules with the response from server
      setSchedules(schedules.map(x => 
        x._id === s._id ? updatedSchedule : x
      ));
      
      setSuccess(newCompletedStatus ? "Task marked as complete! ✓" : "Task marked as incomplete");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating schedule:", err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Failed to update schedule. Please try again.";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    } finally {
      setCompletingSchedule(null);
    }
  };

  // ⚠ UI RENDER CODE BELOW IS IDENTICAL TO YOUR ORIGINAL
  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#37604b] mb-3 sm:mb-4">
            🌿 Dynamic Plant Calendar
          </h1>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-green-700 text-sm">
              {success}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border shadow-sm p-5">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  {monthName} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-600 p-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const daySchedules = day ? getDaySchedules(day) : [];
                  const cellDate = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isPastDate = cellDate && cellDate < today;

                  return (
                    <div
                      key={idx}
                      className={`min-h-24 p-2 rounded-lg transition relative ${
                        day
                          ? isPastDate
                            ? "bg-gray-100 opacity-50 border border-gray-300 cursor-not-allowed"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200 cursor-pointer"
                          : "bg-gray-200"
                      }`}
                      onClick={() => {
                        if (day && !isPastDate) {
                          setSelectedDay(day);
                          setFormData((prev) => ({
                            ...prev,
                            scheduledDate: new Date(
                              currentDate.getFullYear(),
                              currentDate.getMonth(),
                              day
                            )
                              .toISOString()
                              .split("T")[0],
                          }));
                          setEditingSchedule(null);
                          setShowModal(true);
                        }
                      }}
                      title={isPastDate ? "Cannot modify past dates" : daySchedules.length > 0 ? `${daySchedules.length} task(s) scheduled` : ""}
                    >
                      {day && (
                        <>
                          <p className="font-bold text-gray-800 mb-1">{day}</p>
                          <div className="space-y-1">
                            {daySchedules.map((schedule) => (
                              <div
                                key={schedule._id}
                                className={`text-xs p-1 rounded ${
                                  careTypeColors[schedule.careType]
                                } ${
                                  schedule.completed
                                    ? "opacity-50 line-through"
                                    : ""
                                } ${
                                  isPastDate ? "cursor-not-allowed" : "cursor-pointer"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isPastDate) {
                                    handleEditSchedule(schedule);
                                  }
                                }}
                                onMouseEnter={(e) => {
                                  setHoveredSchedule(schedule);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const viewportWidth = window.innerWidth;
                                  const viewportHeight = window.innerHeight;
                                  
                                  // Calculate position with boundary checks
                                  let x = rect.left + rect.width / 2;
                                  let y = rect.top;
                                  const tooltipHeight = 200; // estimated height
                                  const showBelow = y < tooltipHeight;
                                  
                                  // Adjust Y position based on direction
                                  if (showBelow) {
                                    y = rect.bottom + 10;
                                  } else {
                                    y = rect.top - 10;
                                  }
                                  
                                  // Keep tooltip within viewport horizontally
                                  const tooltipWidth = 280;
                                  if (x < tooltipWidth / 2) {
                                    x = tooltipWidth / 2 + 10;
                                  } else if (x > viewportWidth - tooltipWidth / 2) {
                                    x = viewportWidth - tooltipWidth / 2 - 10;
                                  }
                                  
                                  setHoverPosition({ x, y, showBelow });
                                }}
                                onMouseLeave={() => {
                                  setHoveredSchedule(null);
                                }}
                              >
                                {schedule.careType}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Tasks Sidebar */}
          <div className="lg:col-span-1">
            <div className=" bg-white rounded-2xl border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  📋 Upcoming Tasks
                </h3>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {schedules
                  .filter((s) => !s.completed)
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledDate) - new Date(b.scheduledDate)
                  )
                  .slice(0, 10)
                  .map((schedule) => (
                    <div
                      key={schedule._id}
                      className={`p-3 rounded-lg ${priorityColors[schedule.priority]} bg-white border`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {schedule.plantName}
                          </p>
                          <p className="text-xs text-gray-600 mb-1">
                            {schedule.careType}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(schedule.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleMarkComplete(schedule)}
                            disabled={completingSchedule === schedule._id}
                            className={`p-1 hover:bg-green-100 rounded transition ${
                              completingSchedule === schedule._id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title={schedule.completed ? "Mark as incomplete" : "Mark as complete"}
                          >
                            <Check 
                              size={16} 
                              className={`text-green-600 ${
                                completingSchedule === schedule._id ? 'animate-pulse' : ''
                              }`} 
                            />
                          </button>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-1 hover:bg-blue-100 rounded transition"
                          >
                            <Edit2 size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule._id)}
                            className="p-1 hover:bg-red-100 rounded transition"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {schedules.filter((s) => !s.completed).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No upcoming tasks! 🎉
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredSchedule && (
        <motion.div
          initial={{ opacity: 0, y: hoverPosition.showBelow ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: hoverPosition.showBelow ? -10 : 10 }}
          className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 max-w-xs pointer-events-none"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            transform: hoverPosition.showBelow 
              ? 'translate(-50%, 0)' 
              : 'translate(-50%, -100%)',
            marginTop: hoverPosition.showBelow ? '8px' : '-8px'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-800 text-sm">{hoveredSchedule.plantName}</h4>
              <span className={`text-xs px-2 py-1 rounded ${careTypeColors[hoveredSchedule.careType]}`}>
                {hoveredSchedule.careType}
              </span>
            </div>
            {hoveredSchedule.description && (
              <p className="text-xs text-gray-600">{hoveredSchedule.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>📅 {new Date(hoveredSchedule.scheduledDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded ${
                hoveredSchedule.priority === 'high' ? 'bg-red-100 text-red-700' :
                hoveredSchedule.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {hoveredSchedule.priority} priority
              </span>
              <span className="text-gray-500">
                {hoveredSchedule.frequency}
              </span>
            </div>
            {hoveredSchedule.completed && (
              <div className="text-xs text-green-600 font-medium">✓ Completed</div>
            )}
            {hoveredSchedule.notes && (
              <p className="text-xs text-gray-500 italic border-t pt-2 mt-2">
                {hoveredSchedule.notes}
              </p>
            )}
          </div>
          {/* Arrow - only show when tooltip is above */}
          {!hoverPosition.showBelow && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-200"></div>
            </div>
          )}
          {/* Arrow - show when tooltip is below */}
          {hoverPosition.showBelow && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-200"></div>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingSchedule ? "Edit Schedule" : "Add Care Task"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddSchedule} className="space-y-4">
                {/* Plant Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Plant *
                  </label>
                  <select
                    name="plantId"
                    value={formData.plantId}
                    onChange={handlePlantSelect}
                    disabled={loadingPlants}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingPlants ? "Loading plants..." : "Choose a plant..."}
                    </option>
                    {userPlants.map((plant) => (
                      <option key={plant._id} value={plant._id}>
                        {plant.customName || plant.actualName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Care Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Care Type *
                  </label>
                  <select
                    name="careType"
                    value={formData.careType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="watering">💧 Watering</option>
                    <option value="pruning">✂️ Pruning</option>
                    <option value="fertilizer">🧪 Fertilizer</option>
                    <option value="repotting">🪴 Repotting</option>
                    <option value="pest-check">🐛 Pest Check</option>
                    <option value="spraying">💨 Spraying</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Full watering"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date * (Today or Future)
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="once">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any notes..."
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                  >
                    {editingSchedule ? "Update" : "Add Task"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
