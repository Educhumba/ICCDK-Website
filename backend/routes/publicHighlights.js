const express = require("express");
const router = express.Router();
const Highlights = require("../models/Highlights");

// GET all highlights for frontend
router.get("/", async (req, res) => {
  try {
    const highlights = await Highlights.findAll({
      order: [["uploaded_at", "DESC"]],
    });

    // Group by batchId
    const grouped = {};
    highlights.forEach((hl) => {
      if (!grouped[hl.batchId]) {
        grouped[hl.batchId] = {
          batchId: hl.batchId,
          eventName: hl.eventName,
          eventLink: hl.eventLink,
          uploaded_at: hl.uploaded_at,
          images: [],
        };
      }
      grouped[hl.batchId].images.push({
        id: hl.id,
        title: hl.title,
        image: hl.image,
      });
    });

    res.json({
      data: Object.values(grouped),
      note: "For full gallery, visit the external drive link.",
    });
  } catch (err) {
    console.error("Error fetching highlights:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single highlight batch by batchId
router.get("/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    const highlights = await Highlights.findAll({
      where: { batchId },
      order: [["uploaded_at", "DESC"]],
    });

    if (!highlights || highlights.length === 0) {
      return res.status(404).json({ error: "No highlights found for this event." });
    }

    // Use first record for event-level info
    const eventData = {
      batchId,
      eventName: highlights[0].eventName,
      eventLink: highlights[0].eventLink,
      uploaded_at: highlights[0].uploaded_at,
      images: highlights.map((hl) => ({
        id: hl.id,
        title: hl.title,
        image: hl.image,
      })),
    };

    res.json(eventData);
  } catch (err) {
    console.error("Error fetching single highlight:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
