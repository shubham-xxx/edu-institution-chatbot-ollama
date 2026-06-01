const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  listDocuments,
  uploadDocument,
  rebuildVectorStore,
} = require("../controllers/documentController");

const router = express.Router();

const documentsDir = path.join(__dirname, "../documents");

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}-${safeOriginalName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

router.get("/", listDocuments);

router.post("/upload", upload.single("pdf"), uploadDocument);

router.post("/rebuild", rebuildVectorStore);

module.exports = router;