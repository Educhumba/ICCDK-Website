const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Pdf = require("../models/Pdfs");
const authMiddleware = require("../middleware/authMiddleware");
const adminRole = require("../middleware/adminRole");
const { uploadPdfs } = require("../middleware/all_uploads");

// =========================
// Protect all routes: only Super Admin + Content Admin
// =========================
router.use(authMiddleware);
router.use(adminRole("super_admin", "content_admin"));

// =========================
// CREATE PDF
// =========================
router.post("/", (req, res) => {
  uploadPdfs.single("pdfFile")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title, description, date } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });
      if (!req.file) return res.status(400).json({ error: "PDF file is required" });

      const pdf = await Pdf.create({
        title,
        description,
        file_path: req.file.filename,
        original_name: req.file.originalname,
        date,
      });

      res.status(201).json({ message: "PDF uploaded successfully", pdf });
    } catch (err) {
      console.error("DB error:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  });
});

// =========================
// READ all PDFs
// =========================
router.get("/", async (req, res) => {
  try {
    const pdfs = await Pdf.findAll({ order: [["uploaded_at", "DESC"]] });
    res.json(pdfs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// UPDATE PDF
// =========================
router.put("/:id", (req, res) => {
  uploadPdfs.single("pdfFile")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title, description, date } = req.body;
      const pdf = await Pdf.findByPk(req.params.id);
      if (!pdf) return res.status(404).json({ error: "PDF not found" });

      // Remove old file if new one uploaded
      if (req.file && pdf.file_path) {
        const oldFilePath = path.join(__dirname, "../../uploads/pdfs", pdf.file_path);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }

      await pdf.update({
        title,
        description,
        date,
        file_path: req.file ? req.file.filename : pdf.file_path,
        original_name: req.file ? req.file.originalname : pdf.original_name,
      });

      res.json({ message: "PDF updated successfully", pdf });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
});

// =========================
// DELETE PDF
// =========================
router.delete("/:id", async (req, res) => {
  try {
    const pdf = await Pdf.findByPk(req.params.id);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    if (pdf.file_path) {
      const filePath = path.join(__dirname, "../../uploads/pdfs", pdf.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pdf.destroy();
    res.json({ message: "PDF deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
