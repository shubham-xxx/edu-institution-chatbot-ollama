const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DOCUMENTS_DIR = path.join(__dirname, "../documents");
const TEMP_IMAGES_DIR = path.join(__dirname, "../temp-images");
const OCR_OUTPUT_DIR = path.join(__dirname, "../ocr-output");

// If commands are not available globally, replace these with full paths:
// Example:
// const PDFTOPPM_PATH = "C:\\poppler\\Library\\bin\\pdftoppm.exe";
// const TESSERACT_PATH = "C:\\Program Files\\Tesseract-OCR\\tesseract.exe";

const PDFTOPPM_PATH = "pdftoppm";
const TESSERACT_PATH = "tesseract";

const ensureFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const cleanFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) return;

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    fs.unlinkSync(path.join(folderPath, file));
  }
};

const convertPdfToImages = (pdfPath, outputPrefix) => {
  console.log("Converting PDF pages to images...");

  execFileSync(PDFTOPPM_PATH, [
    "-png",
    "-r",
    "300",
    pdfPath,
    outputPrefix,
  ]);

  console.log("PDF converted to images.");
};

const runOCRonImage = (imagePath) => {
  console.log(`Running OCR on: ${path.basename(imagePath)}`);

  const outputBase = imagePath.replace(path.extname(imagePath), "");

  execFileSync(TESSERACT_PATH, [
    imagePath,
    outputBase,
    "-l",
    "eng",
  ]);

  const txtPath = `${outputBase}.txt`;

  if (!fs.existsSync(txtPath)) {
    return "";
  }

  return fs.readFileSync(txtPath, "utf-8");
};

const ocrPDF = async () => {
  try {
    ensureFolder(TEMP_IMAGES_DIR);
    ensureFolder(OCR_OUTPUT_DIR);

    const pdfFiles = fs
      .readdirSync(DOCUMENTS_DIR)
      .filter((file) => file.toLowerCase().endsWith(".pdf"));

    if (pdfFiles.length === 0) {
      console.log("No PDF files found in documents folder.");
      return;
    }

    for (const pdfFile of pdfFiles) {
      console.log("\n==================================");
      console.log(`OCR Processing: ${pdfFile}`);
      console.log("==================================");

      cleanFolder(TEMP_IMAGES_DIR);

      const pdfPath = path.join(DOCUMENTS_DIR, pdfFile);
      const baseName = path.parse(pdfFile).name;
      const imagePrefix = path.join(TEMP_IMAGES_DIR, baseName);

      convertPdfToImages(pdfPath, imagePrefix);

      const imageFiles = fs
        .readdirSync(TEMP_IMAGES_DIR)
        .filter((file) => file.toLowerCase().endsWith(".png"))
        .sort();

      let fullText = "";

      for (const imageFile of imageFiles) {
        const imagePath = path.join(TEMP_IMAGES_DIR, imageFile);
        const pageText = runOCRonImage(imagePath);

        fullText += `\n\n--- Page: ${imageFile} ---\n\n`;
        fullText += pageText;
      }

      const outputTextPath = path.join(OCR_OUTPUT_DIR, `${baseName}.txt`);

      fs.writeFileSync(outputTextPath, fullText, "utf-8");

      console.log("\nOCR completed successfully!");
      console.log(`Text saved at: ${outputTextPath}`);
      console.log(`Extracted characters: ${fullText.length}`);
    }
  } catch (error) {
    console.error("OCR failed:", error.message);

    console.log("\nPossible fixes:");
    console.log("1. Make sure Tesseract is installed.");
    console.log("2. Make sure Poppler is installed.");
    console.log("3. Make sure pdftoppm and tesseract are available in PATH.");
    console.log("4. If not in PATH, use full executable paths inside this script.");
  }
};

ocrPDF();