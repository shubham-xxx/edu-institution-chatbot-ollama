const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const DOCUMENTS_DIR = path.join(__dirname, "../documents");
const VECTOR_STORE_PATH = path.join(__dirname, "../rag/vectorStore.json");

const listDocuments = async (req, res) => {
  try {
    if (!fs.existsSync(DOCUMENTS_DIR)) {
      fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(DOCUMENTS_DIR).map((file) => {
      const filePath = path.join(DOCUMENTS_DIR, file);
      const stats = fs.statSync(filePath);

      return {
        name: file,
        size: stats.size,
        uploadedAt: stats.birthtime,
      };
    });

    return res.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error("List documents error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to list documents.",
    });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file uploaded.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "PDF uploaded successfully.",
      file: {
        originalName: req.file.originalname,
        savedName: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to upload document.",
    });
  }
};

const runNodeScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    execFile("node", [scriptPath], {
      cwd: path.join(__dirname, ".."),
      windowsHide: true,
    }, (error, stdout, stderr) => {
      if (error) {
        reject({
          message: error.message,
          stdout,
          stderr,
        });
        return;
      }

      resolve({
        stdout,
        stderr,
      });
    });
  });
};

const rebuildVectorStore = async (req, res) => {
  try {
    const ocrScriptPath = path.join(__dirname, "../rag/ocrPdf.js");
    const vectorScriptPath = path.join(__dirname, "../rag/buildVectorStore.js");

    console.log("Starting OCR process...");
    const ocrResult = await runNodeScript(ocrScriptPath);

    console.log("Starting vector store build...");
    const vectorResult = await runNodeScript(vectorScriptPath);

    let vectorCount = 0;

    if (fs.existsSync(VECTOR_STORE_PATH)) {
      const raw = fs.readFileSync(VECTOR_STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      vectorCount = Array.isArray(parsed) ? parsed.length : 0;
    }

    return res.json({
      success: true,
      message: "OCR and vector store rebuild completed.",
      vectorCount,
      logs: {
        ocr: ocrResult.stdout,
        vectorBuild: vectorResult.stdout,
      },
    });
  } catch (error) {
    console.error("Rebuild vector store error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to rebuild vector store.",
      details: error,
    });
  }
};

module.exports = {
  listDocuments,
  uploadDocument,
  rebuildVectorStore,
};