const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

const authMiddleware = require("../middleware/authMiddleware");
const adminRole = require("../middleware/adminRole");

// =========================
// Apply auth + role middleware to ALL admin routes
// =========================
router.use(authMiddleware);
router.use(adminRole("super_admin", "event_admin"));

// =========================
// READ All Events (Admin only)
// =========================
router.get("/", async (req, res) => {
  try {
    const events = await Event.findAll({ order: [["date", "DESC"]] });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// READ Single Event (Admin only)
// =========================
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// CREATE Event
// =========================
router.post("/", async (req, res) => {
  try {
    const { title, date, time, location } = req.body;

    if (!title || !date || !time || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const event = await Event.create({ title, date, time, location });
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// UPDATE Event
// =========================
router.put("/:id", async (req, res) => {
  try {
    const { title, date, time, location } = req.body;

    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await event.update({ title, date, time, location });
    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// DELETE Event
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    await event.destroy();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
