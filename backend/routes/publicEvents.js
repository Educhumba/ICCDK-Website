const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration"); 

// GET events (with optional filter + pagination)
router.get("/", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const { rows: events, count: total } = await Event.findAndCountAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: events,
    });
  } catch (error) {
    console.error("Error fetching public events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET single event
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

module.exports = router;
