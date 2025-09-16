const express = require("express");
const router = express.Router();
const News = require("../models/News");

// GET news for frontend with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Fetch paginated news
    const newsList = await News.findAll({
      order: [["date", "DESC"]],
      limit,
      offset
    });

    // Count total news for pagination
    const totalNews = await News.count();
    const totalPages = Math.ceil(totalNews / limit);

    res.json({
      data: newsList,
      page,
      pages: totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// GET single news by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const news = await News.findByPk(id); // Sequelize model lookup

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json(news); // return the single news item
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;