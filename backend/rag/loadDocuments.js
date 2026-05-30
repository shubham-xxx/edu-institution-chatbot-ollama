const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

const loadPDFText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};

const loadDocuments = async () => {
  try {
    const documentsPath = path.join(__dirname, "../documents");

    if (!fs.existsSync(documentsPath)) {
      console.log("Documents folder not found.");
      return;
    }

    const files = fs.readdirSync(documentsPath);

    const pdfFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      console.log("No PDF files found in documents folder.");
      return;
    }

    for (const file of pdfFiles) {
      const fullPath = path.join(documentsPath, file);

      const text = await loadPDFText(fullPath);

      console.log("\n==============================");
      console.log(`Loaded PDF: ${file}`);
      console.log("==============================\n");

      console.log(text.substring(0, 1500));
    }
  } catch (error) {
    console.error("PDF loading failed:", error.message);
  }
};

loadDocuments();