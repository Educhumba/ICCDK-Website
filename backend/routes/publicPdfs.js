const express = require("express");
const router = express.Router();
const Pdf = require("../models/Pdfs");
const path = require("path");

// GET all PDFs for frontend
router.get("/", async (req, res) => {
  try {
    const pdfs = await Pdf.findAll({
      order: [["uploaded_at", "DESC"]]
    });

    res.json({
      data: pdfs,
      note: "For additional documents, please contact the administrator."
    });
  } catch (err) {
    console.error("Error fetching PDFs:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// Force download route
router.get("/download/:filename", (req, res) => {
  const file = req.params.filename;
  const filePath = path.resolve(__dirname, "../uploads/pdfs", file);
  console.log("Trying to download file at:", filePath);
  res.download(filePath, file, err => {
    if (err) {
      console.error("Download error:", err);
      res.status(404).send("File not found");
    }
  });
});

module.exports = router;