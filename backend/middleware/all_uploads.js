const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================
// Helper: Create folder if not exists
// =========================
function ensureDirExists(uploadPath) {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log("Created folder:", uploadPath);
  } else {
    console.log("Upload path exists:", uploadPath);
  }
}

// =========================
// Storage settings for NEWS
// =========================
const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/news");
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// =========================
// Storage settings for HIGHLIGHTS
// =========================
const highlightsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/highlights");
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
// =========================
// Storage settings for PDFS
// =========================
const pdfsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/pdfs");
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// =========================
// File filters 
// =========================
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// =========================
// Export uploaders
// =========================
const uploadNews = multer({ storage: newsStorage, fileFilter: imageFileFilter });
const uploadHighlights = multer({ storage: highlightsStorage, fileFilter: imageFileFilter });
const uploadPdfs = multer({ storage: pdfsStorage, fileFilter: pdfFileFilter });

module.exports = { uploadNews, uploadHighlights, uploadPdfs };