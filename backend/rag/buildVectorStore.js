const fs = require("fs");
const path = require("path");
const axios = require("axios");
const pdf = require("pdf-parse");

const OLLAMA_EMBEDDING_URL = "http://localhost:11434/api/embeddings";
const EMBEDDING_MODEL = "nomic-embed-text";

const DOCUMENTS_DIR = path.join(__dirname, "../documents");
const OCR_OUTPUT_DIR = path.join(__dirname, "../ocr-output");
const VECTOR_STORE_PATH = path.join(__dirname, "vectorStore.json");

const loadPDFText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text || "";
};

const loadTXTText = (filePath) => {
  return fs.readFileSync(filePath, "utf-8");
};

const normalizeText = (text) => {
  return text
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const chunkText = (text, chunkSize = 900, overlap = 150) => {
  const chunks = [];
  const cleanText = normalizeText(text);

  console.log(`Clean text length before chunking: ${cleanText.length}`);

  if (cleanText.length < 50) {
    return chunks;
  }

  let start = 0;

  while (start < cleanText.length) {
    const end = start + chunkSize;
    const chunk = cleanText.slice(start, end).trim();

    if (chunk.length >= 50) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
};

const createEmbedding = async (text) => {
  const response = await axios.post(OLLAMA_EMBEDDING_URL, {
    model: EMBEDDING_MODEL,
    prompt: text,
  });

  return response.data.embedding;
};

const collectDocuments = async () => {
  const docs = [];

  console.log("\nChecking document folders...");
  console.log("Documents folder:", DOCUMENTS_DIR);
  console.log("OCR output folder:", OCR_OUTPUT_DIR);

  if (fs.existsSync(DOCUMENTS_DIR)) {
    const pdfFiles = fs
      .readdirSync(DOCUMENTS_DIR)
      .filter((file) => file.toLowerCase().endsWith(".pdf"));

    console.log(`PDF files found: ${pdfFiles.length}`);

    for (const file of pdfFiles) {
      const filePath = path.join(DOCUMENTS_DIR, file);
      const text = await loadPDFText(filePath);

      docs.push({
        source: file,
        text,
        type: "pdf-parse",
      });
    }
  } else {
    console.log("Documents folder does not exist.");
  }

  if (fs.existsSync(OCR_OUTPUT_DIR)) {
    const txtFiles = fs
      .readdirSync(OCR_OUTPUT_DIR)
      .filter((file) => file.toLowerCase().endsWith(".txt"));

    console.log(`OCR text files found: ${txtFiles.length}`);

    for (const file of txtFiles) {
      const filePath = path.join(OCR_OUTPUT_DIR, file);
      const text = loadTXTText(filePath);

      docs.push({
        source: file,
        text,
        type: "ocr-txt",
      });
    }
  } else {
    console.log("OCR output folder does not exist.");
  }

  return docs;
};

const buildVectorStore = async () => {
  try {
    console.log("Starting vector store build...");

    const documents = await collectDocuments();

    if (documents.length === 0) {
      console.log("No PDF or OCR text documents found.");
      return;
    }

    const vectorStore = [];

    for (const doc of documents) {
      const cleanText = normalizeText(doc.text);

      console.log("\n==============================");
      console.log(`Processing: ${doc.source}`);
      console.log(`Type: ${doc.type}`);
      console.log(`Raw characters: ${doc.text.length}`);
      console.log(`Clean characters: ${cleanText.length}`);
      console.log("Preview:");
      console.log(cleanText.substring(0, 500));
      console.log("==============================");

      if (cleanText.length < 50) {
        console.log("Skipped: extracted text is too small.");
        continue;
      }

      const chunks = chunkText(cleanText);

      console.log(`Chunks created: ${chunks.length}`);

      for (let i = 0; i < chunks.length; i++) {
        console.log(`Creating embedding ${i + 1}/${chunks.length}`);

        const embedding = await createEmbedding(chunks[i]);

        vectorStore.push({
          id: `${doc.source}-chunk-${i + 1}`,
          source: doc.source,
          type: doc.type,
          chunkIndex: i + 1,
          text: chunks[i],
          embedding,
        });
      }
    }

    fs.writeFileSync(
      VECTOR_STORE_PATH,
      JSON.stringify(vectorStore, null, 2),
      "utf-8"
    );

    console.log("\nVector store created successfully!");
    console.log(`Saved at: ${VECTOR_STORE_PATH}`);
    console.log(`Total chunks stored: ${vectorStore.length}`);
  } catch (error) {
    console.error("Vector store build failed:", error.message);

    if (error.response?.data) {
      console.error("Ollama response:", error.response.data);
    }
  }
};

buildVectorStore();