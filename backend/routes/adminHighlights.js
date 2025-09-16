const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Highlights = require("../models/Highlights");
const authMiddleware = require("../middleware/authMiddleware");
const adminRole = require("../middleware/adminRole");
const { uploadHighlights } = require("../middleware/all_uploads");
const { v4: uuidv4 } = require("uuid");

// =========================
// Protect all routes: only Super Admin + Content Admin
// =========================
router.use(authMiddleware);
router.use(adminRole("super_admin", "content_admin"));

// =========================
// CREATE highlights (batch upload)
// =========================
router.post("/", (req, res) => {
  uploadHighlights.array("highlightImages", 10)(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { eventName, eventLink, imageTitle } = req.body;
      if (!eventName || !eventLink) {
        return res.status(400).json({ error: "Event name and event link are required" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "At least one highlight image is required" });
      }

      const titles = Array.isArray(imageTitle) ? imageTitle : [imageTitle];
      if (titles.length !== req.files.length) {
        // Cleanup uploaded files
        req.files.forEach((file) => {
          const filePath = path.join(__dirname, "../../uploads/highlights", file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        return res.status(400).json({ error: "Each uploaded image must have a corresponding title" });
      }

      const batchId = uuidv4(); // unique group ID for this batch

      const highlights = req.files.map((file, index) => ({
        batchId,
        eventName,
        eventLink,
        title: titles[index].trim(),
        image: file.filename,
      }));

      const createdHighlights = await Highlights.bulkCreate(highlights);

      res.status(201).json({
        message: "Highlights uploaded successfully",
        batchId,
        highlights: createdHighlights,
      });
    } catch (err) {
      console.error("DB error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });
});

// =========================
// READ all highlights
// =========================
router.get("/", async (req, res) => {
  try {
    const highlights = await Highlights.findAll({ order: [["uploaded_at", "DESC"]] });
    res.json(highlights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// UPDATE highlight
// =========================
router.put("/:id", uploadHighlights.single("highlightImage"), async (req, res) => {
  try {
    const { title } = req.body;
    const highlight = await Highlights.findByPk(req.params.id);
    if (!highlight) return res.status(404).json({ error: "Highlight not found" });

    if (req.file && highlight.image) {
      const oldImagePath = path.join(__dirname, "../../uploads/highlights", highlight.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    await highlight.update({
      title,
      image: req.file ? req.file.filename : highlight.image,
    });

    res.json({ message: "Highlight updated successfully", highlight });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// DELETE highlight
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const highlight = await Highlights.findByPk(req.params.id);
    if (!highlight) return res.status(404).json({ error: "Highlight not found" });

    if (highlight.image) {
      const imagePath = path.join(__dirname, "../../uploads/highlights", highlight.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await highlight.destroy();
    res.json({ message: "Highlight deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
