const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const News = require("../models/News");
const authMiddleware = require("../middleware/authMiddleware");
const adminRole = require("../middleware/adminRole");
const { uploadNews } = require("../middleware/all_uploads");

// =========================
// Protect all routes: only Super Admin + Content Admin
// =========================
router.use(authMiddleware);
router.use(adminRole("super_admin", "content_admin"));

// =========================
// CREATE news
// =========================
router.post("/", (req, res) => {
  uploadNews.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title, content, author, date } = req.body;
      if (!title || !content)
        return res.status(400).json({ error: "Title and content required" });

      const news = await News.create({
        title,
        content,
        author,
        date,
        image: req.file ? req.file.filename : null,
      });

      res.status(201).json({ message: "News posted successfully", news });
    } catch (err) {
      console.error("DB error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });
});

// =========================
// READ all news
// =========================
router.get("/", async (req, res) => {
  try {
    const newsList = await News.findAll({ order: [["date", "DESC"]] });
    res.json(newsList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// UPDATE news
// =========================
router.put("/:id", (req, res) => {
  uploadNews.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title, content, author, date } = req.body;
      const news = await News.findByPk(req.params.id);
      if (!news) return res.status(404).json({ error: "News not found" });

      if (req.file && news.image) {
        const oldImagePath = path.join(__dirname, "../../uploads/news", news.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      await news.update({
        title,
        content,
        author,
        date,
        image: req.file ? req.file.filename : news.image,
      });

      res.json({ message: "News updated successfully", news });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
});

// =========================
// DELETE news
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) return res.status(404).json({ error: "News not found" });

    if (news.image) {
      const imagePath = path.join(__dirname, "../../uploads/news", news.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await news.destroy();
    res.json({ message: "News deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
